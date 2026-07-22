import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, Badge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Table, Pagination } from '../components/ui/Table';

const emptyForm = {
  name: '', rollNo: '', email: '', phone: '', departmentId: '', year: 1, section: 'A', classId: '', address: '', photo: '',
};

export default function Students() {
  const { students, departments, classes, studentService, refresh } = useData();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmId, setConfirmId] = useState(null);
  const pageSize = 6;

  const filtered = useMemo(() => {
    let list = [...students];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      );
    }
    if (dept !== 'all') list = list.filter((s) => s.departmentId === dept);
    list.sort((a, b) => {
      if (sort === 'roll') return a.rollNo.localeCompare(b.rollNo);
      if (sort === 'year') return a.year - b.year;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [students, query, dept, sort]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const deptName = (id) => departments.find((d) => d.id === id)?.code || '—';

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ ...emptyForm, ...s });
    setModal(true);
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    try {
      if (editing) {
        studentService.update(editing.id, form);
        toast('Student updated', 'success');
      } else {
        studentService.create(form);
        toast('Student added', 'success');
      }
      refresh();
      setModal(false);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Student',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {r.photo ? <img src={r.photo} alt="" className="h-full w-full object-cover" /> : r.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'rollNo', label: 'Roll' },
    { key: 'dept', label: 'Dept', render: (r) => deptName(r.departmentId) },
    { key: 'year', label: 'Year', render: (r) => `${r.year}${r.section}` },
    {
      key: 'face',
      label: 'Face',
      render: (r) => (r.faceDescriptor ? <Badge tone="success">Registered</Badge> : <Badge>Pending</Badge>),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-1">
          <Link to={`/app/students/${r.id}`} className="p-2 rounded-xl hover:bg-primary/10 text-primary" title="View"><FiEye /></Link>
          <button type="button" className="p-2 rounded-xl hover:bg-primary/10" onClick={() => openEdit(r)} title="Edit"><FiEdit2 /></button>
          <button type="button" className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500" onClick={() => setConfirmId(r.id)} title="Delete"><FiTrash2 /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Manage profiles, faces, and enrollment"
        actions={<Button onClick={openCreate}><FiPlus /> Add student</Button>}
      />

      <div className="grid sm:grid-cols-4 gap-3 mb-4">
        <div className="sm:col-span-2 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search name, roll, email…"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <Select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}>
          <option value="all">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">Sort by name</option>
          <option value="roll">Sort by roll</option>
          <option value="year">Sort by year</option>
        </Select>
      </div>

      <Table columns={columns} rows={pageRows} />
      <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit student' : 'Add student'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Roll number" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select label="Department" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
            <option value="">Select</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Select label="Class" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
            <option value="">Select</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Year" type="number" min={1} max={4} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          <Input label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
          <div className="sm:col-span-2">
            <Textarea label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Profile photo</label>
            <input type="file" accept="image/*" onChange={onPhoto} className="text-sm" />
            {form.photo && <img src={form.photo} alt="Preview" className="mt-2 h-20 w-20 rounded-2xl object-cover" />}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        title="Delete student?"
        message="This will remove the student and cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          studentService.remove(confirmId);
          refresh();
          toast('Student deleted', 'warning');
        }}
      />
    </div>
  );
}
