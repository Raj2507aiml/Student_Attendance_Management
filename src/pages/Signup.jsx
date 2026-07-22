import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, ProgressBar } from '../components/ui/Card';
import { passwordStrength } from '../utils/helpers';

export default function Signup() {
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const strength = useMemo(() => passwordStrength(form.password), [form.password]);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (strength.score < 2) e.password = 'Use a stronger password';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast('Account created successfully', 'success');
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
        <h1 className="font-display text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Join Attendly in under a minute</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input label="Full name" icon={FiUser} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Email" type="email" icon={FiMail} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </Select>
          <Input label="Password" type="password" icon={FiLock} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
          {form.password && (
            <div>
              <ProgressBar value={strength.percent} label={`Strength: ${strength.label}`} />
            </div>
          )}
          <Input label="Confirm password" type="password" icon={FiLock} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm} />
          <Button type="submit" className="w-full" loading={loading}>Create account</Button>
        </form>

        <p className="mt-6 text-sm text-center text-[var(--text-muted)]">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </Card>
    </motion.div>
  );
}
