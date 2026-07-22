import { STORAGE_KEYS, read, write, uid } from '../utils/helpers';
import { logActivity } from './seed';

function getAll() {
  return read(STORAGE_KEYS.STUDENTS, []);
}

function save(list) {
  write(STORAGE_KEYS.STUDENTS, list);
}

export const studentService = {
  list() {
    return getAll();
  },

  getById(id) {
    return getAll().find((s) => s.id === id) || null;
  },

  create(payload) {
    const list = getAll();
    if (list.some((s) => s.rollNo.toLowerCase() === payload.rollNo.toLowerCase())) {
      throw new Error('Roll number already exists');
    }
    const student = {
      id: uid('stu'),
      name: payload.name,
      rollNo: payload.rollNo,
      email: payload.email || '',
      phone: payload.phone || '',
      departmentId: payload.departmentId || '',
      year: Number(payload.year) || 1,
      section: payload.section || 'A',
      classId: payload.classId || '',
      address: payload.address || '',
      photo: payload.photo || '',
      faceDescriptor: null,
      createdAt: new Date().toISOString(),
    };
    list.push(student);
    save(list);
    logActivity(`Student added: ${student.name}`, 'success');
    return student;
  },

  update(id, payload) {
    const list = getAll();
    const idx = list.findIndex((s) => s.id === id);
    if (idx < 0) throw new Error('Student not found');
    if (
      payload.rollNo &&
      list.some((s) => s.id !== id && s.rollNo.toLowerCase() === payload.rollNo.toLowerCase())
    ) {
      throw new Error('Roll number already exists');
    }
    list[idx] = { ...list[idx], ...payload, id };
    save(list);
    logActivity(`Student updated: ${list[idx].name}`, 'info');
    return list[idx];
  },

  remove(id) {
    const list = getAll();
    const student = list.find((s) => s.id === id);
    save(list.filter((s) => s.id !== id));
    if (student) logActivity(`Student deleted: ${student.name}`, 'warning');
  },

  saveFaceDescriptor(id, descriptor, photoDataUrl) {
    return this.update(id, {
      faceDescriptor: Array.from(descriptor),
      photo: photoDataUrl || undefined,
      faceRegisteredAt: new Date().toISOString(),
    });
  },
};

export const teacherService = {
  list() {
    return read(STORAGE_KEYS.TEACHERS, []);
  },
  create(payload) {
    const list = this.list();
    const teacher = { id: uid('tch'), ...payload };
    list.push(teacher);
    write(STORAGE_KEYS.TEACHERS, list);
    logActivity(`Teacher added: ${teacher.name}`, 'success');
    return teacher;
  },
  update(id, payload) {
    const list = this.list();
    const idx = list.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error('Teacher not found');
    list[idx] = { ...list[idx], ...payload, id };
    write(STORAGE_KEYS.TEACHERS, list);
    return list[idx];
  },
  remove(id) {
    write(STORAGE_KEYS.TEACHERS, this.list().filter((t) => t.id !== id));
  },
};

export const metaService = {
  departments() {
    return read(STORAGE_KEYS.DEPARTMENTS, []);
  },
  subjects() {
    return read(STORAGE_KEYS.SUBJECTS, []);
  },
  classes() {
    return read(STORAGE_KEYS.CLASSES, []);
  },
  saveDepartments(list) {
    write(STORAGE_KEYS.DEPARTMENTS, list);
  },
  saveSubjects(list) {
    write(STORAGE_KEYS.SUBJECTS, list);
  },
  saveClasses(list) {
    write(STORAGE_KEYS.CLASSES, list);
  },
  addDepartment(name, code) {
    const list = this.departments();
    const item = { id: uid('dept'), name, code };
    list.push(item);
    this.saveDepartments(list);
    return item;
  },
  addSubject(name, code, departmentId) {
    const list = this.subjects();
    const item = { id: uid('sub'), name, code, departmentId };
    list.push(item);
    this.saveSubjects(list);
    return item;
  },
  addClass(name, departmentId, year, section) {
    const list = this.classes();
    const item = { id: uid('cls'), name, departmentId, year, section };
    list.push(item);
    this.saveClasses(list);
    return item;
  },
};
