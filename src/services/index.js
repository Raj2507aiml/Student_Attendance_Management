import { STORAGE_KEYS, read, write, uid } from '../utils/helpers';

export const settingsService = {
  get() {
    return read(STORAGE_KEYS.SETTINGS, {
      theme: 'light',
      language: 'en',
      notificationsEnabled: true,
      attendanceThreshold: 75,
    });
  },
  save(partial) {
    const next = { ...this.get(), ...partial };
    write(STORAGE_KEYS.SETTINGS, next);
    return next;
  },
};

export const notificationService = {
  list() {
    return read(STORAGE_KEYS.NOTIFICATIONS, []);
  },
  add({ title, body, type = 'info' }) {
    const list = this.list();
    list.unshift({ id: uid('ntf'), title, body, type, read: false, at: new Date().toISOString() });
    write(STORAGE_KEYS.NOTIFICATIONS, list.slice(0, 50));
    return list[0];
  },
  markRead(id) {
    const list = this.list().map((n) => (n.id === id ? { ...n, read: true } : n));
    write(STORAGE_KEYS.NOTIFICATIONS, list);
  },
  markAllRead() {
    write(
      STORAGE_KEYS.NOTIFICATIONS,
      this.list().map((n) => ({ ...n, read: true }))
    );
  },
};

export const activityService = {
  list() {
    return read(STORAGE_KEYS.ACTIVITY, []);
  },
};

export const backupService = {
  exportAll() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      users: read(STORAGE_KEYS.USERS, []),
      students: read(STORAGE_KEYS.STUDENTS, []),
      teachers: read(STORAGE_KEYS.TEACHERS, []),
      attendance: read(STORAGE_KEYS.ATTENDANCE, []),
      departments: read(STORAGE_KEYS.DEPARTMENTS, []),
      subjects: read(STORAGE_KEYS.SUBJECTS, []),
      classes: read(STORAGE_KEYS.CLASSES, []),
      activity: read(STORAGE_KEYS.ACTIVITY, []),
      settings: read(STORAGE_KEYS.SETTINGS, {}),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendly-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  async importAll(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.students || !data.users) throw new Error('Invalid backup file');
    write(STORAGE_KEYS.USERS, data.users);
    write(STORAGE_KEYS.STUDENTS, data.students);
    write(STORAGE_KEYS.TEACHERS, data.teachers || []);
    write(STORAGE_KEYS.ATTENDANCE, data.attendance || []);
    write(STORAGE_KEYS.DEPARTMENTS, data.departments || []);
    write(STORAGE_KEYS.SUBJECTS, data.subjects || []);
    write(STORAGE_KEYS.CLASSES, data.classes || []);
    write(STORAGE_KEYS.ACTIVITY, data.activity || []);
    if (data.settings) write(STORAGE_KEYS.SETTINGS, data.settings);
  },
};
