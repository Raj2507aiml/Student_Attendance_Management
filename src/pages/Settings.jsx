import { useState } from 'react';
import { FiDownload, FiUpload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { backupService } from '../services/index';
import { PageHeader, Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings, settingsService, refresh } = useData();
  const { toast } = useToast();
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [threshold, setThreshold] = useState(settings.attendanceThreshold || 75);
  const [language, setLanguage] = useState(settings.language || 'en');

  const saveGeneral = () => {
    settingsService.save({
      attendanceThreshold: Number(threshold),
      language,
      notificationsEnabled: settings.notificationsEnabled,
    });
    refresh();
    toast('Settings saved', 'success');
  };

  const changePassword = () => {
    if (pwd.next !== pwd.confirm) return toast('Passwords do not match', 'error');
    try {
      authService.updatePassword(user.userId, pwd.current, pwd.next);
      setPwd({ current: '', next: '', confirm: '' });
      toast('Password updated', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await backupService.importAll(file);
      refresh();
      toast('Backup restored — reload recommended', 'success');
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      toast(err.message || 'Import failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Theme, profile, notifications, and data tools" />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h3 className="font-display font-semibold">Appearance</h3>
          <div className="flex gap-2">
            <Button variant={theme === 'light' ? 'primary' : 'secondary'} onClick={() => setTheme('light')}>Light</Button>
            <Button variant={theme === 'dark' ? 'primary' : 'secondary'} onClick={() => setTheme('dark')}>Dark</Button>
          </div>
          <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi (UI labels — demo)</option>
          </Select>
          <Input label="Low attendance threshold (%)" type="number" min={50} max={100} value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => { settingsService.save({ notificationsEnabled: e.target.checked }); refresh(); }}
            />
            Enable notifications
          </label>
          <Button onClick={saveGeneral}>Save preferences</Button>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="font-display font-semibold">Profile</h3>
          <Input label="Name" value={user?.name || ''} readOnly />
          <Input label="Email" value={user?.email || ''} readOnly />
          <Input label="Role" value={user?.role || ''} readOnly className="capitalize" />
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="font-display font-semibold">Change password</h3>
          <Input label="Current password" type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
          <Input label="New password" type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
          <Input label="Confirm new password" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
          <Button onClick={changePassword}>Update password</Button>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="font-display font-semibold">Backup & restore</h3>
          <p className="text-sm text-[var(--text-muted)]">Export all local data as JSON, or restore from a previous backup. Offline-ready for demo sync.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => backupService.exportAll()}><FiDownload /> Export backup</Button>
            <label className="inline-flex">
              <span className="gradient-btn px-4 py-2.5 rounded-2xl text-sm cursor-pointer inline-flex items-center gap-2">
                <FiUpload /> Import backup
              </span>
              <input type="file" accept="application/json" className="hidden" onChange={onImport} />
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}
