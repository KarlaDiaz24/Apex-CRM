import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AuditView() {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit');
      setLogs(res.data);
    } catch (error) {
      console.error('Error al cargar registros de auditoría:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadgeClass = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('CREAR') || act.includes('INSERT') || act.includes('POST')) {
      return 'badge-create';
    }
    if (act.includes('ELIMINAR') || act.includes('DELETE') || act.includes('TRASH')) {
      return 'badge-delete';
    }
    if (act.includes('ACTUALIZAR') || act.includes('UPDATE') || act.includes('PUT')) {
      return 'badge-update';
    }
    return 'badge-default';
  };

  return (
    <div className="audit-page-container">
      {/* Encabezado */}
      <div className="audit-header">
        <h2 className="audit-title">
          Auditoría y Trazabilidad del Sistema
        </h2>
        <p className="audit-subtitle">
          Registro automatizado de todas las acciones críticas realizadas por los usuarios en el CRM Enterprise.
        </p>
      </div>

      {/* Contenedor Elegante */}
      <div className="audit-container-card">
        <div className="audit-list-header">
          <h3 className="audit-list-title">
            Bitácora de Actividad 
            <span className="audit-count-badge">
              {logs.length}
            </span>
          </h3>
        </div>

        <div className="audit-table-card">
          <div className="audit-table-scroll">
            <table className="audit-table">
              <thead>
                <tr className="audit-table-thead-tr">
                  <th className="audit-table-th">ID</th>
                  <th className="audit-table-th">Usuario</th>
                  <th className="audit-table-th">Acción</th>
                  <th className="audit-table-th">Detalles</th>
                  <th className="audit-table-th">Fecha / Hora</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="audit-empty-cell">
                      No hay registros de auditoría disponibles.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="audit-row">
                      <td className="audit-td-id">
                        #{log.id}
                      </td>
                      <td className="audit-td-user">
                        👤 {log.user_name || 'Sistema / Desconocido'}
                      </td>
                      <td className="audit-td-action">
                        <span className={`audit-badge ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="audit-td-details">
                        {log.details || 'Sin detalles adicionales'}
                      </td>
                      <td className="audit-td-date">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/D'}
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
  );
}