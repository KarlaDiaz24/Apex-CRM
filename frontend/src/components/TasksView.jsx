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
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' o 'completed'

  // Obtener fecha actual en formato YYYY-MM-DD para bloquear días pasados
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
    <div style={{ padding: '35px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        .task-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 30px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .task-layout {
            grid-template-columns: 1fr;
          }
        }
        .form-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(31, 46, 64, 0.08);
          border: 1px solid #E2E8F0;
        }
        .tasks-container-card {
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid #E2E8F0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .modern-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #CBD5E1;
          font-size: 14px;
          color: #1F2E40;
          background: #FFFFFF;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .modern-input:focus {
          outline: none;
          border-color: #025375;
          box-shadow: 0 0 0 3px rgba(2, 83, 117, 0.15);
        }
        .task-item {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 22px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 20px rgba(31, 46, 64, 0.06);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-left: 5px solid #025375;
          transition: all 0.25s ease;
        }
        .task-item.completed {
          border-left-color: #10B981;
          opacity: 0.85;
          background: #F8FAFC;
        }
        .task-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(31, 46, 64, 0.1);
        }
        .btn-action {
          background: linear-gradient(135deg, #025375 0%, #1F2E40 100%);
          color: #FFFFFF;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }
        .btn-action:hover {
          opacity: 0.95;
          box-shadow: 0 4px 15px rgba(2, 83, 117, 0.3);
        }
        .tab-btn {
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
      `}</style>

      {/* Encabezado de la Sección */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#1F2E40', fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0' }}>
          Agenda Operativa y Seguimientos
        </h2>
        <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
          Organización de actividades comerciales, recordatorios y control de tareas asignadas.
        </p>
      </div>

      <div className="task-layout">
        {/* Columna Izquierda: Formulario Moderno para Agendar */}
        <div className="form-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '36px', height: '36px', background: 'rgba(2, 83, 117, 0.1)', color: '#025375',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
              📅
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#1F2E40', fontWeight: '700' }}>
              Agendar Nueva Actividad
            </h3>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: '600', border: '1px solid #FCA5A5' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#F0FDF4', color: '#16A34A', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: '600', border: '1px solid #BBF7D0' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
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
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
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
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
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
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
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
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
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
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #CBD5E1', paddingBottom: '15px' }}>
            <button 
              onClick={() => setActiveTab('pending')}
              className="tab-btn"
              style={{
                background: activeTab === 'pending' ? '#025375' : '#E2E8F0',
                color: activeTab === 'pending' ? '#FFFFFF' : '#475569'
              }}
            >
              Pendientes ({pendingTasks.length})
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className="tab-btn"
              style={{
                background: activeTab === 'completed' ? '#10B981' : '#E2E8F0',
                color: activeTab === 'completed' ? '#FFFFFF' : '#475569'
              }}
            >
              Historial Completadas ({completedTasks.length})
            </button>
          </div>

          {/* Listado según la pestaña activa */}
          {activeTab === 'pending' ? (
            <>
              {pendingTasks.length === 0 ? (
                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px dashed #CBD5E1', color: '#64748B' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>No hay tareas pendientes en este momento.</p>
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>Crea una nueva actividad usando el formulario de la izquierda.</span>
                </div>
              ) : (
                pendingTasks.map(task => {
                  const rawDate = task.dueDate || task.due_date;
                  const formattedDate = rawDate ? rawDate.split('T')[0] : 'Sin fecha';

                  return (
                    <div key={task.id} className="task-item">
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #025375 0%, #1F2E40 100%)', 
                          color: '#FFFFFF', padding: '12px 14px', borderRadius: '12px',
                          textAlign: 'center', minWidth: '105px', boxShadow: '0 4px 10px rgba(2, 83, 117, 0.2)'
                        }}>
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', display: 'block', opacity: 0.8, fontWeight: '700' }}>Vence</span>
                          <span style={{ fontSize: '13px', fontWeight: '800' }}>{formattedDate}</span>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: '#1F2E40', fontSize: '16px', fontWeight: '700' }}>{task.title}</h4>
                          {task.description && <p style={{ margin: '0 0 10px 0', color: '#64748B', fontSize: '13px', lineHeight: '1.4' }}>{task.description}</p>}
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ background: '#E2E8F0', color: '#334155', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                              👤 {task.user_name || task.assignedTo || 'Administrador'}
                            </span>
                            {task.company_name && (
                              <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                🏢 {task.company_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCompleteTask(task.id)}
                        style={{
                          background: '#10B981', color: '#FFFFFF', border: 'none', padding: '10px 16px',
                          borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                        }}
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
                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px dashed #CBD5E1', color: '#64748B' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Aún no hay tareas completadas en el historial.</p>
                </div>
              ) : (
                completedTasks.map(task => {
                  const rawDate = task.dueDate || task.due_date;
                  const formattedDate = rawDate ? rawDate.split('T')[0] : 'Sin fecha';

                  return (
                    <div key={task.id} className="task-item completed">
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{
                          background: '#10B981', color: '#FFFFFF', padding: '12px 14px', borderRadius: '12px',
                          textAlign: 'center', minWidth: '105px'
                        }}>
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', display: 'block', opacity: 0.9, fontWeight: '700' }}>Completada</span>
                          <span style={{ fontSize: '13px', fontWeight: '800' }}>✓ Hecho</span>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: '#1F2E40', fontSize: '16px', fontWeight: '700', textDecoration: 'line-through' }}>{task.title}</h4>
                          {task.description && <p style={{ margin: '0 0 10px 0', color: '#64748B', fontSize: '13px' }}>{task.description}</p>}
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ background: '#E2E8F0', color: '#334155', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                              Fecha límite: {formattedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '13px' }}>
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