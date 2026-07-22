import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export function Input({
  label,
  error,
  hint,
  type = 'text',
  className = '',
  icon: Icon,
  ...props
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <label className={`block space-y-1.5 ${className}`}>
      {label && <span className="text-sm font-medium text-[var(--text)]">{label}</span>}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary transition" size={16} />
        )}
        <input
          type={inputType}
          className={`w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] transition focus:border-primary/50 ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </label>
  );
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      {label && <span className="text-sm font-medium">{label}</span>}
      <select
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text)]"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      {label && <span className="text-sm font-medium">{label}</span>}
      <textarea
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text)] min-h-[90px]"
        {...props}
      />
    </label>
  );
}
