import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from './Modal';

export default function ClientsView() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', status: 'Nuevo' });

  // Estados para modal de notificación / confirmación
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

  // Estados para modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', status: 'Nuevo' });

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
      const createdName = form.company_name;
      setForm({ company_name: '', contact_name: '', email: '', phone: '', status: 'Nuevo' });
      fetchClients();
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: '¡Cliente Registrado!',
        message: `La cuenta "${createdName}" se ha creado exitosamente en el CRM.`,
        confirmText: 'Aceptar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: 'danger',
        title: 'Error al Crear',
        message: 'No fue posible registrar la cuenta. Por favor verifica los datos.',
        confirmText: 'Cerrar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setEditForm({
      company_name: client.company_name || '',
      contact_name: client.contact_name || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status || 'Nuevo'
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clients/${editingClient.id}`, editForm);
      setEditModalOpen(false);
      fetchClients();
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: '¡Cliente Actualizado!',
        message: `La información de "${editForm.company_name}" se actualizó exitosamente.`,
        confirmText: 'Aceptar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: 'danger',
        title: 'Error al Actualizar',
        message: 'No fue posible actualizar la información del cliente.',
        confirmText: 'Cerrar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const handleRequestDelete = (client) => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Enviar a Papelera',
      message: `¿Estás seguro de enviar la cuenta "${client.company_name}" a la papelera? Podrás restaurarla en cualquier momento desde la sección de Papelera.`,
      confirmText: 'Sí, Enviar a Papelera',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: () => executeDelete(client.id, client.company_name)
    });
  };

  const executeDelete = async (id, name) => {
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: '¡Cliente Enviado a Papelera!',
        message: `La cuenta "${name}" ha sido trasladada a la papelera con éxito.`,
        confirmText: 'Aceptar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: 'danger',
        title: 'Error al Eliminar',
        message: 'Ocurrió un error al intentar eliminar el cliente.',
        confirmText: 'Cerrar',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
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
        <div className="kpi-card kpi-card-highlight">
          <h3>{nuevos}</h3>
          <span>Prospectos Nuevos</span>
        </div>
        <div className="kpi-card">
          <h3>{activos}</h3>
          <span>Cuentas Activas</span>
        </div>
      </div>

      <div className="clients-content-wrapper">
        {/* Formulario de Registro */}
        <form onSubmit={handleSubmit} className="form-box">
          <h3 className="form-box-title">+ Registrar Nueva Cuenta</h3>
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
        <h3 className="section-divider-title">
          Cartera de Clientes ({clients.length})
        </h3>

        {clients.length === 0 ? (
          <p className="empty-message">No hay clientes registrados aún.</p>
        ) : (
          <div className="cards-grid">
            {clients.map((client) => (
              <div key={client.id} className="wireframe-card">
                <div className="wireframe-card-header">
                  <strong className="card-title-strong">{client.company_name}</strong>
                  <span className="badge">{client.status}</span>
                </div>
                <div className="wireframe-card-body">
                  <div><strong>👤 Contacto:</strong> {client.contact_name}</div>
                  <div><strong>✉️ Correo:</strong> {client.email}</div>
                  <div><strong>📞 Teléfono:</strong> {client.phone || 'No registrado'}</div>
                </div>
                <div className="wireframe-card-footer">
                  <span className="card-id-label">ID: #{client.id}</span>
                  <div className="card-actions-group">
                    <button onClick={() => handleOpenEdit(client)} className="btn-edit-action">
                      Editar
                    </button>
                    <button onClick={() => handleRequestDelete(client)} className="btn-danger">
                      Enviar a Papelera
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Modal para Editar Cliente */}
      <Modal
        isOpen={editModalOpen}
        type="edit"
        title="Editar Cuenta de Cliente"
        confirmText="Guardar Cambios"
        cancelText="Cancelar"
        showCancel={true}
        onConfirm={() => {
          // Dispara el submit del formulario de edición
          const fakeEvent = { preventDefault: () => {} };
          handleSaveEdit(fakeEvent);
        }}
        onClose={() => setEditModalOpen(false)}
      >
        <form onSubmit={handleSaveEdit} className="vertical-form">
          <div>
            <label className="field-label">Nombre de la Empresa *</label>
            <input 
              type="text" 
              className="modern-input" 
              value={editForm.company_name} 
              onChange={(e) => setEditForm({...editForm, company_name: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="field-label">Contacto Principal *</label>
            <input 
              type="text" 
              className="modern-input" 
              value={editForm.contact_name} 
              onChange={(e) => setEditForm({...editForm, contact_name: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="field-label">Correo Electrónico *</label>
            <input 
              type="email" 
              className="modern-input" 
              value={editForm.email} 
              onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="field-label">Teléfono</label>
            <input 
              type="text" 
              className="modern-input" 
              value={editForm.phone} 
              onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
            />
          </div>
          <div>
            <label className="field-label">Estado de la Cuenta</label>
            <select 
              className="modern-input" 
              value={editForm.status} 
              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
            >
              <option value="Nuevo">Nuevo</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Activo">Activo</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
