import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from './Modal';

export default function DealsView() {
  const [deals, setDeals] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ client_id: '', title: '', amount: '', stage: 'Prospecto', closing_date: '' });
  const [loading, setLoading] = useState(false);

  // Modal para avisos / confirmaciones
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showCancel: false,
    onConfirm: null
  });

  // Modal para editar oportunidad
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [editForm, setEditForm] = useState({ client_id: '', title: '', amount: '', stage: 'Prospecto', closing_date: '' });

  const today = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    try {
      const [dealsRes, clientsRes] = await Promise.all([
        api.get('/deals'),
        api.get('/clients')
      ]);
      setDeals(dealsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Error al cargar datos de deals:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.client_id || !form.title) {
      setModalConfig({
        isOpen: true,
        type: 'warning',
        title: 'Campos Incompletos',
        message: 'Por favor selecciona un cliente y asigna un título a la oportunidad.',
        confirmText: 'Entendido',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/deals', form);
      const createdTitle = form.title;
      setForm({ client_id: '', title: '', amount: '', stage: 'Prospecto', closing_date: '' });
      fetchData();
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: '¡Oportunidad Registrada!',
        message: `La oportunidad "${createdTitle}" ha sido incorporada al pipeline comercial exitosamente.`,
        confirmText: 'Aceptar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      console.error('Error al crear deal:', error);
      setModalConfig({
        isOpen: true,
        type: 'danger',
        title: 'Error al Registrar',
        message: 'No fue posible crear la oportunidad de venta. Intenta nuevamente.',
        confirmText: 'Cerrar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (deal) => {
    setEditingDeal(deal);
    setEditForm({
      client_id: deal.client_id || '',
      title: deal.title || '',
      amount: deal.amount || '',
      stage: deal.stage || 'Prospecto',
      closing_date: deal.closing_date ? deal.closing_date.split('T')[0] : ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/deals/${editingDeal.id}`, editForm);
      setEditModalOpen(false);
      fetchData();
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: '¡Oportunidad Actualizada!',
        message: `La oportunidad "${editForm.title}" fue actualizada correctamente.`,
        confirmText: 'Aceptar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: 'danger',
        title: 'Error al Actualizar',
        message: 'Ocurrió un error al actualizar los datos de la oportunidad.',
        confirmText: 'Cerrar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const handleRequestDelete = (deal) => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Eliminar Oportunidad',
      message: `¿Estás seguro de eliminar permanentemente la oportunidad "${deal.title}"? Esta acción removerá el registro del pipeline comercial.`,
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: () => executeDelete(deal.id, deal.title)
    });
  };

  const executeDelete = async (id, title) => {
    try {
      await api.delete(`/deals/${id}`);
      fetchData();
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: '¡Oportunidad Eliminada!',
        message: `La oportunidad "${title}" ha sido eliminada del pipeline.`,
        confirmText: 'Aceptar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: 'danger',
        title: 'Error al Eliminar',
        message: 'No fue posible eliminar la oportunidad de venta.',
        confirmText: 'Cerrar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const getStageClass = (stage) => {
    switch (stage) {
      case 'Ganado':
        return 'stage-ganado';
      case 'Perdido':
        return 'stage-perdido';
      case 'Negociación':
        return 'stage-negociacion';
      case 'Propuesta':
        return 'stage-propuesta';
      default:
        return 'stage-prospecto';
    }
  };

  return (
    <div className="deals-page-container">
      {/* Encabezado */}
      <div className="deals-header">
        <h2 className="deals-title">
          Pipeline de Ventas (Deals)
        </h2>
        <p className="deals-subtitle">
          Gestión de oportunidades comerciales y seguimiento del embudo de conversión.
        </p>
      </div>

      <div className="deal-layout">
        {/* Columna Izquierda: Formulario Moderno */}
        <div className="form-card">
          <div className="form-header">
            <div className="form-header-icon">
              💼
            </div>
            <h3 className="form-header-title">
              Nueva Oportunidad
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="vertical-form">
            <div>
              <label className="field-label">
                Cliente *
              </label>
              <select 
                value={form.client_id} 
                onChange={(e) => setForm({...form, client_id: e.target.value})} 
                required 
                className="modern-input"
              >
                <option value="">-- Seleccione un Cliente --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">
                Título de la Oportunidad *
              </label>
              <input 
                type="text" 
                placeholder="Ej. Implementación Enterprise CRM" 
                value={form.title} 
                onChange={(e) => setForm({...form, title: e.target.value})} 
                required 
                className="modern-input" 
              />
            </div>

            <div>
              <label className="field-label">
                Monto ($)
              </label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={form.amount} 
                onChange={(e) => setForm({...form, amount: e.target.value})} 
                className="modern-input" 
              />
            </div>

            <div>
              <label className="field-label">
                Etapa del Pipeline
              </label>
              <select 
                value={form.stage} 
                onChange={(e) => setForm({...form, stage: e.target.value})} 
                className="modern-input"
              >
                <option value="Prospecto">Prospecto</option>
                <option value="Propuesta">Propuesta</option>
                <option value="Negociación">Negociación</option>
                <option value="Ganado">Ganado</option>
                <option value="Perdido">Perdido</option>
              </select>
            </div>

            <div>
              <label className="field-label">
                Cierre Estimado
              </label>
              <input 
                type="date" 
                min={today}
                value={form.closing_date} 
                onChange={(e) => setForm({...form, closing_date: e.target.value})} 
                className="modern-input" 
              />
            </div>

            <button type="submit" disabled={loading} className="btn-action">
              {loading ? 'Guardando...' : 'Crear Oportunidad'}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Listado de Deals en Tabla Moderna */}
        <div className="deals-container-card">
          <div className="deals-list-header">
            <h3 className="deals-list-title">
              Oportunidades Activas 
              <span className="deals-count-badge">
                {deals.length}
              </span>
            </h3>
          </div>

          <div className="table-card">
            <div className="table-scroll">
              <table className="deals-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Oportunidad</th>
                    <th>Monto</th>
                    <th>Etapa</th>
                    <th>Cierre Est.</th>
                    <th className="th-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table-cell">
                        No hay oportunidades registradas en el pipeline.
                      </td>
                    </tr>
                  ) : (
                    deals.map((deal) => (
                      <tr key={deal.id} className="deal-row">
                        <td className="deal-td-company">
                          {deal.company_name || 'N/D'}
                        </td>
                        <td className="deal-td-title">
                          {deal.title}
                        </td>
                        <td className="deal-td-amount">
                          ${Number(deal.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="deal-td-stage">
                          <span className={`stage-badge ${getStageClass(deal.stage)}`}>
                            {deal.stage}
                          </span>
                        </td>
                        <td className="deal-td-date">
                          {deal.closing_date ? new Date(deal.closing_date).toLocaleDateString() : 'N/D'}
                        </td>
                        <td className="deal-td-actions">
                          <div className="card-actions-group">
                            <button 
                              onClick={() => handleOpenEdit(deal)} 
                              className="btn-edit-action"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleRequestDelete(deal)} 
                              className="btn-delete-row"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal General de Notificaciones / Confirmación */}
      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        showCancel={modalConfig.showCancel}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Modal para Editar Oportunidad */}
      <Modal
        isOpen={editModalOpen}
        type="edit"
        title="Editar Oportunidad de Venta"
        confirmText="Guardar Cambios"
        cancelText="Cancelar"
        showCancel={true}
        onConfirm={() => {
          const fakeEvent = { preventDefault: () => {} };
          handleSaveEdit(fakeEvent);
        }}
        onClose={() => setEditModalOpen(false)}
      >
        <form onSubmit={handleSaveEdit} className="vertical-form">
          <div>
            <label className="field-label">Título de la Oportunidad *</label>
            <input 
              type="text" 
              className="modern-input" 
              value={editForm.title} 
              onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="field-label">Monto ($)</label>
            <input 
              type="number" 
              step="0.01" 
              className="modern-input" 
              value={editForm.amount} 
              onChange={(e) => setEditForm({...editForm, amount: e.target.value})} 
            />
          </div>
          <div>
            <label className="field-label">Etapa del Pipeline</label>
            <select 
              className="modern-input" 
              value={editForm.stage} 
              onChange={(e) => setEditForm({...editForm, stage: e.target.value})}
            >
              <option value="Prospecto">Prospecto</option>
              <option value="Propuesta">Propuesta</option>
              <option value="Negociación">Negociación</option>
              <option value="Ganado">Ganado</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>
          <div>
            <label className="field-label">Fecha Estimada de Cierre</label>
            <input 
              type="date" 
              className="modern-input" 
              value={editForm.closing_date} 
              onChange={(e) => setEditForm({...editForm, closing_date: e.target.value})} 
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}