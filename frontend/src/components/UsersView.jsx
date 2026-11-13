import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import Modal from './Modal';

const emptyForm = { name: '', email: '', password: '' };

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [editError, setEditError] = useState('');
  const [modal, setModal] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
      setError('');
    } catch {
      setError('No fue posible cargar los usuarios. Verifica tu sesión de administrador.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.get('/auth/users')
      .then(({ data }) => { if (active) { setUsers(data); setError(''); } })
      .catch(() => { if (active) setError('No fue posible cargar los usuarios. Verifica tu sesión de administrador.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await api.post('/auth/register', form);
      setForm(emptyForm);
      setNotice('La cuenta de agente se creó correctamente. La contraseña quedó protegida con hash.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No fue posible crear el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (listedUser) => {
    setEditingUser(listedUser);
    setEditForm({ name: listedUser.name, email: listedUser.email, password: '' });
    setEditError('');
  };

  const saveEdit = async () => {
    setSaving(true);
    setEditError('');
    try {
      const payload = { name: editForm.name, email: editForm.email };
      if (editForm.password) payload.password = editForm.password;
      await api.put(`/auth/users/${editingUser.id}`, payload);
      setEditingUser(null);
      setNotice('Los datos del agente se actualizaron correctamente.');
      await loadUsers();
    } catch (requestError) {
      const status = requestError.response?.status;
      setEditError(status === 404
        ? 'La API conectada aún no tiene habilitada la edición de agentes. Inicia el backend actualizado o despliega sus cambios en Render.'
        : requestError.response?.data?.error || 'No fue posible actualizar el agente.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAgent = async (agent) => {
    try {
      await api.delete(`/auth/users/${agent.id}`);
      setUsers((current) => current.filter((listedUser) => listedUser.id !== agent.id));
      setModal({ type: 'success', title: 'Agente desactivado', message: `${agent.name} ya no podrá iniciar sesión.` });
    } catch (requestError) {
      setModal({ type: 'danger', title: 'No se pudo desactivar', message: requestError.response?.data?.error || 'Intenta nuevamente.' });
    }
  };

  return (
    <section className="space-y-6 sm:space-y-8" aria-labelledby="users-title">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-blue to-sky-700 px-5 py-7 text-white shadow-xl shadow-brand-navy/15 sm:px-8 sm:py-9">
        <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">Administración</p>
        <h1 id="users-title" className="text-2xl font-black tracking-tight sm:text-3xl">Usuarios del CRM</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Crea y administra cuentas de agente. Los agentes reciben permisos operativos y no pueden acceder a la administración.</p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(280px,400px)_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
          <div><h2 className="text-lg font-extrabold text-brand-navy">Registrar agente</h2><p className="mt-1 text-sm text-slate-500">El rol user se asigna automáticamente.</p></div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Nombre
            <input required minLength={2} maxLength={100} pattern="[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'-]*" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nombre y apellido" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10" />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Correo electrónico
            <input required type="email" maxLength={100} autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="agente@empresa.com" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10" />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Contraseña temporal
            <input required type="password" minLength={8} maxLength={72} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Mínimo 8 caracteres" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10" />
          </label>
          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
          {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{notice}</p>}
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-50">{saving ? 'Creando cuenta...' : 'Crear agente'}</button>
        </form>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="text-lg font-extrabold text-brand-navy">Cuentas activas</h2><p className="mt-1 text-sm text-slate-500">{users.length} usuarios registrados</p></div><button type="button" onClick={loadUsers} disabled={loading} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-blue hover:text-brand-blue disabled:opacity-50">Actualizar</button></div>
          {loading ? <p className="p-10 text-center text-sm text-slate-500">Cargando usuarios...</p> : error && !users.length ? <p className="p-6 text-sm text-rose-700">{error}</p> : users.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">No hay usuarios activos.</p> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-bold">Nombre</th><th className="px-5 py-3 font-bold">Correo</th><th className="px-5 py-3 font-bold">Rol</th><th className="px-5 py-3 text-right font-bold">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((listedUser) => <tr key={listedUser.id} className="hover:bg-slate-50/70"><td className="px-5 py-4 text-sm font-semibold text-slate-800">{listedUser.name}</td><td className="px-5 py-4 text-sm text-slate-600">{listedUser.email}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${listedUser.role === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'}`}>{listedUser.role === 'admin' ? 'Administrador' : 'Agente'}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{listedUser.role === 'user' && <><button type="button" onClick={() => openEdit(listedUser)} className="rounded-lg border border-sky-200 px-3 py-1.5 text-xs font-bold text-sky-700 transition hover:bg-sky-50">Editar</button><button type="button" onClick={() => setModal({ type: 'warning', title: 'Desactivar agente', message: `¿Desactivar la cuenta de ${listedUser.name}? Sus tareas e historial se conservarán, pero ya no podrá iniciar sesión.`, confirmText: 'Desactivar', showCancel: true, onConfirm: () => deleteAgent(listedUser) })} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50">Desactivar</button></>}</div></td></tr>)}</tbody></table></div>
          )}
        </div>
      </div>

      <Modal isOpen={Boolean(editingUser)} type="edit" title="Editar agente" confirmText={saving ? 'Guardando...' : 'Guardar cambios'} cancelText="Cancelar" showCancel onConfirm={saveEdit} onClose={() => setEditingUser(null)}>
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Nombre
            <input required minLength={2} maxLength={100} pattern="[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'-]*" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case text-slate-800 outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10" />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Correo electrónico
            <input required type="email" maxLength={100} value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case text-slate-800 outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10" />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Nueva contraseña (opcional)
            <input type="password" minLength={8} maxLength={72} autoComplete="new-password" value={editForm.password} onChange={(event) => setEditForm({ ...editForm, password: event.target.value })} placeholder="Deja vacío para conservarla" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case text-slate-800 outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10" />
          </label>
          {editError && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{editError}</p>}
        </div>
      </Modal>

      <Modal isOpen={Boolean(modal)} type={modal?.type} title={modal?.title} message={modal?.message} confirmText={modal?.confirmText || 'Aceptar'} cancelText="Cancelar" showCancel={modal?.showCancel} onConfirm={async () => { const action = modal?.onConfirm; if (action) await action(); else setModal(null); }} onCancel={() => setModal(null)} onClose={() => setModal(null)} />
    </section>
  );
}
