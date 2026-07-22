import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';


export function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen app-bg grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 60%, white 0, transparent 35%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-display font-bold">A</div>
            <span className="font-display text-2xl font-semibold tracking-tight">Attendly</span>
          </div>
        </div>
        <motion.div
          className="relative z-10 text-white max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="font-display text-4xl font-semibold leading-tight">Attendance that feels like a product, not a project.</h2>
          <p className="mt-4 text-white/80 text-sm leading-relaxed">
            Face recognition, QR check-in, live analytics, and multi-role workspaces — designed for modern campuses.
          </p>
        </motion.div>
        <p className="relative z-10 text-white/60 text-xs">© {new Date().getFullYear()} Attendly</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-btn flex items-center justify-center text-white font-display font-bold">A</div>
            <span className="font-display text-xl font-semibold">Attendly</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
