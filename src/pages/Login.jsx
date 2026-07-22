import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@attendly.app', password: 'Admin@123', remember: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password, form.remember);
      toast('Welcome back!', 'success');
      navigate('/app');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 sm:p-8 glass">
        <h1 className="font-display text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Access your Attendly workspace</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            icon={FiMail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            icon={FiLock}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="rounded border-[var(--border)]"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" className="w-full" loading={loading}>Sign in</Button>
        </form>

        <p className="mt-6 text-sm text-center text-[var(--text-muted)]">
          New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create account</Link>
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-primary/5 p-3 text-xs text-[var(--text-muted)] space-y-1">
          <p className="font-medium text-[var(--text)]">Demo accounts</p>
          <p>admin@attendly.app / Admin@123</p>
          <p>teacher@attendly.app / Teacher@123</p>
          <p>student@attendly.app / Student@123</p>
        </div>
      </Card>
    </motion.div>
  );
}
