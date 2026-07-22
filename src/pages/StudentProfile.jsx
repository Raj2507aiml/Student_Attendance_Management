import { useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FiArrowLeft, FiCamera } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { faceService } from '../services/faceService';
import { PageHeader, Card, Badge, ProgressBar, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { formatDate } from '../utils/helpers';

export default function StudentProfile() {
  const { id } = useParams();
  const { students, departments, attendanceService, refresh } = useData();
  const { toast } = useToast();
  const student = students.find((s) => s.id === id);
  const imgRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [registering, setRegistering] = useState(false);

  const records = useMemo(() => (student ? attendanceService.forStudent(student.id) : []), [student, attendanceService]);
  const pct = student ? attendanceService.studentPercentage(student.id) : 0;
  const streak = student ? attendanceService.streak(student.id) : 0;
  const heat = student ? attendanceService.heatmap(student.id, 84) : [];
  const dept = departments.find((d) => d.id === student?.departmentId);

  if (!student) {
    return (
      <div>
        <p>Student not found.</p>
        <Link to="/app/students" className="text-primary text-sm">Back</Link>
      </div>
    );
  }

  const onRegisterFace = async () => {
    if (!student.photo && !imgRef.current?.src) {
      toast('Upload a profile photo first', 'warning');
      return;
    }
    setRegistering(true);
    setProgress(0);
    try {
      await faceService.loadModels(setProgress);
      const img = imgRef.current;
      await faceService.registerStudentFace(student.id, img, student.photo);
      refresh();
      toast('Face registered successfully', 'success');
    } catch (err) {
      toast(err.message || 'Face registration failed', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const heatColor = (status) => {
    if (status === 'present') return 'bg-emerald-500';
    if (status === 'late') return 'bg-amber-400';
    if (status === 'absent') return 'bg-rose-400';
    return 'bg-slate-200 dark:bg-slate-700';
  };

  return (
    <div>
      <Link to="/app/students" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-primary mb-3">
        <FiArrowLeft /> Back to students
      </Link>
      <PageHeader title={student.name} subtitle={`${student.rollNo} · ${dept?.name || '—'} · Year ${student.year}${student.section}`} />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1 space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="h-28 w-28 rounded-3xl overflow-hidden bg-primary/10 flex items-center justify-center text-3xl font-display text-primary">
              {student.photo ? (
                <img ref={imgRef} src={student.photo} alt={student.name} className="h-full w-full object-cover" crossOrigin="anonymous" />
              ) : (
                <span>{student.name.charAt(0)}</span>
              )}
            </div>
            <h2 className="mt-3 font-display font-semibold text-xl">{student.name}</h2>
            <p className="text-sm text-[var(--text-muted)]">{student.email}</p>
            <div className="mt-2">{student.faceDescriptor ? <Badge tone="success">Face registered</Badge> : <Badge tone="warning">Face pending</Badge>}</div>
          </div>
          <div className="text-sm space-y-2">
            <p><span className="text-[var(--text-muted)]">Phone:</span> {student.phone || '—'}</p>
            <p><span className="text-[var(--text-muted)]">Address:</span> {student.address || '—'}</p>
            <p><span className="text-[var(--text-muted)]">Registered:</span> {formatDate(student.createdAt)}</p>
          </div>
          {registering && <ProgressBar value={progress} label="Loading face models" />}
          <Button className="w-full" onClick={onRegisterFace} loading={registering} disabled={!student.photo}>
            <FiCamera /> Register face
          </Button>
          {!student.photo && <p className="text-xs text-amber-600">Add a profile photo from the students list to enable face registration.</p>}
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard label="Attendance %" value={`${pct}%`} />
            <StatCard label="Streak" value={`${streak} days`} accent="success" />
            <StatCard label="Records" value={records.length} accent="accent" />
          </div>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-3">Attendance heatmap</h3>
            <div className="flex flex-wrap gap-1">
              {heat.map((c) => (
                <div key={c.date} title={`${c.date}: ${c.status || 'none'}`} className={`h-3 w-3 rounded-sm ${heatColor(c.status)}`} />
              ))}
            </div>
            <div className="mt-3 flex gap-3 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" /> Present</span>
              <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-amber-400 inline-block" /> Late</span>
              <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-rose-400 inline-block" /> Absent</span>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-4">Student ID card</h3>
            <div className="rounded-3xl border border-[var(--border)] p-5 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1">
                <p className="font-display text-xl font-semibold">Attendly ID</p>
                <p className="mt-2 font-medium">{student.name}</p>
                <p className="text-sm text-[var(--text-muted)]">{student.rollNo}</p>
                <p className="text-sm text-[var(--text-muted)]">{dept?.code} · Y{student.year}{student.section}</p>
              </div>
              <div className="bg-white p-3 rounded-2xl">
                <QRCodeSVG value={JSON.stringify({ type: 'attendly-student', id: student.id, roll: student.rollNo })} size={120} />
              </div>
            </div>
          </Card>

          <div>
            <h3 className="font-display font-semibold mb-3">Attendance history</h3>
            <Table
              columns={[
                { key: 'date', label: 'Date' },
                { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'danger'}>{r.status}</Badge> },
                { key: 'method', label: 'Method' },
                { key: 'confidence', label: 'Confidence', render: (r) => (r.confidence != null ? `${r.confidence}%` : '—') },
              ]}
              rows={records.slice(0, 12)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
