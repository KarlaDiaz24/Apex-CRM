import React, { useState, useEffect } from 'react';
import LoginView from './components/LoginView';
import ClientsView from './components/ClientsView';
import DealsView from './components/DealsView';
import TasksView from './components/TasksView';
import TrashView from './components/TrashView';
import AuditView from './components/AuditView';
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('clients');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        if (data.user.role !== 'admin') setCurrentView('clients');
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('clients');
  };

  if (!user) {
    return <LoginView onLoginSuccess={(userData) => { setUser(userData); setCurrentView('clients'); }} />;
  }

  return (
    <div className="app-container">
      {/* Header Corporativo con indicador de rol */}
      <header className="app-header">
        <div>
          <h1 className="app-header-title">TURING-IA | CRM Enterprise</h1>
          <span className="app-header-user">
            Usuario: {user.name} ({user.role === 'admin' ? 'Administrador' : 'Agente Operativo'})
          </span>
        </div>

        <div className="app-header-nav">
          {/* Módulos comunes para ambos roles */}
          <button 
            onClick={() => setCurrentView('clients')}
            className={`app-nav-btn ${currentView === 'clients' ? 'active' : ''}`}
          >
            Clientes
          </button>
          <button 
            onClick={() => setCurrentView('deals')}
            className={`app-nav-btn ${currentView === 'deals' ? 'active' : ''}`}
          >
            Pipeline
          </button>
          <button 
            onClick={() => setCurrentView('tasks')}
            className={`app-nav-btn ${currentView === 'tasks' ? 'active' : ''}`}
          >
            Tareas
          </button>

          {/* Módulos exclusivos para rol 'admin' */}
          {user.role === 'admin' && (
            <>
              <button 
                onClick={() => setCurrentView('trash')}
                className={`app-nav-btn ${currentView === 'trash' ? 'active' : ''}`}
              >
                Papelera
              </button>
              <button 
                onClick={() => setCurrentView('audit')}
                className={`app-nav-btn ${currentView === 'audit' ? 'active' : ''}`}
              >
                Auditoría
              </button>
            </>
          )}

          <button 
            onClick={handleLogout}
            className="app-logout-btn"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Renderizado de vistas protegido por rol */}
      <main className="app-main">
        {currentView === 'clients' && <ClientsView />}
        {currentView === 'deals' && <DealsView />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'trash' && user.role === 'admin' && <TrashView />}
        {currentView === 'audit' && user.role === 'admin' && <AuditView />}
      </main>

      {/* Footer estático anclado abajo */}
      <footer className="corporate-footer">
        <div>
          <strong className="footer-company-name">TURING INTELIGENCIA ARTIFICIAL S.A.S.</strong>
          <p className="footer-tagline">Sistema Integral de Gestión Comercial (CRM)</p>
        </div>
        <div className="footer-status-group">
          <span className="footer-status-indicator">● Estado: En línea</span>
          <span>v1.0.0 Enterprise</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
