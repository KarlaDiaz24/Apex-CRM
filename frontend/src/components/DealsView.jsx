import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function DealsView() {
  const [deals, setDeals] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ client_id: '', title: '', amount: '', stage: 'Prospecto', closing_date: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    setError('');
    setSuccess('');

    if (!form.client_id || !form.title) {
      setError('Por favor selecciona un cliente y asigna un título a la oportunidad.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/deals', form);
      setSuccess('¡Oportunidad creada con éxito!');
      setForm({ client_id: '', title: '', amount: '', stage: 'Prospecto', closing_date: '' });
      fetchData();
    } catch (error) {
      console.error('Error al crear deal:', error);
      setError('Error al registrar la oportunidad. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta oportunidad de venta?')) {
      try {
        await api.delete(`/deals/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error al eliminar deal:', error);
      }
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
                          <button 
                            onClick={() => handleDelete(deal.id)} 
                            className="btn-delete-row"
                          >
                            Eliminar
                          </button>
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
    </div>
  );
}