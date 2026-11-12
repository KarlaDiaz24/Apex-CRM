import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from './Modal';

export default function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Administrador (admin)');
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingTaskId, setPendingTaskId] = useState(null);

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
    fetchTasks();
    fetchClients();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Error al cargar tareas', err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      console.error('Error al cargar clientes', err);
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
        user_id: 1,
        client_id: clientId ? Number(clientId) : null
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setClientId('');
      fetchTasks();
      showModal({
        type: 'success',
        title: '¡Actividad Agendada!',
        message: 'La tarea fue registrada correctamente en la agenda operativa.',
        confirmText: 'Aceptar',
        onConfirm: closeModal,
      });
    } catch (err) {
      showModal({
        type: 'danger',
        title: 'Error al Crear Tarea',
        message: 'No se pudo registrar la tarea. Verifica la conexión e intenta de nuevo.',
        confirmText: 'Cerrar',
        onConfirm: closeModal,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = (id) => {
    setPendingTaskId(id);
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
              />
            </div>

            <div>
              <label className="field-label">
                Responsable *
              </label>
              <select 
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)} 
                className="modern-input"
              >
                <option value="Administrador (admin)">Administrador (admin)</option>
                <option value="Agente Operativo">Agente Operativo</option>
              </select>
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
                  <option key={c.id} value={c.id}>{c.name} ({c.company_name || c.company})</option>
                ))}
              </select>
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
                className="modern-input"
                placeholder="Detalles de la reunión o llamada..." 
              />
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
                              👤 {task.user_name || task.assignedTo || 'Administrador'}
                            </span>
                            {task.company_name && (
                              <span className="task-company-tag">
                                🏢 {task.company_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCompleteTask(task.id)}
                        className="task-complete-btn"
                      >
                        ✓ Completar
                      </button>
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
                      <span className="task-finished-label">
                        Finalizada
                      </span>
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
    </div>
  );
}
