import { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FiDownload } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { PageHeader, Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';

const COLORS = ['#2563EB', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];

export default function Reports() {
  const { attendance, students, departments, classes, attendanceService } = useData();
  const [range, setRange] = useState('weekly');
  const [dept, setDept] = useState('all');
  const [classId, setClassId] = useState('all');

  const filtered = useMemo(() => {
    const days = range === 'daily' ? 1 : range === 'weekly' ? 7 : range === 'monthly' ? 30 : 365;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    let list = attendance.filter((a) => a.date >= cutoffStr);
    if (dept !== 'all') {
      const ids = new Set(students.filter((s) => s.departmentId === dept).map((s) => s.id));
      list = list.filter((a) => ids.has(a.studentId));
    }
    if (classId !== 'all') list = list.filter((a) => a.classId === classId);
    return list;
  }, [attendance, range, dept, classId, students]);

  const trend = useMemo(() => {
    const map = {};
    filtered.forEach((a) => {
      if (!map[a.date]) map[a.date] = { date: a.date.slice(5), present: 0, absent: 0, late: 0 };
      map[a.date][a.status] = (map[a.date][a.status] || 0) + 1;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  const byDept = useMemo(() => {
    return departments.map((d) => {
      const ids = new Set(students.filter((s) => s.departmentId === d.id).map((s) => s.id));
      const rec = filtered.filter((a) => ids.has(a.studentId));
      const present = rec.filter((a) => a.status === 'present').length;
      return { name: d.code, rate: rec.length ? Math.round((present / rec.length) * 100) : 0 };
    });
  }, [departments, students, filtered]);

  const studentWise = useMemo(() => {
    return students.map((s) => {
      const rec = filtered.filter((a) => a.studentId === s.id);
      const good = rec.filter((a) => a.status === 'present' || a.status === 'late').length;
      return {
        id: s.id,
        name: s.name,
        rollNo: s.rollNo,
        records: rec.length,
        rate: rec.length ? Math.round((good / rec.length) * 100) : 0,
      };
    }).sort((a, b) => a.rate - b.rate);
  }, [students, filtered]);

  const statusPie = [
    { name: 'Present', value: filtered.filter((a) => a.status === 'present').length },
    { name: 'Late', value: filtered.filter((a) => a.status === 'late').length },
    { name: 'Absent', value: filtered.filter((a) => a.status === 'absent').length },
  ];

  return (
    <div>
      <PageHeader
        title="Reports & analytics"
        subtitle="Daily, weekly, monthly, and yearly attendance intelligence"
        actions={
          <>
            <Button variant="secondary" onClick={() => attendanceService.exportCSV(filtered)}><FiDownload /> Export CSV</Button>
            <Button onClick={() => attendanceService.exportPDF(filtered, `${range} Attendance Report`)}><FiDownload /> Export PDF</Button>
          </>
        }
      />

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Select label="Range" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </Select>
        <Select label="Department" value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="all">All</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="all">All</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Records" value={filtered.length} />
        <StatCard label="Present rate" value={`${filtered.length ? Math.round((statusPie[0].value / filtered.length) * 100) : 0}%`} accent="success" />
        <StatCard label="Students covered" value={new Set(filtered.map((a) => a.studentId)).size} accent="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="present" stroke="#2563EB" fill="#2563EB33" />
                <Line type="monotone" dataKey="absent" stroke="#EF4444" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Department wise</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Status distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" outerRadius={90}>
                  {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Line overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="present" stroke="#2563EB" strokeWidth={2} />
                <Line type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <h3 className="font-display font-semibold mb-3">Student-wise rates</h3>
      <Table
        columns={[
          { key: 'name', label: 'Student' },
          { key: 'rollNo', label: 'Roll' },
          { key: 'records', label: 'Records' },
          { key: 'rate', label: 'Rate %', render: (r) => `${r.rate}%` },
        ]}
        rows={studentWise.slice(0, 20)}
      />
    </div>
  );
}
