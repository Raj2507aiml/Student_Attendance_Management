import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, Card, Badge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { ConfirmDialog } from '../components/ui/Modal';
import { activityService } from '../services/index';
import { uid } from '../utils/helpers';

export default function AdminPanel() {
  const { teachers, departments, subjects, classes, students, teacherService, metaService, refresh } = useData();
  const { toast } = useToast();
  const [tab, setTab] = useState('teachers');
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', phone: '', departmentId: '' });
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [subForm, setSubForm] = useState({ name: '', code: '', departmentId: '' });
  const [classForm, setClassForm] = useState({ name: '', departmentId: '', year: 1, section: 'A' });
  const [deleteTeacher, setDeleteTeacher] = useState(null);
  const logs = activityService.list();

  const addTeacher = () => {
    if (!teacherForm.name || !teacherForm.email) return toast('Name and email required', 'error');
    teacherService.create({ ...teacherForm, subjects: [], classes: [] });
    setTeacherForm({ name: '', email: '', phone: '', departmentId: '' });
    refresh();
    toast('Teacher added', 'success');
  };

  return (
    <div>
      <PageHeader title="Admin panel" subtitle="Teachers, departments, subjects, classes, roles & audit logs" />

      <div className="flex flex-wrap gap-2 mb-5">
        {['teachers', 'departments', 'subjects', 'classes', 'roles', 'logs'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-2xl text-sm capitalize ${tab === t ? 'gradient-btn' : 'border border-[var(--border)] bg-[var(--bg-card)]'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'teachers' && (
        <div className="space-y-4">
          <Card className="p-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <Input label="Name" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} />
            <Input label="Email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} />
            <Input label="Phone" value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} />
            <Select label="Department" value={teacherForm.departmentId} onChange={(e) => setTeacherForm({ ...teacherForm, departmentId: e.target.value })}>
              <option value="">Select</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
            <Button onClick={addTeacher}><FiPlus /> Add</Button>
          </Card>
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <button type="button" className="p-2 text-rose-500" onClick={() => setDeleteTeacher(r.id)}><FiTrash2 /></button>
                ),
              },
            ]}
            rows={teachers}
          />
        </div>
      )}

      {tab === 'departments' && (
        <div className="space-y-4">
          <Card className="p-5 flex flex-col sm:flex-row gap-3 items-end">
            <Input label="Name" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="flex-1" />
            <Input label="Code" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} className="flex-1" />
            <Button onClick={() => { metaService.addDepartment(deptForm.name, deptForm.code); setDeptForm({ name: '', code: '' }); refresh(); toast('Department added', 'success'); }}>Add</Button>
          </Card>
          <Table columns={[{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }]} rows={departments} />
        </div>
      )}

      {tab === 'subjects' && (
        <div className="space-y-4">
          <Card className="p-5 grid sm:grid-cols-4 gap-3 items-end">
            <Input label="Name" value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} />
            <Input label="Code" value={subForm.code} onChange={(e) => setSubForm({ ...subForm, code: e.target.value })} />
            <Select label="Department" value={subForm.departmentId} onChange={(e) => setSubForm({ ...subForm, departmentId: e.target.value })}>
              <option value="">Select</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
            <Button onClick={() => { metaService.addSubject(subForm.name, subForm.code, subForm.departmentId); refresh(); toast('Subject added', 'success'); }}>Add</Button>
          </Card>
          <Table columns={[{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }]} rows={subjects} />
        </div>
      )}

      {tab === 'classes' && (
        <div className="space-y-4">
          <Card className="p-5 grid sm:grid-cols-5 gap-3 items-end">
            <Input label="Name" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} />
            <Select label="Department" value={classForm.departmentId} onChange={(e) => setClassForm({ ...classForm, departmentId: e.target.value })}>
              <option value="">Select</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
            <Input label="Year" type="number" value={classForm.year} onChange={(e) => setClassForm({ ...classForm, year: e.target.value })} />
            <Input label="Section" value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} />
            <Button onClick={() => { metaService.addClass(classForm.name, classForm.departmentId, Number(classForm.year), classForm.section); refresh(); toast('Class added', 'success'); }}>Add</Button>
          </Card>
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'year', label: 'Year' },
              { key: 'section', label: 'Section' },
              { key: 'count', label: 'Students', render: (r) => students.filter((s) => s.classId === r.id).length },
            ]}
            rows={classes}
          />
        </div>
      )}

      {tab === 'roles' && (
        <Card className="p-5 space-y-3">
          <p className="text-sm text-[var(--text-muted)]">Role-based access is enforced in routing and navigation.</p>
          {[
            { role: 'Admin', perms: 'Full access — users, departments, reports, settings, logs' },
            { role: 'Teacher', perms: 'Students, attendance, face, reports, class management' },
            { role: 'Student', perms: 'Dashboard, own attendance, profile settings' },
          ].map((r) => (
            <div key={r.role} className="rounded-2xl border border-[var(--border)] p-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{r.role}</p>
                <p className="text-sm text-[var(--text-muted)]">{r.perms}</p>
              </div>
              <Badge tone="info">Active</Badge>
            </div>
          ))}
        </Card>
      )}

      {tab === 'logs' && (
        <Table
          columns={[
            { key: 'type', label: 'Type', render: (r) => <Badge tone={r.type === 'success' ? 'success' : r.type === 'warning' ? 'warning' : 'info'}>{r.type}</Badge> },
            { key: 'message', label: 'Message' },
            { key: 'user', label: 'User' },
            { key: 'at', label: 'When', render: (r) => new Date(r.at).toLocaleString() },
          ]}
          rows={logs.slice(0, 40)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTeacher)}
        onClose={() => setDeleteTeacher(null)}
        title="Remove teacher?"
        message="This teacher will be removed from the directory."
        danger
        confirmLabel="Remove"
        onConfirm={() => { teacherService.remove(deleteTeacher); refresh(); toast('Teacher removed', 'warning'); }}
      />
      {/* silence unused */}
      <span className="hidden">{uid('x')}</span>
    </div>
  );
}
