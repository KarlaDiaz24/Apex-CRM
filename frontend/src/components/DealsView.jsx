import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function DealsView() {
  const [deals, setDeals] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ client_id: '', title: '', amount: '', stage: 'Prospecto', closing_date: '' });

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
    try {
      await api.post('/deals', form);
      setForm({ client_id: '', title: '', amount: '', stage: 'Prospecto', closing_date: '' });
      fetchData();
    } catch (error) {
      console.error('Error al crear deal:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta oportunidad de venta?')) {
      try {
        await api.delete(`/deals/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error al eliminar deal:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ borderBottom: '3px solid var(--cyan-btn)', paddingBottom: '8px' }}>
        Pipeline de Ventas (Deals)
      </h2>

      {/* Formulario para nuevo Deal */}
      <form onSubmit={handleSubmit} className="form-grid" style={{ background: 'var(--bg-light)', padding: '20px', borderRadius: '8px', marginBottom: '25px', boxShadow: 'var(--shadow)' }}>
        <select value={form.client_id} onChange={(e) => setForm({...form, client_id: e.target.value})} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--accent-blue)', width: '100%' }}>
          <option value="">Seleccione un Cliente</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.company_name}</option>
          ))}
        </select>
        <input type="text" placeholder="Título de la Oportunidad" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--accent-blue)', width: '100%' }} />
        <input type="number" step="0.01" placeholder="Monto ($)" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--accent-blue)', width: '100%' }} />
        <select value={form.stage} onChange={(e) => setForm({...form, stage: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--accent-blue)', width: '100%' }}>
          <option value="Prospecto">Prospecto</option>
          <option value="Propuesta">Propuesta</option>
          <option value="Negociación">Negociación</option>
          <option value="Ganado">Ganado</option>
          <option value="Perdido">Perdido</option>
        </select>
        <input type="date" value={form.closing_date} onChange={(e) => setForm({...form, closing_date: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--accent-blue)', width: '100%' }} />
        <button type="submit" style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', gridColumn: '1 / -1' }}>
          Crear Oportunidad
        </button>
      </form>

      {/* Tabla de Deals */}
      <div className="table-responsive" style={{ background: 'var(--bg)', borderRadius: '8px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'var(--primary-dark)', color: '#fff' }}>
              <th style={{ padding: '12px' }}>Empresa</th>
              <th style={{ padding: '12px' }}>Oportunidad</th>
              <th style={{ padding: '12px' }}>Monto</th>
              <th style={{ padding: '12px' }}>Etapa</th>
              <th style={{ padding: '12px' }}>Cierre Est.</th>
              <th style={{ padding: '12px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text)' }}>No hay oportunidades registradas.</td></tr>
            ) : (
              deals.map((deal) => (
                <tr key={deal.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', color: 'var(--text-h)' }}>{deal.company_name}</td>
                  <td style={{ padding: '12px' }}>{deal.title}</td>
                  <td style={{ padding: '12px' }}>${Number(deal.amount).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--accent-bg)', color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '13px' }}>
                      {deal.stage}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{deal.closing_date ? new Date(deal.closing_date).toLocaleDateString() : 'N/D'}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleDelete(deal.id)} style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
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
  );
}