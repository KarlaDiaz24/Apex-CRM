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
    <div className="admin-view-container">
      <h2 className="admin-view-title">
        Papelera de Clientes (Restauración)
      </h2>
      <p className="admin-view-desc">
        Aquí se muestran los registros eliminados lógicamente. Puedes restaurarlos en cualquier momento para mantener la integridad de la información.
      </p>

      {/* Tabla de Clientes en Papelera */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr className="data-table-header">
              <th className="data-table-th">Empresa</th>
              <th className="data-table-th">Contacto</th>
              <th className="data-table-th">Correo</th>
              <th className="data-table-th">Fecha Eliminación</th>
              <th className="data-table-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {deletedClients.length === 0 ? (
              <tr><td colSpan="5" className="data-table-empty">La papelera está vacía.</td></tr>
            ) : (
              deletedClients.map((client) => (
                <tr key={client.id} className="data-table-tr">
                  <td className="data-table-td-bold">{client.company_name}</td>
                  <td className="data-table-td">{client.contact_name}</td>
                  <td className="data-table-td">{client.email}</td>
                  <td className="data-table-td">{client.deleted_at ? new Date(client.deleted_at).toLocaleString() : 'N/D'}</td>
                  <td className="data-table-td">
                    <button 
                      onClick={() => handleRestore(client.id)} 
                      className="btn-restore"
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