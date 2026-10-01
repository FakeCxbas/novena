// icons.js - Sistema de Iconografía Vectorial SVG (Sin Emojis)
// Proporciona iconos profesionales, solemnes y nítidos inspirados en Lucide/Feather.

export const ICONS = {
  // Vela litúrgica y llama sagrada
  candle: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <path d="M12 2c.8 1.4 1.5 2.5 1.5 3.5a1.5 1.5 0 0 1-3 0c0-1 .7-2.1 1.5-3.5Z" fill="#F59E0B" stroke="#DFB15B"/>
      <path d="M9 10h6v11a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V10Z"/>
      <line x1="12" y1="5.5" x2="12" y2="10"/>
    </svg>
  `,

  // Cruz Latina conmemorativa
  cross: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="6" y1="8" x2="18" y2="8"/>
    </svg>
  `,

  // Micrófono abierto / encendido
  mic: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  `,

  // Micrófono silenciado / apagado
  'mic-off': `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <line x1="2" y1="2" x2="22" y2="22"/>
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
      <path d="M5 10v2a7 7 0 0 0 12 5"/>
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  `,

  // Cámara / Video encendido
  video: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <path d="m22 8-6 4 6 4V8Z"/>
      <rect x="2" y="6" width="14" height="12" rx="2"/>
    </svg>
  `,

  // Cámara / Video apagado
  'video-off': `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <line x1="2" y1="2" x2="22" y2="22"/>
      <path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8"/>
      <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/>
    </svg>
  `,

  // Familia / Coro / Múltiples personas
  users: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  `,

  // Persona individual / Familiar
  user: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  `,

  // Corona / Anfitrión (Logística)
  crown: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7Z"/>
      <path d="M5 20h14"/>
    </svg>
  `,

  // Orador / Lector
  speaker: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <path d="M12 19v3"/>
      <path d="M8 22h8"/>
    </svg>
  `,

  // Estrella / Designado
  star: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  `,

  // Libro de oraciones / Diapositivas
  book: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
      <path d="M6 6h10"/>
      <path d="M6 10h10"/>
    </svg>
  `,

  // Rosario / Cuentas
  rosary: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <circle cx="12" cy="7" r="5"/>
      <line x1="12" y1="12" x2="12" y2="22"/>
      <line x1="8" y1="16" x2="16" y2="16"/>
    </svg>
  `,

  // Engranaje / Configuración de Logística
  settings: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
    </svg>
  `,

  // Teléfono inteligente / Consola móvil
  smartphone: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  `,

  // Candado cerrado (PIN protegido)
  lock: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  `,

  // Candado abierto (Desbloqueado)
  unlock: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </svg>
  `,

  // Calendario / Selector de Día
  calendar: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  `,

  // Flecha Anterior
  'chevron-left': `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  `,

  // Flecha Siguiente
  'chevron-right': `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  `,

  // Flecha Arriba (Para guía de permisos)
  'arrow-up': `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>
  `,

  // Alerta / Advertencia
  'alert-triangle': `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  `,

  // Recargar / Reintentar
  refresh: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  `,

  // Cerrar X
  x: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `,

  // Más / Añadir
  plus: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  `,

  // Menos / Restar
  minus: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  `,

  // Check / Aprobado
  check: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  `,

  // Mesa de control / Sliders
  sliders: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <line x1="4" y1="21" x2="4" y2="14"/>
      <line x1="4" y1="10" x2="4" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/>
      <line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1" y1="14" x2="7" y2="14"/>
      <line x1="9" y1="8" x2="15" y2="8"/>
      <line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  `,

  // Capas / Saltar diapositiva
  layers: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  `,

  // Corazón en memoria
  heart: `
    <svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" class="{class}">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  `
};

// Cache en memoria para evitar llamadas repetidas a replaceAll y recálculo de strings SVG
const iconCache = new Map();

/**
 * Genera el string HTML del SVG solicitado con las dimensiones y estilo deseado (con caché LRU-like).
 */
export function icon(name, { size = 18, color = 'currentColor', stroke = 2, className = 'icon-svg' } = {}) {
  const cacheKey = `${name}|${size}|${color}|${stroke}|${className}`;
  let cached = iconCache.get(cacheKey);
  if (!cached) {
    const template = ICONS[name] || ICONS['candle'];
    cached = template
      .replaceAll('{size}', size)
      .replaceAll('{color}', color)
      .replaceAll('{stroke}', stroke)
      .replaceAll('{class}', className);
    iconCache.set(cacheKey, cached);
  }
  return cached;
}

/**
 * Escanea el DOM y reemplaza elementos `<i data-icon="..."></i>` por su respectivo SVG.
 * Optimizado: salta los elementos que ya fueron renderizados anteriormente para evitar layout thrashing.
 */
export function replaceDomIcons(root = document, force = false) {
  const selector = force ? '[data-icon]' : '[data-icon]:not([data-icon-rendered])';
  const elements = root.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const name = el.getAttribute('data-icon');
    const size = parseInt(el.getAttribute('data-size') || '18', 10);
    const color = el.getAttribute('data-color') || 'currentColor';
    const stroke = parseFloat(el.getAttribute('data-stroke') || '2');
    const extraClass = el.getAttribute('data-class') || '';
    
    el.innerHTML = icon(name, { size, color, stroke, className: `icon-svg ${extraClass}`.trim() });
    el.setAttribute('data-icon-rendered', 'true');
    el.style.display = 'inline-flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.lineHeight = '1';
  }
}

// Iniciar reemplazo automático al cargar
if (typeof window !== 'undefined') {
  window.icon = icon;
  window.replaceDomIcons = replaceDomIcons;
}
