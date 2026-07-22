import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiBarChart2, FiCheckCircle, FiBookOpen } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, Card, StatCard, Badge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';

export default function TeacherPanel() {
  const { students, classes, attendance, attendanceService, refresh, stats } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const pending = attendance.filter((a) => !a.approved).slice(0, 10);

  const approveAll = () => {
    pending.forEach((a) => attendanceService.approve(a.id));
    refresh();
    toast('All pending attendance approved', 'success');
  };

  return (
    <div>
      <PageHeader
        title="Teacher panel"
        subtitle={`Hello ${user?.name?.split(' ')[0] || 'Teacher'} — manage classes and attendance`}
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="My students" value={students.length} icon={FiUsers} />
        <StatCard label="Classes" value={classes.length} icon={FiBookOpen} accent="accent" />
        <StatCard label="Today %" value={`${stats.percentage}%`} icon={FiCalendar} accent="success" />
        <StatCard label="Pending approvals" value={pending.length} icon={FiCheckCircle} accent="warning" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Link to="/app/students"><Button className="w-full" variant="secondary"><FiUsers /> Manage students</Button></Link>
        <Link to="/app/attendance"><Button className="w-full" variant="secondary"><FiCalendar /> Take attendance</Button></Link>
        <Link to="/app/reports"><Button className="w-full" variant="secondary"><FiBarChart2 /> Generate reports</Button></Link>
        <Link to="/app/face"><Button className="w-full"><FiCheckCircle /> Face attendance</Button></Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Approve attendance</h3>
            <Button size="sm" onClick={approveAll} disabled={!pending.length}>Approve all</Button>
          </div>
          <Table
            columns={[
              { key: 'student', label: 'Student', render: (r) => students.find((s) => s.id === r.studentId)?.name || r.studentId },
              { key: 'status', label: 'Status', render: (r) => <Badge tone="warning">{r.status}</Badge> },
              { key: 'date', label: 'Date' },
              {
                key: 'a',
                label: '',
                render: (r) => (
                  <Button size="sm" variant="secondary" onClick={() => { attendanceService.approve(r.id); refresh(); toast('Approved', 'success'); }}>
                    Approve
                  </Button>
                ),
              },
            ]}
            rows={pending}
            empty="No pending approvals"
          />
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Manage classes</h3>
          <div className="space-y-3">
            {classes.map((c) => (
              <div key={c.id} className="rounded-2xl border border-[var(--border)] p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">Year {c.year}{c.section} · {students.filter((s) => s.classId === c.id).length} students</p>
                </div>
                <Link to="/app/attendance"><Button size="sm" variant="outline">Open</Button></Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
