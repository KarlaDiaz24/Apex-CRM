export default function Pagination({ page, pageCount, total, pageSize, onPageChange }) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <nav className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6" aria-label="Paginación">
      <p className="text-sm text-slate-500">Mostrando <span className="font-semibold text-slate-700">{start}–{end}</span> de <span className="font-semibold text-slate-700">{total}</span></p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-blue hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-40" aria-label="Página anterior">Anterior</button>
        <span className="min-w-20 text-center text-sm font-semibold text-slate-600">{page} / {pageCount}</span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-blue hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-40" aria-label="Página siguiente">Siguiente</button>
      </div>
    </nav>
  );
}
