export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-xl',
    md: 'px-4 py-2.5 text-sm rounded-2xl',
    lg: 'px-5 py-3 text-base rounded-2xl',
  };
  const variants = {
    primary: 'gradient-btn font-medium',
    secondary:
      'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] hover:border-primary/40',
    ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    outline: 'border border-primary/40 text-primary hover:bg-primary/5',
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 font-medium transition disabled:opacity-50 disabled:pointer-events-none ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
