import React, { useState } from 'react';
import api from '../services/api';

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
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      
      onLoginSuccess(userData);
    } catch (err) {
      setError('Correo electrónico o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-split">
      {/* Panel Izquierdo con Gráfico de Hexágonos y Significado de APEX */}
      <div className="left-panel">
        <div>
          <span className="login-brand-subtitle">
            Turing Inteligencia Artificial
          </span>
          <h1 className="login-brand-title">
            Apex CRM Enterprise
          </h1>
          {/* Significado Conceptual de APEX */}
          <div className="login-apex-tags">
            <span className="login-apex-tag"><b>A</b>utomation</span>
            <span className="login-apex-tag"><b>P</b>erformance</span>
            <span className="login-apex-tag"><b>E</b>xcellence</span>
            <span className="login-apex-tag"><b>X</b>perience</span>
          </div>
        </div>

        <div className="honeycomb-graphic">
          <svg width="100%" height="340px" viewBox="0 0 700 440" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="350" y1="220" x2="350" y2="60" stroke="rgba(65, 209, 242, 0.45)" strokeWidth="5" />
            <line x1="350" y1="220" x2="170" y2="130" stroke="rgba(65, 209, 242, 0.45)" strokeWidth="5" />
            <line x1="350" y1="220" x2="530" y2="130" stroke="rgba(65, 209, 242, 0.45)" strokeWidth="5" />
            <line x1="350" y1="220" x2="170" y2="310" stroke="rgba(65, 209, 242, 0.45)" strokeWidth="5" />
            <line x1="350" y1="220" x2="530" y2="310" stroke="rgba(65, 209, 242, 0.45)" strokeWidth="5" />

            <g className="glow-node" transform="translate(350, 220)">
              <polygon points="0,-80 70,-38 70,38 0,80 -70,38 -70,-38" fill="#1F2E40" stroke="#41D1F2" strokeWidth="6" />
              <text x="0" y="10" textAnchor="middle" fill="#FFFFFF" fontSize="30" fontWeight="900">CRM</text>
            </g>

            <g transform="translate(350, 50)">
              <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="rgba(2, 83, 117, 0.9)" stroke="#41D1F2" strokeWidth="3.5" />
              <rect x="-18" y="6" width="8" height="20" fill="#41D1F2" />
              <rect x="-6" y="-4" width="8" height="30" fill="#FFFFFF" />
              <rect x="6" y="-16" width="8" height="42" fill="#41D1F2" />
            </g>

            <g transform="translate(170, 120)">
              <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="rgba(2, 83, 117, 0.9)" stroke="#41D1F2" strokeWidth="3.5" />
              <circle cx="-14" cy="10" r="6" fill="#41D1F2" />
              <circle cx="14" cy="-10" r="6" fill="#FFFFFF" />
              <line x1="-14" y1="10" x2="14" y2="-10" stroke="#41D1F2" strokeWidth="3.5" />
            </g>

            <g transform="translate(530, 120)">
              <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="rgba(2, 83, 117, 0.9)" stroke="#41D1F2" strokeWidth="3.5" />
              <circle cx="0" cy="0" r="13" fill="none" stroke="#41D1F2" strokeWidth="6" />
            </g>

            <g transform="translate(170, 310)">
              <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="rgba(2, 83, 117, 0.9)" stroke="#41D1F2" strokeWidth="3.5" />
              <circle cx="0" cy="-8" r="8" fill="#FFFFFF" />
              <path d="M-15 18 C-15 10 -8 6 0 6 C8 6 15 10 15 18" stroke="#41D1F2" strokeWidth="4" strokeLinecap="round" />
            </g>

            <g transform="translate(530, 310)">
              <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="rgba(2, 83, 117, 0.9)" stroke="#41D1F2" strokeWidth="3.5" />
              <text x="0" y="10" textAnchor="middle" fill="#41D1F2" fontSize="30" fontWeight="bold">$</text>
            </g>
          </svg>
        </div>

        <div>
          <p className="login-left-description">
            Plataforma centralizada en la cúspide de la gestión comercial y automatización de cuentas empresariales.
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
              ⬡
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
              <label className="login-label">
                Email address
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="glass-input"
                placeholder="admin@turing-crm.com" 
              />
            </div>

            <div>
              <label className="login-label">
                Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="glass-input"
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="login-submit-btn animated-btn"
            >
              {loading ? 'Verifying...' : 'Sign in'}
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