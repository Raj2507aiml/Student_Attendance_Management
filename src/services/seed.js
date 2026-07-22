import { STORAGE_KEYS, read, write, uid, todayISO } from '../utils/helpers';

const DEMO_PASSWORD = {
  admin: 'Admin@123',
  teacher: 'Teacher@123',
  student: 'Student@123',
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function ensureSeeded() {
  if (read(STORAGE_KEYS.SEEDED, false)) return;

  const departments = [
    { id: 'dept_cs', name: 'Computer Science', code: 'CSE' },
    { id: 'dept_ee', name: 'Electrical Engineering', code: 'EEE' },
    { id: 'dept_me', name: 'Mechanical Engineering', code: 'ME' },
  ];

  const subjects = [
    { id: 'sub_dsa', name: 'Data Structures', code: 'CS201', departmentId: 'dept_cs' },
    { id: 'sub_db', name: 'Databases', code: 'CS301', departmentId: 'dept_cs' },
    { id: 'sub_os', name: 'Operating Systems', code: 'CS302', departmentId: 'dept_cs' },
    { id: 'sub_circuit', name: 'Circuit Theory', code: 'EE201', departmentId: 'dept_ee' },
  ];

  const classes = [
    { id: 'cls_cse3a', name: 'CSE 3rd Year A', departmentId: 'dept_cs', year: 3, section: 'A' },
    { id: 'cls_cse2b', name: 'CSE 2nd Year B', departmentId: 'dept_cs', year: 2, section: 'B' },
    { id: 'cls_eee2a', name: 'EEE 2nd Year A', departmentId: 'dept_ee', year: 2, section: 'A' },
  ];

  const students = [
    {
      id: 'stu_1',
      name: 'Aarav Sharma',
      rollNo: 'CSE21001',
      email: 'aarav@college.edu',
      phone: '+91 98765 43210',
      departmentId: 'dept_cs',
      year: 3,
      section: 'A',
      classId: 'cls_cse3a',
      address: '12 MG Road, Bengaluru',
      photo: '',
      faceDescriptor: null,
      createdAt: daysAgo(40),
    },
    {
      id: 'stu_2',
      name: 'Priya Patel',
      rollNo: 'CSE21002',
      email: 'priya@college.edu',
      phone: '+91 98765 43211',
      departmentId: 'dept_cs',
      year: 3,
      section: 'A',
      classId: 'cls_cse3a',
      address: '45 Park Street, Mumbai',
      photo: '',
      faceDescriptor: null,
      createdAt: daysAgo(38),
    },
    {
      id: 'stu_3',
      name: 'Rohan Mehta',
      rollNo: 'CSE22015',
      email: 'rohan@college.edu',
      phone: '+91 98765 43212',
      departmentId: 'dept_cs',
      year: 2,
      section: 'B',
      classId: 'cls_cse2b',
      address: '8 Lake View, Pune',
      photo: '',
      faceDescriptor: null,
      createdAt: daysAgo(30),
    },
    {
      id: 'stu_4',
      name: 'Ananya Iyer',
      rollNo: 'EEE22008',
      email: 'ananya@college.edu',
      phone: '+91 98765 43213',
      departmentId: 'dept_ee',
      year: 2,
      section: 'A',
      classId: 'cls_eee2a',
      address: '22 Beach Road, Chennai',
      photo: '',
      faceDescriptor: null,
      createdAt: daysAgo(25),
    },
    {
      id: 'stu_5',
      name: 'Kabir Singh',
      rollNo: 'CSE21018',
      email: 'kabir@college.edu',
      phone: '+91 98765 43214',
      departmentId: 'dept_cs',
      year: 3,
      section: 'A',
      classId: 'cls_cse3a',
      address: '3 Civil Lines, Delhi',
      photo: '',
      faceDescriptor: null,
      createdAt: daysAgo(20),
    },
    {
      id: 'stu_6',
      name: 'Demo Student',
      rollNo: 'CSE21099',
      email: 'student@attendly.app',
      phone: '+91 90000 00000',
      departmentId: 'dept_cs',
      year: 3,
      section: 'A',
      classId: 'cls_cse3a',
      address: 'Campus Hostel Block C',
      photo: '',
      faceDescriptor: null,
      createdAt: daysAgo(10),
      linkedUserId: 'user_student',
    },
  ];

  const teachers = [
    {
      id: 'tch_1',
      name: 'Dr. Neha Kapoor',
      email: 'teacher@attendly.app',
      phone: '+91 98000 11111',
      departmentId: 'dept_cs',
      subjects: ['sub_dsa', 'sub_db'],
      classes: ['cls_cse3a', 'cls_cse2b'],
      linkedUserId: 'user_teacher',
    },
    {
      id: 'tch_2',
      name: 'Prof. Vikram Rao',
      email: 'vikram@college.edu',
      phone: '+91 98000 22222',
      departmentId: 'dept_ee',
      subjects: ['sub_circuit'],
      classes: ['cls_eee2a'],
    },
  ];

  const users = [
    {
      id: 'user_admin',
      name: 'Admin User',
      email: 'admin@attendly.app',
      password: DEMO_PASSWORD.admin,
      role: 'admin',
      avatar: '',
      createdAt: daysAgo(60),
    },
    {
      id: 'user_teacher',
      name: 'Dr. Neha Kapoor',
      email: 'teacher@attendly.app',
      password: DEMO_PASSWORD.teacher,
      role: 'teacher',
      teacherId: 'tch_1',
      avatar: '',
      createdAt: daysAgo(50),
    },
    {
      id: 'user_student',
      name: 'Demo Student',
      email: 'student@attendly.app',
      password: DEMO_PASSWORD.student,
      role: 'student',
      studentId: 'stu_6',
      avatar: '',
      createdAt: daysAgo(40),
    },
  ];

  const statuses = ['present', 'absent', 'late'];
  const attendance = [];
  students.forEach((stu, si) => {
    for (let d = 0; d < 14; d += 1) {
      if (d === 0 && si > 3) continue;
      const roll = (si + d) % 10;
      let status = 'present';
      if (roll === 0) status = 'absent';
      else if (roll === 1) status = 'late';
      attendance.push({
        id: uid('att'),
        studentId: stu.id,
        status,
        date: daysAgo(d),
        method: d % 3 === 0 ? 'face' : d % 3 === 1 ? 'qr' : 'manual',
        subjectId: 'sub_dsa',
        classId: stu.classId,
        approved: true,
        markedBy: 'user_teacher',
        confidence: d % 3 === 0 ? 92 + (si % 5) : null,
        createdAt: new Date(daysAgo(d)).toISOString(),
      });
    }
  });

  const activity = [
    { id: uid('act'), type: 'info', message: 'System seeded with demo data', at: new Date().toISOString(), user: 'system' },
    { id: uid('act'), type: 'success', message: 'Dr. Neha Kapoor marked attendance for CSE 3A', at: new Date(Date.now() - 3600000).toISOString(), user: 'teacher@attendly.app' },
    { id: uid('act'), type: 'warning', message: 'Low attendance alert: Rohan Mehta (68%)', at: new Date(Date.now() - 7200000).toISOString(), user: 'system' },
  ];

  const notifications = [
    { id: uid('ntf'), title: 'Welcome to Attendly', body: 'Your premium attendance workspace is ready.', read: false, at: new Date().toISOString(), type: 'info' },
    { id: uid('ntf'), title: 'Face models tip', body: 'Register student faces before starting live recognition.', read: false, at: new Date().toISOString(), type: 'info' },
  ];

  write(STORAGE_KEYS.DEPARTMENTS, departments);
  write(STORAGE_KEYS.SUBJECTS, subjects);
  write(STORAGE_KEYS.CLASSES, classes);
  write(STORAGE_KEYS.STUDENTS, students);
  write(STORAGE_KEYS.TEACHERS, teachers);
  write(STORAGE_KEYS.USERS, users);
  write(STORAGE_KEYS.ATTENDANCE, attendance);
  write(STORAGE_KEYS.ACTIVITY, activity);
  write(STORAGE_KEYS.NOTIFICATIONS, notifications);
  write(STORAGE_KEYS.SETTINGS, {
    theme: 'light',
    language: 'en',
    notificationsEnabled: true,
    attendanceThreshold: 75,
  });
  write(STORAGE_KEYS.SEEDED, true);
}

export function logActivity(message, type = 'info', user = 'system') {
  const list = read(STORAGE_KEYS.ACTIVITY, []);
  list.unshift({ id: uid('act'), type, message, at: new Date().toISOString(), user });
  write(STORAGE_KEYS.ACTIVITY, list.slice(0, 200));
}

export { todayISO, DEMO_PASSWORD };
