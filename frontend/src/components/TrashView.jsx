import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function TrashView() {
  const [deletedClients, setDeletedClients] = useState([]);

  const fetchDeletedClients = async () => {
    try {
      const res = await api.get('/clients/deleted');
      setDeletedClients(res.data);
    } catch (error) {
      console.error('Error al cargar clientes eliminados:', error);
    }
  };

  useEffect(() => {
    fetchDeletedClients();
  }, []);

  const handleRestore = async (id) => {
    try {
      await api.put(`/clients/restore/${id}`);
      fetchDeletedClients();
      alert('¡Cliente restaurado exitosamente!');
    } catch (error) {
      console.error('Error al restaurar cliente:', error);
      alert('Error al restaurar el cliente.');
    }
  };

  return (
    <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ borderBottom: '3px solid var(--cyan-btn)', paddingBottom: '8px' }}>
        Papelera de Clientes (Restauración)
      </h2>
      <p style={{ marginBottom: '20px', color: 'var(--text)' }}>
        Aquí se muestran los registros eliminados lógicamente. Puedes restaurarlos en cualquier momento para mantener la integridad de la información.
      </p>

      {/* Tabla de Clientes en Papelera */}
      <div className="table-responsive" style={{ background: 'var(--bg)', borderRadius: '8px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'var(--primary-dark)', color: '#fff' }}>
              <th style={{ padding: '12px' }}>Empresa</th>
              <th style={{ padding: '12px' }}>Contacto</th>
              <th style={{ padding: '12px' }}>Correo</th>
              <th style={{ padding: '12px' }}>Fecha Eliminación</th>
              <th style={{ padding: '12px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {deletedClients.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text)' }}>La papelera está vacía.</td></tr>
            ) : (
              deletedClients.map((client) => (
                <tr key={client.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', color: 'var(--text-h)', fontWeight: 'bold' }}>{client.company_name}</td>
                  <td style={{ padding: '12px' }}>{client.contact_name}</td>
                  <td style={{ padding: '12px' }}>{client.email}</td>
                  <td style={{ padding: '12px' }}>{client.deleted_at ? new Date(client.deleted_at).toLocaleString() : 'N/D'}</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleRestore(client.id)} 
                      style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Restaurar
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