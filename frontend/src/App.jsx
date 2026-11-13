import { useEffect, useState } from 'react';
import LoginView from './components/LoginView';
import ClientsView from './components/ClientsView';
import DealsView from './components/DealsView';
import TasksView from './components/TasksView';
import TrashView from './components/TrashView';
import AuditView from './components/AuditView';
import InteractionsView from './components/InteractionsView';
import UsersView from './components/UsersView';
import api from './services/api';

const navigation = [
  { id: 'clients', label: 'Clientes' },
  { id: 'deals', label: 'Pipeline' },
  { id: 'interactions', label: 'Interacciones' },
  { id: 'tasks', label: 'Tareas' },
  { id: 'trash', label: 'Papelera', adminOnly: true },
  { id: 'audit', label: 'Auditoría', adminOnly: true },
  { id: 'users', label: 'Usuarios', adminOnly: true },
];

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('clients');
  const [isCheckingSession, setIsCheckingSession] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return undefined;

    let isMounted = true;
    api.get('/auth/me')
      .then(({ data }) => {
        if (isMounted) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => {
        if (isMounted) setIsCheckingSession(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('clients');
  };

  if (isCheckingSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-surface text-sm font-medium text-slate-600">
        <span className="flex items-center gap-3" role="status">
          <span className="size-5 animate-spin rounded-full border-2 border-brand-cyan border-t-transparent" />
          Verificando sesión segura...
        </span>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLoginSuccess={(userData) => { setUser(userData); setCurrentView('clients'); }} />;
  }

  const visibleNavigation = navigation.filter((item) => !item.adminOnly || user.role === 'admin');

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface font-sans text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-navy text-white shadow-lg shadow-brand-navy/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-cyan text-lg font-black text-brand-navy shadow-md shadow-brand-cyan/20">T</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold tracking-wide sm:text-base">TURING-IA <span className="font-medium text-slate-300">/ CRM</span></p>
                <p className="mt-0.5 text-xs text-slate-300">Gestión comercial</p>
              </div>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 lg:hidden">
              {user.role === 'admin' ? 'Administrador' : 'Agente'}
            </span>
          </div>

          <nav aria-label="Navegación principal" className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {visibleNavigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentView(item.id)}
                aria-current={currentView === item.id ? 'page' : undefined}
                className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan sm:px-4 ${currentView === item.id ? 'bg-brand-cyan text-brand-navy shadow-md shadow-brand-cyan/20' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <p className="max-w-40 truncate text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-300">{user.role === 'admin' ? 'Administrador' : 'Agente operativo'}</p>
            </div>
            <span className="size-9 rounded-full border border-brand-cyan/50 bg-brand-blue text-center text-sm font-bold leading-9 text-white" aria-hidden="true">
              {user.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}
            </span>
            <button type="button" onClick={handleLogout} className="rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-rose-300/70 hover:bg-rose-400/10 hover:text-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan">
              Cerrar sesión
            </button>
          </div>

          <button type="button" onClick={handleLogout} className="w-full rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan lg:hidden">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        {currentView === 'clients' && <ClientsView />}
        {currentView === 'deals' && <DealsView />}
        {currentView === 'interactions' && <InteractionsView user={user} />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'trash' && user.role === 'admin' && <TrashView />}
        {currentView === 'audit' && user.role === 'admin' && <AuditView />}
        {currentView === 'users' && user.role === 'admin' && <UsersView />}
      </main>

      <footer className="mt-auto border-t-4 border-brand-cyan bg-brand-navy text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
          <div>
            <p className="text-xs font-bold tracking-wide text-white">TURING INTELIGENCIA ARTIFICIAL S.A.S.</p>
            <p className="mt-1 text-xs text-slate-300">Sistema Integral de Gestión Comercial</p>
          </div>
          <div className="flex flex-col gap-2 text-xs font-medium text-slate-200 sm:items-end">
            <p><span className="mr-2 inline-block size-2 rounded-full bg-brand-mint" />Sesión protegida con JWT</p>
            <p className="text-slate-300">© {new Date().getFullYear()} Karla Díaz. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
