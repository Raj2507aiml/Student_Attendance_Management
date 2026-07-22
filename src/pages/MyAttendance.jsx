import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, StatCard, Badge, ProgressBar } from '../components/ui/Card';
import { Table } from '../components/ui/Table';

export default function MyAttendance() {
  const { user } = useAuth();
  const { students, attendanceService, attendance } = useData();
  const student = students.find((s) => s.id === user?.studentId) || students.find((s) => s.email === user?.email);

  const records = useMemo(() => {
    if (!student) return [];
    return attendanceService.forStudent(student.id);
  }, [student, attendance, attendanceService]);

  const pct = student ? attendanceService.studentPercentage(student.id) : 0;
  const streak = student ? attendanceService.streak(student.id) : 0;
  const heat = student ? attendanceService.heatmap(student.id, 70) : [];
  const prediction = student ? attendanceService.predictAttendance(student.id) : null;

  if (!student) {
    return (
      <div>
        <PageHeader title="My attendance" subtitle="No linked student profile found for this account." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My attendance" subtitle={`${student.name} · ${student.rollNo}`} />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Attendance %" value={`${pct}%`} accent="success" />
        <StatCard label="Current streak" value={`${streak} days`} accent="accent" />
        <StatCard label="Records" value={records.length} />
      </div>

      {prediction && (
        <Card className="p-5 mb-6">
          <h3 className="font-display font-semibold">AI insight</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">Predicted near-term rate: {prediction.rate}%</p>
          <div className="mt-3"><ProgressBar value={prediction.rate} label={`Risk: ${prediction.risk}`} /></div>
          <p className="text-sm mt-3">{prediction.suggestion}</p>
        </Card>
      )}

      <Card className="p-5 mb-6">
        <h3 className="font-display font-semibold mb-3">Heatmap</h3>
        <div className="flex flex-wrap gap-1">
          {heat.map((c) => (
            <div
              key={c.date}
              title={`${c.date}: ${c.status || 'none'}`}
              className={`h-3 w-3 rounded-sm ${
                c.status === 'present' ? 'bg-emerald-500' : c.status === 'late' ? 'bg-amber-400' : c.status === 'absent' ? 'bg-rose-400' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </Card>

      <Table
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'danger'}>{r.status}</Badge> },
          { key: 'method', label: 'Method' },
          { key: 'confidence', label: 'Confidence', render: (r) => (r.confidence != null ? `${r.confidence}%` : '—') },
        ]}
        rows={records}
      />
    </div>
  );
}
