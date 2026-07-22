import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.resetPasswordRequest(email);
      setSent(true);
      toast(res.message, 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 sm:p-8 glass">
        <h1 className="font-display text-2xl font-semibold">Reset password</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">We will email you a reset link (demo).</p>
        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-emerald-600">Check your inbox for instructions.</p>
            <Link to="/login" className="text-primary text-sm font-medium hover:underline">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input label="Email" type="email" icon={FiMail} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
            <Link to="/login" className="block text-center text-sm text-[var(--text-muted)] hover:text-primary">Back to sign in</Link>
          </form>
        )}
      </Card>
    </motion.div>
  );
}
