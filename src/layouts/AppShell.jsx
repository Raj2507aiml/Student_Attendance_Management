import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiUsers, FiCalendar, FiCamera, FiBarChart2, FiSettings,
  FiShield, FiMenu, FiX, FiMoon, FiSun, FiBell, FiSearch, FiLogOut,
  FiChevronLeft, FiChevronRight, FiBookOpen, FiUserCheck, FiActivity,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

const NAV = [
  { to: '/app', label: 'Dashboard', icon: FiHome, end: true, roles: ['admin', 'teacher', 'student'] },
  { to: '/app/students', label: 'Students', icon: FiUsers, roles: ['admin', 'teacher'] },
  { to: '/app/attendance', label: 'Attendance', icon: FiCalendar, roles: ['admin', 'teacher'] },
  { to: '/app/face', label: 'Face Recognition', icon: FiCamera, roles: ['admin', 'teacher'] },
  { to: '/app/reports', label: 'Reports', icon: FiBarChart2, roles: ['admin', 'teacher'] },
  { to: '/app/teacher', label: 'Teacher Panel', icon: FiUserCheck, roles: ['admin', 'teacher'] },
  { to: '/app/admin', label: 'Admin Panel', icon: FiShield, roles: ['admin'] },
  { to: '/app/my-attendance', label: 'My Attendance', icon: FiBookOpen, roles: ['student'] },
  { to: '/app/ai', label: 'AI Insights', icon: FiActivity, roles: ['admin', 'teacher'] },
  { to: '/app/settings', label: 'Settings', icon: FiSettings, roles: ['admin', 'teacher', 'student'] },
];

export function AppShell() {
  const { isAuthenticated, loading, user, logout, role } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { notifications, students, notificationService, refresh } = useData();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !e.target.matches('input, textarea, select')) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const links = useMemo(() => NAV.filter((n) => n.roles.includes(role)), [role]);
  const unread = notifications.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return students
      .filter((s) => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [search, students]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="h-9 w-9 shrink-0 rounded-xl gradient-btn flex items-center justify-center text-white font-display font-bold">A</div>
        {!collapsed && <span className="font-display font-semibold text-lg tracking-tight">Attendly</span>}
      </div>
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text)]'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={item.label}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-[var(--border)]">
        <button
          type="button"
          className="hidden lg:flex w-full items-center justify-center gap-2 rounded-2xl py-2 text-sm text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen app-bg flex">
      <aside
        className={`hidden lg:flex flex-col border-r border-[var(--border)] bg-[var(--sidebar)] sticky top-0 h-screen transition-all duration-300 ${collapsed ? 'w-[76px]' : 'w-[260px]'}`}
      >
        {SidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button type="button" className="fixed inset-0 z-40 bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[260px] bg-[var(--sidebar)] border-r border-[var(--border)] lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
            >
              <button type="button" className="absolute top-4 right-4 p-2" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <FiX />
              </button>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 glass border-b border-[var(--border)] px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button type="button" className="lg:hidden p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <FiMenu />
            </button>
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search students… (press /)"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] pl-9 pr-3 py-2 text-sm"
              />
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl overflow-hidden z-50">
                  {searchResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5"
                      onClick={() => { navigate(`/app/students/${s.id}`); setSearchOpen(false); setSearch(''); }}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-[var(--text-muted)] ml-2">{s.rollNo}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              <button type="button" onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5" aria-label="Toggle theme">
                {isDark ? <FiSun /> : <FiMoon />}
              </button>
              <div className="relative">
                <button type="button" className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 relative" onClick={() => setNotifOpen((v) => !v)} aria-label="Notifications">
                  <FiBell />
                  {unread > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between items-center">
                      <span className="font-medium text-sm">Notifications</span>
                      <button type="button" className="text-xs text-primary" onClick={() => { notificationService.markAllRead(); refresh(); }}>Mark all read</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.slice(0, 8).map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-[var(--border)] last:border-0 ${n.read ? 'opacity-60' : ''}`}>
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button type="button" className="flex items-center gap-2 rounded-2xl px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setProfileOpen((v) => !v)}>
                  <div className="h-8 w-8 rounded-xl gradient-btn text-white text-xs font-semibold flex items-center justify-center">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] capitalize mt-0.5">{user?.role}</p>
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl z-50 overflow-hidden">
                    <Link to="/app/settings" className="block px-4 py-2.5 text-sm hover:bg-primary/5" onClick={() => setProfileOpen(false)}>Profile & Settings</Link>
                    <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/5 flex items-center gap-2" onClick={() => { logout(); navigate('/login'); }}>
                      <FiLogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      <Link
        to="/app/attendance"
        className="no-print fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full gradient-btn shadow-xl flex items-center justify-center text-white lg:hidden"
        aria-label="Quick attendance"
      >
        <FiCalendar size={22} />
      </Link>
    </div>
  );
}
