import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ClientsView() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', status: 'Nuevo' });

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', form);
      setForm({ company_name: '', contact_name: '', email: '', phone: '', status: 'Nuevo' });
      fetchClients();
    } catch (error) {
      console.error('Error al crear cliente:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Enviar este cliente a la papelera?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      }
    }
  };

  const activos = clients.filter(c => c.status === 'Activo').length;
  const nuevos = clients.filter(c => c.status === 'Nuevo').length;

  return (
    <div>
      {/* Hero Banner según Wireframe 1 */}
      <div className="wireframe-hero">
        <h2>Directorio Corporativo de Clientes</h2>
        <p>Administración centralizada de cuentas, contactos clave y seguimiento comercial.</p>
      </div>

      {/* Tarjetas KPI Flotantes en color Cian (#41D1F2) */}
      <div className="kpi-container">
        <div className="kpi-card">
          <h3>{clients.length}</h3>
          <span>Total Clientes</span>
        </div>
        <div className="kpi-card" style={{ backgroundColor: 'var(--cyan-light)' }}>
          <h3>{nuevos}</h3>
          <span>Prospectos Nuevos</span>
        </div>
        <div className="kpi-card">
          <h3>{activos}</h3>
          <span>Cuentas Activas</span>
        </div>
      </div>

      <div style={{ padding: '0 25px 30px 25px' }}>
        {/* Formulario de Registro */}
        <form onSubmit={handleSubmit} className="form-box">
          <h3 style={{ color: 'var(--primary-dark)', marginBottom: '12px', fontSize: '16px' }}>+ Registrar Nueva Cuenta</h3>
          <div className="form-grid">
            <input className="input-field" type="text" placeholder="Nombre de la Empresa" value={form.company_name} onChange={(e) => setForm({...form, company_name: e.target.value})} required />
            <input className="input-field" type="text" placeholder="Contacto Principal" value={form.contact_name} onChange={(e) => setForm({...form, contact_name: e.target.value})} required />
            <input className="input-field" type="email" placeholder="Correo Electrónico" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
            <input className="input-field" type="text" placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
            <select className="input-field" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
              <option value="Nuevo">Estado: Nuevo</option>
              <option value="En Proceso">Estado: En Proceso</option>
              <option value="Activo">Estado: Activo</option>
            </select>
            <button type="submit" className="btn-primary">Guardar Cliente</button>
          </div>
        </form>

        {/* Grilla de Tarjetas (3 columnas en escritorio según Wireframe) */}
        <h3 style={{ color: 'var(--primary-dark)', borderBottom: '2px solid var(--cyan-btn)', paddingBottom: '6px' }}>
          Cartera de Clientes ({clients.length})
        </h3>

        {clients.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text)' }}>No hay clientes registrados aún.</p>
        ) : (
          <div className="cards-grid">
            {clients.map((client) => (
              <div key={client.id} className="wireframe-card">
                <div className="wireframe-card-header">
                  <strong style={{ fontSize: '16px' }}>{client.company_name}</strong>
                  <span className="badge">{client.status}</span>
                </div>
                <div className="wireframe-card-body">
                  <div><strong>👤 Contacto:</strong> {client.contact_name}</div>
                  <div><strong>✉️ Correo:</strong> {client.email}</div>
                  <div><strong>📞 Teléfono:</strong> {client.phone || 'No registrado'}</div>
                </div>
                <div className="wireframe-card-footer">
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>ID: #{client.id}</span>
                  <button onClick={() => handleDelete(client.id)} className="btn-danger">
                    Enviar a Papelera
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}