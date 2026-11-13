import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from './Modal';

export default function TasksView({ user }) {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [clientId, setClientId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState(String(user.id));
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showCancel: false,
    onConfirm: null,
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const showModal = (config) => setModalConfig({ ...modalConfig, isOpen: true, showCancel: false, ...config });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const requests = [api.get('/tasks'), api.get('/clients')];
    if (user.role === 'admin') requests.push(api.get('/auth/users'));
    Promise.all(requests)
      .then(([tasksResponse, clientsResponse, usersResponse]) => {
        setTasks(tasksResponse.data);
        setClients(clientsResponse.data);
        if (user.role === 'admin') setAgents(usersResponse.data.filter((listedUser) => listedUser.role === 'user'));
      })
      .catch((error) => console.error('Error al cargar agenda:', error));
  }, [user.id, user.role]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error('Error al cargar tareas', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!title || !dueDate) {
      showModal({
        type: 'warning',
        title: 'Campos Requeridos',
        message: 'Por favor completa el título y la fecha límite antes de confirmar.',
        confirmText: 'Entendido',
        onConfirm: closeModal,
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/tasks', {
        title,
        description,
        due_date: dueDate,
        client_id: clientId ? Number(clientId) : null,
        ...(user.role === 'admin' ? { user_id: Number(assignedUserId) } : {})
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setClientId('');
      setAssignedUserId(String(user.id));
      fetchTasks();
      showModal({
        type: 'success',
        title: '¡Actividad Agendada!',
        message: 'La tarea fue registrada correctamente en la agenda operativa.',
        confirmText: 'Aceptar',
        onConfirm: closeModal,
      });
    } catch (err) {
      console.error('Error al crear tarea:', err);
      showModal({
        type: 'danger',
        title: 'Error al Crear Tarea',
        message: err.response?.data?.error || 'No se pudo registrar la tarea. Verifica los datos e intenta de nuevo.',
        confirmText: 'Cerrar',
        onConfirm: closeModal,
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      due_date: String(task.due_date || task.dueDate || '').slice(0, 10),
      completed: Boolean(task.completed),
      client_id: task.client_id ? String(task.client_id) : '',
      user_id: String(task.user_id || user.id),
    });
    setEditError('');
  };

  const saveTaskEdit = async () => {
    if (!editingTask || !editForm) return;
    setEditSaving(true);
    setEditError('');
    try {
      await api.put(`/tasks/${editingTask.id}`, {
        ...editForm,
        client_id: editForm.client_id ? Number(editForm.client_id) : null,
        ...(user.role === 'admin' ? { user_id: Number(editForm.user_id) } : {}),
      });
      setEditingTask(null);
      setEditForm(null);
      await fetchTasks();
      showModal({ type: 'success', title: 'Tarea actualizada', message: 'Los cambios se guardaron correctamente.', confirmText: 'Aceptar', onConfirm: closeModal });
    } catch (requestError) {
      setEditError(requestError.response?.data?.error || 'No fue posible actualizar la tarea.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleCompleteTask = (id) => {
    showModal({
      type: 'info',
      title: 'Completar Tarea',
      message: '¿Deseas marcar esta tarea como completada? Esta acción la moverá al historial.',
      confirmText: 'Sí, completar',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: () => confirmComplete(id),
    });
  };

  const confirmComplete = async (id) => {
    closeModal();
    try {
      await api.put(`/tasks/${id}/complete`);
      fetchTasks();
      showModal({
        type: 'success',
        title: '¡Tarea Completada!',
        message: 'La actividad fue marcada como finalizada y movida al historial.',
        confirmText: 'Aceptar',
        onConfirm: closeModal,
      });
    } catch (err) {
      console.error('Error al completar tarea:', err);
      showModal({
        type: 'danger',
        title: 'Error',
        message: 'No se pudo completar la tarea. Intenta de nuevo.',
        confirmText: 'Cerrar',
        onConfirm: closeModal,
      });
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="tasks-page-container">
      {/* Encabezado de la Sección */}
      <div className="tasks-header">
        <h2 className="tasks-title">
          Agenda Operativa y Seguimientos
        </h2>
        <p className="tasks-subtitle">
          Organización de actividades comerciales, recordatorios y control de tareas asignadas.
        </p>
      </div>

      <div className="task-layout">
        {/* Columna Izquierda: Formulario Moderno para Agendar */}
        <div className="form-card">
          <div className="form-header">
            <div className="form-header-icon">
              📅
            </div>
            <h3 className="form-header-title">
              Agendar Nueva Actividad
            </h3>
          </div>

          <form onSubmit={handleCreateTask} className="vertical-form">
            <div>
              <label className="field-label">
                Título de la Tarea *
              </label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                className="modern-input"
                placeholder="Ej. Llamada de seguimiento comercial"
                minLength={2}
                maxLength={150}
                pattern="[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9 .,&amp;'()/#:+-]*"
                title="Usa letras, números, espacios y estos signos: . , &amp; ' ( ) / # : + -"
              />
              <small className="field-help">De 2 a 150 caracteres.</small>
            </div>

            <div>
              <label className="field-label" htmlFor="task-assignee">Responsable</label>
              {user.role === 'admin' ? (
                <select id="task-assignee" value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)} className="modern-input" required>
                  <option value={String(user.id)}>Asignarme a mí (Administrador)</option>
                  {agents.map((agent) => <option key={agent.id} value={String(agent.id)}>{agent.name} · {agent.email}</option>)}
                </select>
              ) : (
                <div className="modern-input bg-slate-50 text-slate-600" aria-live="polite">
                  Se asignará a {user.name} (tu cuenta)
                </div>
              )}
            </div>

            <div>
              <label className="field-label">
                Cliente Asociado
              </label>
              <select 
                value={clientId} 
                onChange={(e) => setClientId(e.target.value)} 
                className="modern-input"
              >
                <option value="">-- Ninguno / General --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.contact_name || c.name} ({c.company_name || c.company})</option>
                ))}
              </select>
              <small className="field-help">Opcional. Déjalo vacío para una tarea general.</small>
            </div>

            <div>
              <label className="field-label">
                Fecha Límite *
              </label>
              <input 
                type="date" 
                value={dueDate} 
                min={today} 
                onChange={(e) => setDueDate(e.target.value)} 
                required 
                className="modern-input" 
              />
            </div>

            <div>
              <label className="field-label">
                Notas / Detalles
              </label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows="3"
                maxLength={2000}
                className="modern-input"
                placeholder="Ej. Confirmar disponibilidad para la reunión..."
              />
              <small className="field-help">Opcional. Máximo 2,000 caracteres.</small>
            </div>

            <button type="submit" disabled={loading} className="btn-action">
              {loading ? 'Guardando...' : '+ Confirmar Tarea'}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Pestañas de Pendientes e Historial Completado */}
        <div className="tasks-container-card">
          {/* Botones de Pestañas */}
          <div className="tasks-tab-header">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`tab-btn ${activeTab === 'pending' ? 'active-pending' : ''}`}
            >
              Pendientes ({pendingTasks.length})
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`tab-btn ${activeTab === 'completed' ? 'active-completed' : ''}`}
            >
              Historial Completadas ({completedTasks.length})
            </button>
          </div>

          {/* Listado según la pestaña activa */}
          {activeTab === 'pending' ? (
            <>
              {pendingTasks.length === 0 ? (
                <div className="tasks-empty-card">
                  <p className="tasks-empty-title">No hay tareas pendientes en este momento.</p>
                  <span className="tasks-empty-desc">Crea una nueva actividad usando el formulario de la izquierda.</span>
                </div>
              ) : (
                pendingTasks.map(task => {
                  const rawDate = task.dueDate || task.due_date;
                  const formattedDate = rawDate ? rawDate.split('T')[0] : 'Sin fecha';

                  return (
                    <div key={task.id} className="task-item">
                      <div className="task-item-content">
                        <div className="task-date-badge">
                          <span className="task-date-label">Vence</span>
                          <span className="task-date-value">{formattedDate}</span>
                        </div>
                        <div>
                          <h4 className="task-title">{task.title}</h4>
                          {task.description && <p className="task-desc">{task.description}</p>}
                          <div className="task-meta-tags">
                            <span className="task-user-tag">
                              👤 {task.user_name || 'Usuario asignado'}
                            </span>
                            {task.company_name && (
                              <span className="task-company-tag">
                                🏢 {task.company_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                        <button type="button" onClick={() => openEditTask(task)} className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-50 sm:w-auto">Editar</button>
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="task-complete-btn"
                        >
                          ✓ Completar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <>
              {completedTasks.length === 0 ? (
                <div className="tasks-empty-card">
                  <p className="tasks-empty-title">Aún no hay tareas completadas en el historial.</p>
                </div>
              ) : (
                completedTasks.map(task => {
                  const rawDate = task.dueDate || task.due_date;
                  const formattedDate = rawDate ? rawDate.split('T')[0] : 'Sin fecha';

                  return (
                    <div key={task.id} className="task-item completed">
                      <div className="task-item-content">
                        <div className="task-date-badge completed-badge">
                          <span className="task-date-label">Completada</span>
                          <span className="task-date-value">✓ Hecho</span>
                        </div>
                        <div>
                          <h4 className="task-title completed-title">{task.title}</h4>
                          {task.description && <p className="task-desc">{task.description}</p>}
                          <div className="task-meta-tags">
                            <span className="task-user-tag">
                              Fecha límite: {formattedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                        <span className="task-finished-label">Finalizada</span>
                        <button type="button" onClick={() => openEditTask(task)} className="rounded-lg border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-50">Editar</button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        showCancel={modalConfig.showCancel}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
      />

      <Modal
        isOpen={Boolean(editingTask && editForm)}
        type="edit"
        title="Editar tarea"
        confirmText={editSaving ? 'Guardando...' : 'Guardar cambios'}
        cancelText="Cancelar"
        showCancel
        onConfirm={saveTaskEdit}
        onClose={() => { setEditingTask(null); setEditForm(null); }}
      >
        {editForm && <form className="vertical-form">
          <label className="field-label">Título
            <input required minLength={2} maxLength={150} pattern="[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9 .,&amp;'()/#:+-]*" className="modern-input" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          </label>
          {user.role === 'admin' && <label className="field-label">Responsable
            <select className="modern-input" value={editForm.user_id} onChange={(e) => setEditForm({ ...editForm, user_id: e.target.value })}>
              <option value={String(user.id)}>Asignarme a mí (Administrador)</option>
              {editingTask.user_id && Number(editingTask.user_id) !== Number(user.id) && !agents.some((agent) => Number(agent.id) === Number(editingTask.user_id)) && <option value={String(editingTask.user_id)}>{editingTask.user_name || 'Responsable actual'} (cuenta inactiva)</option>}
              {agents.map((agent) => <option key={agent.id} value={String(agent.id)}>{agent.name} · {agent.email}</option>)}
            </select>
          </label>}
          <label className="field-label">Cliente asociado
            <select className="modern-input" value={editForm.client_id} onChange={(e) => setEditForm({ ...editForm, client_id: e.target.value })}>
              <option value="">Sin cliente</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.company_name} · {client.contact_name}</option>)}
            </select>
          </label>
          <label className="field-label">Fecha límite
            <input type="date" required min={today} className="modern-input" value={editForm.due_date} onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} />
          </label>
          <label className="field-label">Notas / Detalles
            <textarea maxLength={2000} rows="4" className="modern-input" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={editForm.completed} onChange={(e) => setEditForm({ ...editForm, completed: e.target.checked })} />
            Tarea completada
          </label>
          {editError && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{editError}</p>}
        </form>}
      </Modal>
    </div>
  );
}
