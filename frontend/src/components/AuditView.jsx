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
    <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ borderBottom: '3px solid var(--cyan-btn)', paddingBottom: '8px' }}>
        Auditoría y Trazabilidad del Sistema
      </h2>
      <p style={{ marginBottom: '20px', color: 'var(--text)' }}>
        Registro automatizado de todas las acciones críticas realizadas por los usuarios en el CRM.
      </p>

      {/* Tabla de Auditoría */}
      <div className="table-responsive" style={{ background: 'var(--bg)', borderRadius: '8px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'var(--primary-dark)', color: '#fff' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Usuario</th>
              <th style={{ padding: '12px' }}>Acción</th>
              <th style={{ padding: '12px' }}>Detalles</th>
              <th style={{ padding: '12px' }}>Fecha / Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text)' }}>No hay registros de auditoría.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{log.id}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{log.user_name || 'Sistema / Desconocido'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--accent-bg)', color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '12px' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{log.details}</td>
                  <td style={{ padding: '12px' }}>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}