import { Link, useLocation } from 'react-router-dom';

export function Breadcrumbs({ items }) {
  const location = useLocation();
  const crumbs = items || location.pathname.split('/').filter(Boolean).map((seg, i, arr) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    to: '/' + arr.slice(0, i + 1).join('/'),
  }));

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)] mb-3 flex items-center gap-1 flex-wrap">
      <Link to="/app" className="hover:text-primary">Home</Link>
      {crumbs.map((c) => (
        <span key={c.to} className="flex items-center gap-1">
          <span>/</span>
          <Link to={c.to} className="hover:text-primary">{c.label}</Link>
        </span>
      ))}
    </nav>
  );
}
