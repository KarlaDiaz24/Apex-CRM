import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import Modal from './Modal';

const interactionTypes = ['Llamada', 'Correo', 'Reunión', 'WhatsApp'];

const dateLabel = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
};

export default function InteractionsView({ user }) {
  const [clients, setClients] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState('Llamada');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [clientResponse, interactionResponse] = await Promise.all([api.get('/clients'), api.get('/interactions')]);
      setClients(clientResponse.data);
      setInteractions(interactionResponse.data);
      setError('');
    } catch {
      setError('No fue posible cargar las interacciones. Intenta actualizar la vista.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/clients'), api.get('/interactions')])
      .then(([clientResponse, interactionResponse]) => {
        if (!active) return;
        setClients(clientResponse.data);
        setInteractions(interactionResponse.data);
        setError('');
      })
      .catch(() => { if (active) setError('No fue posible cargar las interacciones. Intenta actualizar la vista.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/interactions', { client_id: Number(clientId), type, notes });
      setNotes('');
      await refresh();
      setModal({ type: 'success', title: 'Interacción registrada', message: 'La actividad quedó agregada al historial del cliente.' });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No fue posible guardar la interacción.');
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (interaction) => setModal({
    type: 'warning',
    title: 'Eliminar interacción',
    message: 'La interacción se ocultará del historial activo.',
    confirmText: 'Enviar a papelera',
    showCancel: true,
    onConfirm: async () => {
      try {
        await api.delete(`/interactions/${interaction.id}`);
        setInteractions((current) => current.filter((item) => item.id !== interaction.id));
        setModal({ type: 'success', title: 'Interacción eliminada', message: 'Se eliminó del historial activo.' });
      } catch (requestError) {
        setModal({ type: 'danger', title: 'No se pudo eliminar', message: requestError.response?.data?.error || 'Intenta nuevamente.' });
      }
    },
  });

  return (
    <section className="space-y-6 sm:space-y-8" aria-labelledby="interactions-title">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-blue to-sky-700 px-5 py-7 text-white shadow-xl shadow-brand-navy/15 sm:px-8 sm:py-9">
        <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">Seguimiento comercial</p>
        <h1 id="interactions-title" className="text-2xl font-black tracking-tight sm:text-3xl">Interacciones con clientes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Registra llamadas, correos, reuniones y conversaciones para conservar el historial de cada cuenta.</p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
          <div>
            <h2 className="text-lg font-extrabold text-brand-navy">Registrar actividad</h2>
            <p className="mt-1 text-sm text-slate-500">Asocia una nota a un cliente activo.</p>
          </div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Cliente
            <select required value={clientId} onChange={(event) => setClientId(event.target.value)} className="select-field mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium normal-case text-slate-700 outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10">
              <option value="">Selecciona un cliente</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.company_name} · {client.contact_name}</option>)}
            </select>
          </label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Tipo de actividad
            <select value={type} onChange={(event) => setType(event.target.value)} className="select-field mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium normal-case text-slate-700 outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10">
              {interactionTypes.map((interactionType) => <option key={interactionType} value={interactionType}>{interactionType}</option>)}
            </select>
          </label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Notas
            <textarea required minLength={1} maxLength={5000} rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Resume lo conversado y los siguientes pasos..." className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10" />
          </label>
          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
          <button type="submit" disabled={saving || clients.length === 0} className="w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'Guardando...' : clients.length ? 'Guardar interacción' : 'Registra un cliente primero'}
          </button>
        </form>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div><h2 className="text-lg font-extrabold text-brand-navy">Historial reciente</h2><p className="mt-1 text-sm text-slate-500">{interactions.length} actividades registradas</p></div>
            <button type="button" onClick={refresh} disabled={loading} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-blue hover:text-brand-blue disabled:opacity-50">Actualizar</button>
          </div>
          {loading ? <p className="p-10 text-center text-sm text-slate-500">Cargando historial...</p> : interactions.length === 0 ? (
            <div className="p-10 text-center"><p className="font-bold text-slate-700">Aún no hay interacciones</p><p className="mt-1 text-sm text-slate-500">Las actividades registradas aparecerán aquí.</p></div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {interactions.map((interaction) => {
                const canDelete = user.role === 'admin' || Number(interaction.user_id) === Number(user.id);
                return <li key={interaction.id} className="flex flex-col gap-3 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">{interaction.type}</span>
                      <span className="text-xs text-slate-500">{dateLabel(interaction.created_at)}</span>
                    </div>
                    <p className="mt-2 font-bold text-slate-800">{interaction.company_name}</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{interaction.notes}</p>
                    <p className="mt-2 text-xs text-slate-500">Registró: {interaction.user_name || 'Usuario'}</p>
                  </div>
                  {canDelete && <button type="button" onClick={() => requestDelete(interaction)} className="shrink-0 self-start rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50">Eliminar</button>}
                </li>;
              })}
            </ul>
          )}
        </div>
      </div>

      <Modal isOpen={Boolean(modal)} type={modal?.type} title={modal?.title} message={modal?.message} confirmText={modal?.confirmText || 'Aceptar'} cancelText="Cancelar" showCancel={modal?.showCancel} onConfirm={async () => { const action = modal?.onConfirm; if (action) await action(); else setModal(null); }} onCancel={() => setModal(null)} onClose={() => setModal(null)} />
    </section>
  );
}
