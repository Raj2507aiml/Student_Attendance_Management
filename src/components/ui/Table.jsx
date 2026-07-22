export function Table({ columns, rows, keyField = 'id', empty = 'No records found.' }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border)]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium text-[var(--text-muted)] whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-[var(--text-muted)]">
                {empty}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row[keyField]} className="border-b border-[var(--border)] last:border-0 hover:bg-primary/[0.03] transition">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 mt-4 text-sm">
      <span className="text-[var(--text-muted)]">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1.5 rounded-xl border border-[var(--border)] disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Prev
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded-xl border border-[var(--border)] disabled:opacity-40"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
