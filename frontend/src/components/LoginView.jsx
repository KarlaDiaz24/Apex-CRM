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
    <>
      <style>{`
        @keyframes floatHex {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.03); }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes pulseGlow {
          0% { opacity: 0.6; filter: drop-shadow(0 0 20px rgba(65, 209, 242, 0.5)); }
          50% { opacity: 1; filter: drop-shadow(0 0 45px rgba(65, 209, 242, 0.95)); }
          100% { opacity: 0.6; filter: drop-shadow(0 0 20px rgba(65, 209, 242, 0.5)); }
        }
        @keyframes floatSphere1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(25px, -35px) scale(1.05); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatSphere2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-30px, 25px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .bg-split {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          min-height: 100vh;
          width: 100vw;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          background-color: #FFFFFF;
        }
        @media (max-width: 900px) {
          .bg-split {
            grid-template-columns: 1fr;
          }
          .left-panel {
            display: none !important;
          }
        }
        .honeycomb-graphic {
          animation: floatHex 7s infinite ease-in-out;
        }
        .glow-node {
          animation: pulseGlow 4s infinite ease-in-out;
        }
        .glass-morphism-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 28px;
          padding: 45px 35px;
          box-shadow: 0 30px 60px rgba(31, 46, 64, 0.12);
        }
        .glass-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(10px);
          z-index: 1;
        }
        .sphere-1 {
          width: 220px;
          height: 220px;
          background: linear-gradient(135deg, rgba(65, 209, 242, 0.4), rgba(2, 83, 117, 0.3));
          bottom: 5%;
          left: 10%;
          animation: floatSphere1 8s infinite ease-in-out;
        }
        .sphere-2 {
          width: 140px;
          height: 140px;
          background: linear-gradient(135deg, rgba(2, 83, 117, 0.35), rgba(31, 46, 64, 0.25));
          top: 10%;
          right: 15%;
          animation: floatSphere2 10s infinite ease-in-out;
        }
        .glass-input {
          background: rgba(255, 255, 255, 0.5) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          border-radius: 10px !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
          color: #1F2E40 !important;
        }
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.9) !important;
          border-color: #41D1F2 !important;
          box-shadow: 0 0 0 3px rgba(65, 209, 242, 0.2) !important;
        }
        .animated-btn {
          transition: all 0.3s ease;
        }
        .animated-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(2, 83, 117, 0.35) !important;
        }
      `}</style>

      <div className="bg-split">
        {/* Panel Izquierdo con Gráfico de Hexágonos y Significado de APEX */}
        <div className="left-panel" style={{
          background: 'linear-gradient(135deg, #1F2E40 0%, #025375 100%)',
          color: '#FFFFFF',
          padding: '40px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#41D1F2', fontWeight: '700' }}>
              Turing Inteligencia Artificial
            </span>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px', lineHeight: '1.2' }}>
              Apex CRM Enterprise
            </h1>
            {/* Significado Conceptual de APEX */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', background: 'rgba(65, 209, 242, 0.15)', border: '1px solid rgba(65, 209, 242, 0.3)', color: '#41D1F2', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}><b>A</b>utomation</span>
              <span style={{ fontSize: '11px', background: 'rgba(65, 209, 242, 0.15)', border: '1px solid rgba(65, 209, 242, 0.3)', color: '#41D1F2', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}><b>P</b>erformance</span>
              <span style={{ fontSize: '11px', background: 'rgba(65, 209, 242, 0.15)', border: '1px solid rgba(65, 209, 242, 0.3)', color: '#41D1F2', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}><b>E</b>xcellence</span>
              <span style={{ fontSize: '11px', background: 'rgba(65, 209, 242, 0.15)', border: '1px solid rgba(65, 209, 242, 0.3)', color: '#41D1F2', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}><b>X</b>perience</span>
            </div>
          </div>

          <div className="honeycomb-graphic" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '10px 0' }}>
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
            <p style={{ color: '#CBD5E1', fontSize: '13px', lineHeight: '1.5', maxWidth: '450px' }}>
              Plataforma centralizada en la cúspide de la gestión comercial y automatización de cuentas empresariales.
            </p>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#94A3B8' }}>
              © 2026 Turing-IA. Todos los derechos reservados.
            </div>
          </div>
        </div>

        {/* Panel Derecho: Estilo Glassmorphism con esferas suaves */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '30px',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="glass-sphere sphere-1"></div>
          <div className="glass-sphere sphere-2"></div>

          <div className="glass-morphism-card" style={{
            width: '100%',
            maxWidth: '420px',
            zIndex: 2
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #025375 0%, #41D1F2 100%)',
                color: '#FFFFFF',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: '900',
                margin: '0 auto 12px auto',
                boxShadow: '0 6px 15px rgba(2, 83, 117, 0.25)'
              }}>
                ⬡
              </div>
              <h2 style={{ color: '#1F2E40', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
                Apex CRM
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                Sign in to continue
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(254, 242, 242, 0.8)',
                color: '#DC2626',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid rgba(252, 165, 165, 0.5)',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                className="animated-btn"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #025375 0%, #1F2E40 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '15px',
                  marginTop: '10px',
                  boxShadow: '0 4px 15px rgba(2, 83, 117, 0.3)'
                }}
              >
                {loading ? 'Verifying...' : 'Sign in'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '15px' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                Secure Access • Apex CRM
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}