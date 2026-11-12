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

  return (
    <div className="admin-view-container">
      <h2 className="admin-view-title">
        Auditoría y Trazabilidad del Sistema
      </h2>
      <p className="admin-view-desc">
        Registro automatizado de todas las acciones críticas realizadas por los usuarios en el CRM.
      </p>

      {/* Tabla de Auditoría */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr className="data-table-header">
              <th className="data-table-th">ID</th>
              <th className="data-table-th">Usuario</th>
              <th className="data-table-th">Acción</th>
              <th className="data-table-th">Detalles</th>
              <th className="data-table-th">Fecha / Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="5" className="data-table-empty">No hay registros de auditoría.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="data-table-tr">
                  <td className="data-table-td">{log.id}</td>
                  <td className="data-table-td-bold">{log.user_name || 'Sistema / Desconocido'}</td>
                  <td className="data-table-td">
                    <span className="audit-action-badge">
                      {log.action}
                    </span>
                  </td>
                  <td className="data-table-td">{log.details}</td>
                  <td className="data-table-td">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}