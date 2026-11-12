import React, { useState, useEffect } from 'react';
import LoginView from './components/LoginView';
import ClientsView from './components/ClientsView';
import DealsView from './components/DealsView';
import TasksView from './components/TasksView';
import TrashView from './components/TrashView';
import AuditView from './components/AuditView';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('clients');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Si un usuario normal intenta ver algo restringido, lo mandamos a clientes por defecto
      if (parsedUser.role !== 'admin' && (currentView === 'trash' || currentView === 'audit')) {
        setCurrentView('clients');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setUser(null);
    setCurrentView('clients');
  };

  if (!user) {
    return <LoginView onLoginSuccess={(userData) => { setUser(userData); setCurrentView('clients'); }} />;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f8fafc' // Color de fondo general opcional
    }}>
      {/* Header Corporativo con indicador de rol */}
      <header style={{ background: 'var(--primary-dark)', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>TURING-IA | CRM Enterprise</h1>
          <span style={{ fontSize: '12px', color: 'var(--cyan-btn)' }}>
            Usuario: {user.name} ({user.role === 'admin' ? 'Administrador' : 'Agente Operativo'})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Módulos comunes para ambos roles */}
          <button 
            onClick={() => setCurrentView('clients')}
            style={{ background: currentView === 'clients' ? 'var(--cyan-btn)' : 'transparent', color: currentView === 'clients' ? 'var(--primary-dark)' : '#fff', border: '1px solid var(--cyan-btn)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Clientes
          </button>
          <button 
            onClick={() => setCurrentView('deals')}
            style={{ background: currentView === 'deals' ? 'var(--cyan-btn)' : 'transparent', color: currentView === 'deals' ? 'var(--primary-dark)' : '#fff', border: '1px solid var(--cyan-btn)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Pipeline
          </button>
          <button 
            onClick={() => setCurrentView('tasks')}
            style={{ background: currentView === 'tasks' ? 'var(--cyan-btn)' : 'transparent', color: currentView === 'tasks' ? 'var(--primary-dark)' : '#fff', border: '1px solid var(--cyan-btn)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Tareas
          </button>

          {/* Módulos exclusivos para rol 'admin' */}
          {user.role === 'admin' && (
            <>
              <button 
                onClick={() => setCurrentView('trash')}
                style={{ background: currentView === 'trash' ? 'var(--cyan-btn)' : 'transparent', color: currentView === 'trash' ? 'var(--primary-dark)' : '#fff', border: '1px solid var(--cyan-btn)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Papelera
              </button>
              <button 
                onClick={() => setCurrentView('audit')}
                style={{ background: currentView === 'audit' ? 'var(--cyan-btn)' : 'transparent', color: currentView === 'audit' ? 'var(--primary-dark)' : '#fff', border: '1px solid var(--cyan-btn)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Auditoría
              </button>
            </>
          )}

          <button 
            onClick={handleLogout}
            style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Renderizado de vistas protegido por rol (flex: 1 empuja el footer hacia abajo) */}
      <main style={{ flex: '1', paddingBottom: '40px' }}>
        {currentView === 'clients' && <ClientsView />}
        {currentView === 'deals' && <DealsView />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'trash' && user.role === 'admin' && <TrashView />}
        {currentView === 'audit' && user.role === 'admin' && <AuditView />}
      </main>

      {/* Footer estático anclado abajo */}
      <footer className="corporate-footer" style={{ marginTop: 'auto' }}>
        <div>
          <strong style={{ color: '#fff' }}>TURING INTELIGENCIA ARTIFICIAL S.A.S.</strong>
          <p style={{ fontSize: '12px', marginTop: '2px' }}>Sistema Integral de Gestión Comercial (CRM)</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span style={{ color: 'var(--cyan-btn)' }}>● Estado: En línea</span>
          <span>v1.0.0 Enterprise</span>
        </div>
      </footer>
    </div>
  );
}

export default App;