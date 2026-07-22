import { STORAGE_KEYS, read, write, uid, todayISO, downloadBlob } from '../utils/helpers';
import { logActivity } from './seed';
import { studentService } from './studentService';
import { jsPDF } from 'jspdf';

function getAll() {
  return read(STORAGE_KEYS.ATTENDANCE, []);
}

function save(list) {
  write(STORAGE_KEYS.ATTENDANCE, list);
}

export const attendanceService = {
  list() {
    return getAll();
  },

  forDate(date = todayISO()) {
    return getAll().filter((a) => a.date === date);
  },

  forStudent(studentId) {
    return getAll().filter((a) => a.studentId === studentId);
  },

  hasMarkedToday(studentId, date = todayISO()) {
    return getAll().some((a) => a.studentId === studentId && a.date === date);
  },

  mark({ studentId, status = 'present', method = 'manual', subjectId = '', classId = '', markedBy = '', confidence = null, date = todayISO(), force = false }) {
    const list = getAll();
    const existingIdx = list.findIndex((a) => a.studentId === studentId && a.date === date);
    if (existingIdx >= 0 && !force) {
      throw new Error('Attendance already marked for this student today');
    }
    const student = studentService.getById(studentId);
    const record = {
      id: existingIdx >= 0 ? list[existingIdx].id : uid('att'),
      studentId,
      status,
      date,
      method,
      subjectId: subjectId || 'sub_dsa',
      classId: classId || student?.classId || '',
      approved: method !== 'manual' ? true : false,
      markedBy,
      confidence,
      createdAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) list[existingIdx] = record;
    else list.unshift(record);
    save(list);
    logActivity(
      `Attendance ${status} (${method}) — ${student?.name || studentId}`,
      status === 'present' ? 'success' : 'warning',
      markedBy || 'system'
    );
    return record;
  },

  markBulk(studentIds, status, meta = {}) {
    return studentIds.map((id) => {
      try {
        return this.mark({ studentId: id, status, ...meta, force: true });
      } catch (e) {
        return { error: e.message, studentId: id };
      }
    });
  },

  update(id, payload) {
    const list = getAll();
    const idx = list.findIndex((a) => a.id === id);
    if (idx < 0) throw new Error('Record not found');
    list[idx] = { ...list[idx], ...payload, id };
    save(list);
    return list[idx];
  },

  approve(id) {
    return this.update(id, { approved: true });
  },

  remove(id) {
    save(getAll().filter((a) => a.id !== id));
  },

  stats(date = todayISO()) {
    const students = studentService.list();
    const today = this.forDate(date);
    const present = today.filter((a) => a.status === 'present').length;
    const absent = today.filter((a) => a.status === 'absent').length;
    const late = today.filter((a) => a.status === 'late').length;
    const marked = today.length;
    const percentage = students.length ? Math.round((present / students.length) * 100) : 0;

    const monthPrefix = date.slice(0, 7);
    const monthly = getAll().filter((a) => a.date.startsWith(monthPrefix));
    const monthlyPresent = monthly.filter((a) => a.status === 'present').length;
    const monthlyPct = monthly.length ? Math.round((monthlyPresent / monthly.length) * 100) : 0;

    return {
      studentCount: students.length,
      present,
      absent,
      late,
      marked,
      percentage,
      monthlyCount: monthly.length,
      monthlyPct,
      unmarked: Math.max(0, students.length - marked),
    };
  },

  studentPercentage(studentId) {
    const records = this.forStudent(studentId);
    if (!records.length) return 0;
    const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    return Math.round((present / records.length) * 100);
  },

  streak(studentId) {
    const records = this.forStudent(studentId)
      .filter((r) => r.status === 'present' || r.status === 'late')
      .map((r) => r.date)
      .sort()
      .reverse();
    let streak = 0;
    const cursor = new Date();
    for (;;) {
      const key = cursor.toISOString().slice(0, 10);
      if (records.includes(key)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (streak === 0 && key === todayISO()) {
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return streak;
  },

  heatmap(studentId, days = 90) {
    const set = new Map(this.forStudent(studentId).map((r) => [r.date, r.status]));
    const cells = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      cells.push({ date: key, status: set.get(key) || null });
    }
    return cells;
  },

  trendLastDays(days = 7) {
    const result = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const day = this.forDate(key);
      const present = day.filter((a) => a.status === 'present').length;
      const absent = day.filter((a) => a.status === 'absent').length;
      const late = day.filter((a) => a.status === 'late').length;
      result.push({ date: key.slice(5), present, absent, late, total: day.length });
    }
    return result;
  },

  exportCSV(records) {
    const students = studentService.list();
    const map = Object.fromEntries(students.map((s) => [s.id, s]));
    const header = 'Name,Roll No,Status,Date,Method,Confidence,Approved\n';
    const rows = records
      .map((r) => {
        const s = map[r.studentId] || {};
        return `"${s.name || ''}","${s.rollNo || ''}","${r.status}","${r.date}","${r.method}","${r.confidence ?? ''}","${r.approved}"`;
      })
      .join('\n');
    downloadBlob(`attendance_${todayISO()}.csv`, header + rows);
  },

  exportPDF(records, title = 'Attendance Report') {
    const students = studentService.list();
    const map = Object.fromEntries(students.map((s) => [s.id, s]));
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    let y = 36;
    doc.text('Name', 14, y);
    doc.text('Roll', 70, y);
    doc.text('Status', 110, y);
    doc.text('Date', 140, y);
    y += 6;
    records.slice(0, 40).forEach((r) => {
      const s = map[r.studentId] || {};
      doc.text(String(s.name || '').slice(0, 24), 14, y);
      doc.text(String(s.rollNo || ''), 70, y);
      doc.text(r.status, 110, y);
      doc.text(r.date, 140, y);
      y += 6;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save(`attendance_${todayISO()}.pdf`);
  },

  /** Simple heuristic prediction based on recent 7-day rate. */
  predictAttendance(studentId) {
    const recent = this.forStudent(studentId).slice(0, 7);
    if (!recent.length) return { rate: 0, risk: 'unknown', suggestion: 'No history yet.' };
    const good = recent.filter((r) => r.status === 'present' || r.status === 'late').length;
    const rate = Math.round((good / recent.length) * 100);
    let risk = 'low';
    let suggestion = 'Attendance looks healthy. Keep it up.';
    if (rate < 60) {
      risk = 'high';
      suggestion = 'Critical: schedule a counseling session and notify guardian.';
    } else if (rate < 75) {
      risk = 'medium';
      suggestion = 'Below threshold — send a gentle reminder and track next week.';
    }
    return { rate, risk, suggestion };
  },
};
