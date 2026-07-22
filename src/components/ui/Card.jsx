export function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow)] ${hover ? 'transition hover:-translate-y-0.5 hover:shadow-lg' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, hint, accent = 'primary' }) {
  const accents = {
    primary: 'from-primary/15 to-secondary/10 text-primary',
    accent: 'from-accent/15 to-primary/10 text-cyan-600',
    success: 'from-emerald-500/15 to-emerald-400/10 text-emerald-600',
    warning: 'from-amber-500/15 to-amber-400/10 text-amber-600',
    danger: 'from-rose-500/15 to-rose-400/10 text-rose-600',
  };
  return (
    <Card className="p-5" hover>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--text-muted)]">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>}
        </div>
        {Icon && (
          <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </Card>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-rose-500/10 text-rose-600',
    info: 'bg-primary/10 text-primary',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-muted)] max-w-md mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, label }) {
  return (
    <div>
      {label && <div className="mb-1 flex justify-between text-xs text-[var(--text-muted)]"><span>{label}</span><span>{value}%</span></div>}
      <div className="h-2 rounded-full bg-slate-200/60 dark:bg-slate-700/60 overflow-hidden">
        <div className="h-full rounded-full gradient-btn" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

export function Tooltip({ content, children }) {
  return (
    <span className="relative group inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-slate-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition z-20">
        {content}
      </span>
    </span>
  );
}
