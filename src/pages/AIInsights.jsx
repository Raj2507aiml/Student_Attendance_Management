import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiTrendingUp, FiZap } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { PageHeader, Card, Badge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';

export default function AIInsights() {
  const { students, attendanceService, settings } = useData();
  const threshold = settings.attendanceThreshold || 75;

  const insights = useMemo(() => {
    return students.map((s) => {
      const pct = attendanceService.studentPercentage(s.id);
      const pred = attendanceService.predictAttendance(s.id);
      return { ...s, pct, pred };
    }).sort((a, b) => a.pct - b.pct);
  }, [students, attendanceService]);

  const low = insights.filter((s) => s.pct < threshold);
  const atRisk = insights.filter((s) => s.pred.risk === 'high' || s.pred.risk === 'medium');

  return (
    <div>
      <PageHeader
        title="AI insights"
        subtitle="Heuristic predictions, low-attendance alerts, and performance suggestions"
      />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-3 text-amber-600"><FiAlertTriangle size={20} /><h3 className="font-display font-semibold text-[var(--text)]">Low attendance</h3></div>
          <p className="mt-2 text-3xl font-display font-semibold">{low.length}</p>
          <p className="text-sm text-[var(--text-muted)]">Below {threshold}% threshold</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 text-primary"><FiTrendingUp size={20} /><h3 className="font-display font-semibold text-[var(--text)]">Trend watch</h3></div>
          <p className="mt-2 text-3xl font-display font-semibold">{atRisk.length}</p>
          <p className="text-sm text-[var(--text-muted)]">Students with elevated risk</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 text-cyan-600"><FiZap size={20} /><h3 className="font-display font-semibold text-[var(--text)]">Suggestion</h3></div>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Run a face attendance session for classes with &gt;20% unmarked students today, and message guardians of high-risk profiles.
          </p>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <h3 className="font-display font-semibold mb-3">Alerts</h3>
        <div className="space-y-2">
          {low.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{s.pred.suggestion}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="warning">{s.pct}%</Badge>
                <Link to={`/app/students/${s.id}`}><Button size="sm" variant="secondary">View</Button></Link>
              </div>
            </div>
          ))}
          {low.length === 0 && <p className="text-sm text-[var(--text-muted)]">No low-attendance alerts right now.</p>}
        </div>
      </Card>

      <Table
        columns={[
          { key: 'name', label: 'Student' },
          { key: 'rollNo', label: 'Roll' },
          { key: 'pct', label: 'Current %', render: (r) => `${r.pct}%` },
          { key: 'pred', label: 'Predicted %', render: (r) => `${r.pred.rate}%` },
          {
            key: 'risk',
            label: 'Risk',
            render: (r) => (
              <Badge tone={r.pred.risk === 'high' ? 'danger' : r.pred.risk === 'medium' ? 'warning' : 'success'}>
                {r.pred.risk}
              </Badge>
            ),
          },
        ]}
        rows={insights}
      />
    </div>
  );
}
