import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Pagination from './Pagination';

const PAGE_SIZE = 10;

const actionTone = (action = '') => {
  const value = action.toUpperCase();
  if (value.includes('CREATE') || value.includes('INSERT') || value.includes('RESTORE')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  if (value.includes('DELETE') || value.includes('TRASH')) {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }
  if (value.includes('UPDATE')) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-sky-200 bg-sky-50 text-sky-700';
};

const actorName = (log) => log.actor_label || log.user_name ||
  (log.user_id ? `Usuario #${log.user_id}` : 'Registro histórico sin usuario asociado');

const formatDate = (value) => {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function AuditView() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [reload, setReload] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/audit', { signal: controller.signal })
      .then(({ data }) => {
        setLogs(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') {
          setError('No fue posible cargar la bitácora. Verifica tu sesión y vuelve a intentarlo.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reload]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es-MX');
    return logs.filter((log) => {
      const matchesAction = actionFilter === 'all' ||
        (actionFilter === 'delete' ? /delete|trash/i.test(log.action || '')
          : actionFilter === 'create' ? /create|insert|restore/i.test(log.action || '')
            : /update/i.test(log.action || ''));
      const searchable = [actorName(log), log.user_email, log.action, log.details, log.id]
        .filter(Boolean).join(' ').toLocaleLowerCase('es-MX');
      return matchesAction && (!query || searchable.includes(query));
    });
  }, [logs, search, actionFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const today = new Date().toDateString();
  const todayCount = logs.filter((log) => log.created_at && new Date(log.created_at).toDateString() === today).length;
  const actorCount = new Set(logs.filter((log) => log.user_id).map((log) => log.user_id)).size;

  const refresh = () => {
    setIsLoading(true);
    setReload((value) => value + 1);
  };

  return (
    <section className="space-y-6 sm:space-y-8" aria-labelledby="audit-title">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-blue to-sky-700 px-5 py-7 text-white shadow-xl shadow-brand-navy/15 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
              <span className="size-2 rounded-full bg-brand-cyan" /> Administración del sistema
            </p>
            <h1 id="audit-title" className="text-2xl font-black tracking-tight sm:text-3xl">Auditoría y trazabilidad</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Consulta quién realizó cada cambio y cuándo ocurrió dentro del CRM.
            </p>
          </div>
          <button type="button" onClick={refresh} disabled={isLoading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <svg className={`size-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4m-4 5a8 8 0 0 0 14.9 3M20 20v-4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Actualizar registros
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-semibold text-slate-500">Eventos registrados</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-brand-navy">{logs.length}</p>
          <p className="mt-1 text-xs text-slate-500">Actividad total en la bitácora</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-semibold text-slate-500">Actividad de hoy</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-brand-blue">{todayCount}</p>
          <p className="mt-1 text-xs text-slate-500">Eventos en la fecha actual</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-semibold text-slate-500">Usuarios con actividad</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-emerald-700">{actorCount}</p>
          <p className="mt-1 text-xs text-slate-500">Identificados en los registros</p>
        </article>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-extrabold text-brand-navy">Bitácora de actividad</h2>
              <span className="rounded-full bg-brand-surface px-2.5 py-1 text-xs font-bold text-brand-blue">{filteredLogs.length}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Eventos recientes registrados por la API.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px] lg:w-[480px]">
            <label className="relative block">
              <span className="sr-only">Buscar en auditoría</span>
              <svg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 4.3 4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar usuario o detalle" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10" />
            </label>
            <label>
              <span className="sr-only">Filtrar por acción</span>
              <select value={actionFilter} onChange={(event) => { setActionFilter(event.target.value); setPage(1); }} className="select-field w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10">
                <option value="all">Todas las acciones</option>
                <option value="create">Creaciones</option>
                <option value="update">Actualizaciones</option>
                <option value="delete">Eliminaciones</option>
              </select>
            </label>
          </div>
        </div>

        {error && (
          <div className="m-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p>{error}</p>
            <button type="button" onClick={refresh} className="shrink-0 font-bold underline underline-offset-2">Reintentar</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-bold sm:px-6">Usuario</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Acción</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Detalles</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Fecha y hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-14 text-center text-sm text-slate-500"><span className="inline-flex items-center gap-3"><span className="size-4 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />Cargando actividad...</span></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-14 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-surface text-brand-blue" aria-hidden="true">⌕</span>
                  <p className="mt-3 font-bold text-slate-700">{logs.length ? 'No hay coincidencias' : 'La bitácora está vacía'}</p>
                  <p className="mt-1 text-sm text-slate-500">{logs.length ? 'Prueba con otra búsqueda o filtro.' : 'Las acciones registradas aparecerán aquí.'}</p>
                </td></tr>
              ) : visibleLogs.map((log) => (
                <tr key={log.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-surface text-xs font-extrabold uppercase text-brand-blue">
                        {(log.user_name || 'S').trim().charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-48 truncate text-sm font-bold text-slate-800">{actorName(log)}</span>
                        {log.user_email && <span className="block max-w-48 truncate text-xs text-slate-500">{log.user_email}</span>}
                        {!log.user_id && <span className="block text-xs text-amber-700">Sin atribución en el registro original</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${actionTone(log.action)}`}>{log.action || 'Acción no especificada'}</span>
                  </td>
                  <td className="max-w-sm px-5 py-4 text-sm leading-5 text-slate-600">{log.details || 'Sin detalles adicionales'}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} pageCount={pageCount} total={filteredLogs.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-6">
          La atribución histórica solo está disponible si el registro conserva el usuario asociado.
        </div>
      </div>
    </section>
  );
}
