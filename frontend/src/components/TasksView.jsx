import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Administrador (admin)');
  const [clientId, setClientId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

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
    setError('');
    setSuccess('');

    if (!title || !dueDate) {
      setError('Por favor completa el título y la fecha límite.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/tasks', {
        title,
        description,
        due_date: dueDate, // Asegurando el nombre de columna correcto que usa tu backend
        user_id: 1, // Ajusta si manejas el id del usuario dinámico
        client_id: clientId ? Number(clientId) : null
      });
      setSuccess('¡Actividad agendada con éxito!');
      setTitle('');
      setDescription('');
      setDueDate('');
      setClientId('');
      fetchTasks();
    } catch (err) {
      setError('Error al crear la tarea. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await api.put(`/tasks/${id}/complete`);
      fetchTasks();
    } catch (err) {
      console.error('Error al completar tarea', err);
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

          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert-success">
              {success}
            </div>
          )}

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
    </div>
  );
}