import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FiUsers, FiUserCheck, FiPercent, FiClock, FiUserX, FiCheckCircle, FiCamera, FiCalendar } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader, StatCard, Card, Skeleton, Badge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatDate } from '../utils/helpers';

const COLORS = ['#2563EB', '#06B6D4', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const { stats, teachers, students, activity, attendanceService, attendance } = useData();
  const { role, user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const trend = useMemo(() => attendanceService.trendLastDays(7), [attendance, attendanceService]);
  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Late', value: stats.late },
    { name: 'Absent', value: stats.absent },
    { name: 'Unmarked', value: stats.unmarked },
  ];

  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = attendance.filter((a) => a.date === key && a.status === 'present').length;
      cells.push({ day: d, count, isToday: d === now.getDate() });
    }
    return cells;
  }, [attendance]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Live overview of campus attendance and activity"
        actions={
          role !== 'student' && (
            <>
              <Link to="/app/attendance"><Button variant="secondary">Take attendance</Button></Link>
              <Link to="/app/face"><Button>Face session</Button></Link>
            </>
          )
        }
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard label="Students" value={stats.studentCount} icon={FiUsers} accent="primary" />
        </motion.div>
        <StatCard label="Teachers" value={teachers.length} icon={FiUserCheck} accent="accent" />
        <StatCard label="Today's attendance" value={`${stats.percentage}%`} icon={FiPercent} hint={`${stats.present} present · ${stats.absent} absent`} accent="success" />
        <StatCard label="Monthly rate" value={`${stats.monthlyPct}%`} icon={FiClock} hint={`${stats.monthlyCount} records`} accent="warning" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Present today" value={stats.present} icon={FiCheckCircle} accent="success" />
        <StatCard label="Late today" value={stats.late} icon={FiClock} accent="warning" />
        <StatCard label="Absent today" value={stats.absent} icon={FiUserX} accent="danger" />
      </div>

      <div className="grid xl:grid-cols-3 gap-6 mb-6">
        <Card className="p-5 xl:col-span-2">
          <h3 className="font-display font-semibold mb-4">Attendance trend (7 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="present" stroke="#2563EB" fill="url(#gPresent)" strokeWidth={2} />
                <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Today mix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Daily volume</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="present" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="late" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Calendar</h3>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--text-muted)] mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((c, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg text-xs flex items-center justify-center ${
                  !c ? '' : c.isToday ? 'gradient-btn text-white' : c.count > 0 ? 'bg-primary/15 text-primary' : 'bg-black/5 dark:bg-white/5'
                }`}
                title={c ? `${c.count} present` : ''}
              >
                {c?.day || ''}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Recent activity</h3>
            <Badge tone="info">Live</Badge>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activity.slice(0, 8).map((a) => (
              <div key={a.id} className="flex gap-3 text-sm">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${a.type === 'success' ? 'bg-emerald-500' : a.type === 'warning' ? 'bg-amber-500' : 'bg-primary'}`} />
                <div>
                  <p>{a.message}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(a.at)} · {a.user}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/app/face"><Button variant="secondary" className="w-full" size="sm"><FiCamera /> Face</Button></Link>
            <Link to="/app/reports"><Button variant="secondary" className="w-full" size="sm"><FiCalendar /> Reports</Button></Link>
          </div>
        </Card>
      </div>

      {role === 'student' && (
        <Card className="p-5 mt-6">
          <h3 className="font-display font-semibold">Your quick links</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/app/my-attendance"><Button>View my attendance</Button></Link>
            <Link to="/app/settings"><Button variant="secondary">Profile settings</Button></Link>
          </div>
        </Card>
      )}
    </div>
  );
}
