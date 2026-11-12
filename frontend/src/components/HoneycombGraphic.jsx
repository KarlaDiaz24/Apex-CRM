export default function HoneycombGraphic() {
  return (
    <svg width="100%" height="340px" viewBox="0 0 700 440" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Líneas de conexión */}
      <line x1="350" y1="220" x2="350" y2="60" stroke="rgba(65, 209, 242, 0.45)" strokeWidth="5" />
      <line x1="350" y1="220" x2="170" y2="130" stroke="rgba(65, 209, 242, 0.45)" strokeWidth="5" />
      <line x1="350" y1="220" x2="530" y2="130" stroke="rgba(65, 209, 242, 0.45)" strokeWidth="5" />
      <line x1="350" y1="220" x2="170" y2="310" stroke="rgba(65, 209, 242, 0.45)" strokeWidth="5" />
      <line x1="350" y1="220" x2="530" y2="310" stroke="rgba(65, 209, 242, 0.45)" strokeWidth="5" />

      {/* Nodo central — CRM */}
      <g className="glow-node" transform="translate(350, 220)">
        <polygon points="0,-80 70,-38 70,38 0,80 -70,38 -70,-38" fill="#1F2E40" stroke="#41D1F2" strokeWidth="6" />
        <text x="0" y="10" textAnchor="middle" fill="#FFFFFF" fontSize="30" fontWeight="900">CRM</text>
      </g>

      {/* Nodo superior — Analítica / Barras */}
      <g transform="translate(350, 50)">
        <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="rgba(2, 83, 117, 0.9)" stroke="#41D1F2" strokeWidth="3.5" />
        <rect x="-18" y="6" width="8" height="20" fill="#41D1F2" />
        <rect x="-6" y="-4" width="8" height="30" fill="#FFFFFF" />
        <rect x="6" y="-16" width="8" height="42" fill="#41D1F2" />
      </g>

      {/* Nodo izquierda-arriba — Tendencia */}
      <g transform="translate(170, 120)">
        <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="rgba(2, 83, 117, 0.9)" stroke="#41D1F2" strokeWidth="3.5" />
        <circle cx="-14" cy="10" r="6" fill="#41D1F2" />
        <circle cx="14" cy="-10" r="6" fill="#FFFFFF" />
        <line x1="-14" y1="10" x2="14" y2="-10" stroke="#41D1F2" strokeWidth="3.5" />
      </g>

      {/* Nodo derecha-arriba — Objetivo */}
      <g transform="translate(530, 120)">
        <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="rgba(2, 83, 117, 0.9)" stroke="#41D1F2" strokeWidth="3.5" />
        <circle cx="0" cy="0" r="13" fill="none" stroke="#41D1F2" strokeWidth="6" />
      </g>

      {/* Nodo izquierda-abajo — Usuario */}
      <g transform="translate(170, 310)">
        <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="rgba(2, 83, 117, 0.9)" stroke="#41D1F2" strokeWidth="3.5" />
        <circle cx="0" cy="-8" r="8" fill="#FFFFFF" />
        <path d="M-15 18 C-15 10 -8 6 0 6 C8 6 15 10 15 18" stroke="#41D1F2" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Nodo derecha-abajo — Finanzas */}
      <g transform="translate(530, 310)">
        <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="rgba(2, 83, 117, 0.9)" stroke="#41D1F2" strokeWidth="3.5" />
        <text x="0" y="10" textAnchor="middle" fill="#41D1F2" fontSize="30" fontWeight="bold">$</text>
      </g>
    </svg>
  );
}

