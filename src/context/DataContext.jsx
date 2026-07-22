import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { studentService, teacherService, metaService } from '../services/studentService';
import { attendanceService } from '../services/attendanceService';
import { activityService, notificationService, settingsService } from '../services/index';
import { ensureSeeded } from '../services/seed';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  ensureSeeded();
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const value = useMemo(() => {
    const students = studentService.list();
    const teachers = teacherService.list();
    const attendance = attendanceService.list();
    const departments = metaService.departments();
    const subjects = metaService.subjects();
    const classes = metaService.classes();
    const activity = activityService.list();
    const notifications = notificationService.list();
    const settings = settingsService.get();
    const stats = attendanceService.stats();

    return {
      tick,
      refresh,
      students,
      teachers,
      attendance,
      departments,
      subjects,
      classes,
      activity,
      notifications,
      settings,
      stats,
      studentService,
      teacherService,
      metaService,
      attendanceService,
      notificationService,
      settingsService,
    };
  }, [tick, refresh]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
