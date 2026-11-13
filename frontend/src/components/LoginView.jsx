import { useState } from 'react';
import api from '../services/api';
import HoneycombGraphic from './HoneycombGraphic';

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const userData = res.data.user;
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      onLoginSuccess(userData);
    } catch {
      setError('Correo electrónico o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-split">
      <div className="left-panel">
        <div>
          <span className="login-brand-subtitle">
            Turing Inteligencia Artificial
          </span>
          <h1 className="login-brand-title">
            Apex CRM Enterprise
          </h1>
          <div className="login-apex-tags">
            <span className="login-apex-tag"><b>A</b>utomation</span>
            <span className="login-apex-tag"><b>P</b>erformance</span>
            <span className="login-apex-tag"><b>E</b>xcellence</span>
            <span className="login-apex-tag"><b>X</b>perience</span>
          </div>
        </div>

        <div className="honeycomb-graphic">
          <HoneycombGraphic />
        </div>

        <div>
          <p className="login-left-description">
            Organiza clientes, oportunidades y actividades comerciales en un solo lugar para dar seguimiento a cada relación y hacer crecer tu negocio.
          </p>
          <div className="login-left-copyright">
            © 2026 Turing-IA. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Panel Derecho: Estilo Glassmorphism con esferas suaves */}
      <div className="login-right-panel">
        <div className="glass-sphere sphere-1"></div>
        <div className="glass-sphere sphere-2"></div>

        <div className="glass-morphism-card">
          <div className="login-header-group">
            <div className="login-logo-badge">
              A
            </div>
            <h2 className="login-title">
              Apex CRM
            </h2>
            <p className="login-subtitle">
              Sign in to continue
            </p>
          </div>

          {error && (
            <div className="login-error-alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div>
              <label className="login-label" htmlFor="login-email">Correo electrónico</label>
              <input 
                id="login-email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="glass-input"
                placeholder="nombre@empresa.com"
                maxLength={100}
                autoComplete="username"
                title="Ingresa el correo que te asignó el administrador"
              />
              <small className="field-help">Usa el correo registrado por el administrador.</small>
            </div>

            <div>
              <label className="login-label" htmlFor="login-password">Contraseña</label>
              <input 
                id="login-password"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="glass-input"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                maxLength={72}
                autoComplete="current-password"
                title="La contraseña debe tener al menos 8 caracteres y no superar 72 bytes en UTF-8"
              />
              <small className="field-help">Distingue mayúsculas y minúsculas.</small>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="login-submit-btn animated-btn"
            >
              {loading ? 'Validando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="login-card-footer">
            <span className="login-footer-text">
              Secure Access • Apex CRM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
