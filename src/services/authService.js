import { STORAGE_KEYS, read, write, uid } from '../utils/helpers';
import { ensureSeeded, logActivity } from './seed';

ensureSeeded();

export const authService = {
  getUsers() {
    return read(STORAGE_KEYS.USERS, []);
  },

  getSession() {
    return read(STORAGE_KEYS.SESSION, null);
  },

  login(email, password, remember = true) {
    const user = this.getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid email or password');
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      studentId: user.studentId || null,
      teacherId: user.teacherId || null,
      remember,
      at: new Date().toISOString(),
    };
    write(STORAGE_KEYS.SESSION, session);
    logActivity(`${user.name} signed in`, 'success', user.email);
    return { ...session, user };
  },

  signup({ name, email, password, role = 'student' }) {
    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const user = {
      id: uid('user'),
      name,
      email,
      password,
      role,
      avatar: '',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    write(STORAGE_KEYS.USERS, users);
    logActivity(`New ${role} registered: ${name}`, 'info', email);
    return this.login(email, password, true);
  },

  logout() {
    const session = this.getSession();
    if (session) logActivity(`${session.name} signed out`, 'info', session.email);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  updatePassword(userId, currentPassword, newPassword) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx < 0) throw new Error('User not found');
    if (users[idx].password !== currentPassword) throw new Error('Current password is incorrect');
    users[idx].password = newPassword;
    write(STORAGE_KEYS.USERS, users);
    logActivity('Password updated', 'success', users[idx].email);
  },

  resetPasswordRequest(email) {
    const user = this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('No account found with that email');
    return { ok: true, message: `Password reset link sent to ${email} (demo — use your current password).` };
  },
};
