import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from './Modal';

export default function TrashView() {
  const [deletedClients, setDeletedClients] = useState([]);
  const [pendingRestoreId, setPendingRestoreId] = useState(null);
  const [pendingRestoreName, setPendingRestoreName] = useState('');

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

  const handleRestore = (id, company_name) => {
    setPendingRestoreId(id);
    setPendingRestoreName(company_name);
    showModal({
      type: 'warning',
      title: 'Restaurar Cliente',
      message: `¿Deseas restaurar a "${company_name}" a la cartera activa? El registro volverá a estar disponible en el sistema.`,
      confirmText: 'Sí, restaurar',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: () => confirmRestore(id),
    });
  };

  const confirmRestore = async (id) => {
    closeModal();
    try {
      await api.put(`/clients/restore/${id}`);
      fetchDeletedClients();
      showModal({
        type: 'success',
        title: '¡Cliente Restaurado!',
        message: 'El registro fue reintegrado exitosamente a la cartera activa de clientes.',
        confirmText: 'Aceptar',
        onConfirm: closeModal,
      });
    } catch (error) {
      console.error('Error al restaurar cliente:', error);
      showModal({
        type: 'danger',
        title: 'Error al Restaurar',
        message: 'No se pudo restaurar el cliente. Verifica la conexión e intenta de nuevo.',
        confirmText: 'Cerrar',
        onConfirm: closeModal,
      });
    }
  };

  return (
    <div className="trash-page-container">
      {/* Encabezado */}
      <div className="trash-header">
        <h2 className="trash-title">
          Papelera de Clientes (Restauración)
        </h2>
        <p className="trash-subtitle">
          Registros eliminados lógicamente del sistema. Puedes restaurarlos en cualquier momento para mantener la integridad de la información comercial.
        </p>
      </div>

      {/* Contenedor Elegante */}
      <div className="trash-container-card">
        <div className="trash-list-header">
          <h3 className="trash-list-title">
            Registros en Papelera 
            <span className="trash-count-badge">
              {deletedClients.length}
            </span>
          </h3>
        </div>

        <div className="trash-table-card">
          <div className="trash-table-scroll">
            <table className="trash-table">
              <thead>
                <tr className="trash-table-thead-tr">
                  <th className="trash-table-th">Empresa</th>
                  <th className="trash-table-th">Contacto</th>
                  <th className="trash-table-th">Correo</th>
                  <th className="trash-table-th">Fecha Eliminación</th>
                  <th className="trash-table-th th-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {deletedClients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="trash-empty-cell">
                      La papelera está vacía. No hay registros eliminados.
                    </td>
                  </tr>
                ) : (
                  deletedClients.map((client) => (
                    <tr key={client.id} className="trash-row">
                      <td className="trash-td-company">
                        🏢 {client.company_name}
                      </td>
                      <td className="trash-td-contact">
                        {client.contact_name}
                      </td>
                      <td className="trash-td-email">
                        {client.email}
                      </td>
                      <td className="trash-td-date">
                        {client.deleted_at ? new Date(client.deleted_at).toLocaleString() : 'N/D'}
                      </td>
                      <td className="trash-td-actions">
                        <button 
                          onClick={() => handleRestore(client.id, client.company_name)} 
                          className="btn-restore-modern"
                        >
                          ↺ Restaurar
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
