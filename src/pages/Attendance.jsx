import { useMemo, useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FiDownload, FiPrinter, FiCheck, FiCamera } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, Card, Badge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { todayISO } from '../utils/helpers';

export default function Attendance() {
  const { students, attendance, classes, subjects, attendanceService, refresh } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState('manual');
  const [classId, setClassId] = useState('all');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [date, setDate] = useState(todayISO());
  const [marks, setMarks] = useState({});
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const classStudents = useMemo(
    () => students.filter((s) => classId === 'all' || s.classId === classId),
    [students, classId]
  );

  const history = useMemo(() => {
    let list = attendance.filter((a) => a.date === date);
    if (classId !== 'all') list = list.filter((a) => a.classId === classId);
    return list;
  }, [attendance, date, classId]);

  useEffect(() => {
    const map = {};
    classStudents.forEach((s) => {
      const existing = attendance.find((a) => a.studentId === s.id && a.date === date);
      map[s.id] = existing?.status || '';
    });
    setMarks(map);
  }, [classStudents, attendance, date]);

  const saveManual = () => {
    let count = 0;
    Object.entries(marks).forEach(([studentId, status]) => {
      if (!status) return;
      try {
        attendanceService.mark({
          studentId,
          status,
          method: 'manual',
          subjectId,
          classId: classId === 'all' ? undefined : classId,
          markedBy: user?.email,
          date,
          force: true,
        });
        count += 1;
      } catch (err) {
        toast(err.message, 'error');
      }
    });
    refresh();
    toast(`Saved ${count} attendance records`, 'success');
  };

  const startQr = async () => {
    setScanning(true);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 8, qrbox: 220 },
        (decoded) => {
          try {
            const data = JSON.parse(decoded);
            if (data.type !== 'attendly-student' || !data.id) throw new Error('Invalid QR');
            attendanceService.mark({
              studentId: data.id,
              status: 'present',
              method: 'qr',
              subjectId,
              markedBy: user?.email,
              date,
            });
            refresh();
            toast(`QR verified — attendance marked`, 'success');
          } catch (err) {
            toast(err.message || 'Invalid QR code', 'error');
          }
        }
      );
    } catch (err) {
      toast(err.message || 'Camera permission denied', 'error');
      setScanning(false);
    }
  };

  const stopQr = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => () => { stopQr(); }, []);

  const studentName = (id) => students.find((s) => s.id === id)?.name || id;

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Manual, QR, and history — duplicate marks blocked per day"
        actions={
          <>
            <Button variant="secondary" onClick={() => attendanceService.exportCSV(history)}><FiDownload /> CSV</Button>
            <Button variant="secondary" onClick={() => attendanceService.exportPDF(history)}><FiDownload /> PDF</Button>
            <Button variant="ghost" onClick={() => window.print()}><FiPrinter /> Print</Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: 'manual', label: 'Manual' },
          { id: 'qr', label: 'QR Scan' },
          { id: 'history', label: 'History' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${tab === t.id ? 'gradient-btn' : 'border border-[var(--border)] bg-[var(--bg-card)]'}`}
          >
            {t.label}
          </button>
        ))}
        <a href="/app/face" className="px-4 py-2 rounded-2xl text-sm border border-[var(--border)] bg-[var(--bg-card)] inline-flex items-center gap-2">
          <FiCamera /> Face recognition
        </a>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <label className="text-sm space-y-1">
          <span className="text-[var(--text-muted)]">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-sm" />
        </label>
        <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="all">All classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="Subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>

      {tab === 'manual' && (
        <Card className="p-5">
          <div className="space-y-3">
            {classStudents.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{s.rollNo}</p>
                </div>
                <div className="flex gap-2">
                  {['present', 'late', 'absent'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}
                      className={`px-3 py-1.5 rounded-xl text-xs capitalize border ${
                        marks[s.id] === st
                          ? st === 'present'
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : st === 'late'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-rose-500 text-white border-rose-500'
                          : 'border-[var(--border)]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveManual}><FiCheck /> Save attendance</Button>
          </div>
        </Card>
      )}

      {tab === 'qr' && (
        <Card className="p-5">
          <p className="text-sm text-[var(--text-muted)] mb-4">Scan a student ID QR code to mark present. Duplicate same-day scans are blocked.</p>
          <div id="qr-reader" className="mx-auto max-w-md overflow-hidden rounded-3xl" />
          <div className="mt-4 flex gap-2 justify-center">
            {!scanning ? (
              <Button onClick={startQr}>Start camera</Button>
            ) : (
              <Button variant="danger" onClick={stopQr}>Stop camera</Button>
            )}
          </div>
        </Card>
      )}

      {tab === 'history' && (
        <Table
          columns={[
            { key: 'student', label: 'Student', render: (r) => studentName(r.studentId) },
            { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'danger'}>{r.status}</Badge> },
            { key: 'method', label: 'Method' },
            { key: 'date', label: 'Date' },
            { key: 'approved', label: 'Approved', render: (r) => (r.approved ? <Badge tone="success">Yes</Badge> : <Badge tone="warning">Pending</Badge>) },
            {
              key: 'actions',
              label: '',
              render: (r) =>
                !r.approved ? (
                  <Button size="sm" variant="secondary" onClick={() => { attendanceService.approve(r.id); refresh(); toast('Approved', 'success'); }}>Approve</Button>
                ) : null,
            },
          ]}
          rows={history}
        />
      )}
    </div>
  );
}
