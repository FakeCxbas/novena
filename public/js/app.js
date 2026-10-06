// app.js - Lógica interactiva con 3 Roles (Anfitrión, Orador, Familia), control total de micrófonos y cámaras activas
import { NOVENA_DATA } from './novena-data.js?v=8.0';
import { icon, replaceDomIcons } from './icons.js?v=8.0';

// Cálculo automático del día de la Novena según fecha local (America/Guayaquil, UTC-5)
// Día 1: 30 de Septiembre de 2026
// Día 2: 1 de Octubre de 2026
// Día 3: 2 de Octubre de 2026 (HOY)
// Día 4: 3 de Octubre de 2026 (MAÑANA)... hasta Día 9
function getAutoNovenaDay() {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const localDateStr = formatter.format(new Date());
    const baseDate = new Date('2026-09-30T12:00:00Z');
    const currentDate = new Date(localDateStr + 'T12:00:00Z');
    const diffDays = Math.round((currentDate - baseDate) / (1000 * 60 * 60 * 24));
    const day = 1 + diffDays;
    return Math.min(Math.max(day, 1), 9);
  } catch (e) {
    const d = new Date();
    const base = new Date(2026, 8, 30);
    const diff = Math.floor((d - base) / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(1 + diff, 1), 9);
  }
}

// Estado de la aplicación
const state = {
  currentDay: getAutoNovenaDay(),
  currentStepIndex: 0,
  activeMysteryType: null, // 'gozosos', 'dolorosos', 'luminosos', 'gloriosos' o auto
  zoomLevels: [0.75, 0.85, 0.92, 1.0, 1.10, 1.22, 1.36, 1.50],
  currentZoomIndex: 3, // 1.0 = 100% por defecto
  isHost: false, // La consola de anfitrión está en /logistica
  isSpeaker: false,
  isSyncedWithHost: true,
  connectedUsers: 1,
  currentAveMaria: 0,
  userName: localStorage.getItem('novena-user-name') || '',
  participants: [],
  hostName: null,
  speakerName: 'Esperando Orador',
  speakerSocketId: null,
  selectedEntryRole: 'familia',
  showAllTexts: false,
  socket: null,
  isOffline: !navigator.onLine
};

// Determinar misterio según el día de la semana
function getAutoMysteryType() {
  const dayOfWeek = new Date().getDay(); // 0: Domingo, 1: Lunes, 2: Martes...
  switch (dayOfWeek) {
    case 1: // Lunes
    case 6: // Sábado
      return 'gozosos';
    case 2: // Martes
    case 5: // Viernes
      return 'dolorosos';
    case 4: // Jueves
      return 'luminosos';
    case 0: // Domingo
    case 3: // Miércoles
    default:
      return 'gloriosos';
  }
}

// Generar la lista de pasos secuenciales para el día actual con el nuevo orden
function buildStepsForDay(dayNumber) {
  const dayData = NOVENA_DATA.dias.find(d => d.dia === dayNumber) || NOVENA_DATA.dias[0];
  const mysteryType = state.activeMysteryType || dayData.tipoMisterio || getAutoMysteryType();
  const mysteryObj = NOVENA_DATA.rosario.misterios[mysteryType] || NOVENA_DATA.rosario.misterios.dolorosos;

  const oradorBadge = (label = 'Guía') => `<span class="voice-badge guia">${label}</span>`;
  const todosBadge = (label = 'Todos') => `<span class="voice-badge todos">${label}</span>`;

  return [
    // 1. Señal de la Santa Cruz
    {
      id: 'cruz',
      badge: '1. Ritos Iniciales',
      title: 'I. Señal de la Santa Cruz',
      render: () => `
        <div style="text-align: center; margin-bottom: 0.9rem;">
          <p class="memorial-dedication-jaculatoria" style="margin: 0;">
            ${NOVENA_DATA.info.jaculatoria}
          </p>
        </div>

        <div class="prayer-subheading" style="margin-top: 0.4rem;">
          Rito Inicial
        </div>

        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Guía')}
            <div class="voice-text">Por la señal de la Santa Cruz, de nuestros enemigos líbranos Señor, Dios nuestro. En el nombre del Padre, del Hijo y del Espíritu Santo.</div>
          </div>
          <div class="todos-part">
            ${todosBadge('Todos')}
            <div class="voice-text">Amén.</div>
          </div>
        </div>
      `
    },

    // Paso 1: Acto de Contrición
    {
      id: 'acto-contricion',
      badge: 'Inicio de la Novena',
      title: NOVENA_DATA?.actoContricion?.title || 'Acto de Contrición',
      render: () => `
        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Guía')}
            <div class="voice-text" style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${(NOVENA_DATA?.actoContricion?.paragraphs || [
                'Señor mío Jesucristo, Dios y Hombre verdadero, Creador, Padre y Redentor mío; por ser Vos quien sois, bondad infinita, y porque os amo sobre todas las cosas, me pesa de todo corazón haberos ofendido; también me pesa porque podéis castigarme con las penas del infierno.',
                'Ayudado de vuestra divina gracia, propongo firmemente nunca más pecar, confesarme y cumplir la penitencia que me fuere impuesta.'
              ]).map(p => `<p style="margin:0;">${p}</p>`).join('')}
            </div>
          </div>
          <div class="todos-part">
            ${todosBadge('Todos')}
            <div class="voice-text">${NOVENA_DATA?.actoContricion?.response || 'Amén.'}</div>
          </div>
        </div>
      `
    },

    // ----------------------------------------------------
    // PARTE 3: LA NOVENA (DÍA CORRESPONDIENTE)
    // ----------------------------------------------------
    // Oración Inicial de todos los días
    {
      id: 'oracion-inicial',
      badge: 'Oración de Todos los Días',
      title: NOVENA_DATA.oracionInicial.title,
      render: () => `
        <div class="guia-part" style="margin-bottom: 1rem;">
          ${oradorBadge('Guía')}
          <div class="voice-text" style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${NOVENA_DATA.oracionInicial.paragraphs.map(p => `<p style="margin:0;">${p}</p>`).join('')}
          </div>
        </div>
        <div class="todos-part">
          ${todosBadge('Todos')}
          <div class="voice-text">Amén.</div>
        </div>
      `
    },

    // Lectura Bíblica y Meditación del Día
    {
      id: 'reflexion-dia',
      badge: `Día ${dayData.dia}`,
      title: dayData.titulo,
      render: () => {
        const dayPhotoNum = ((dayData.dia - 1) % 10) + 3; // olguita-03 a olguita-12
        const dayPhotoSrc = `/fotos-olguita/olguita-${String(dayPhotoNum).padStart(2, '0')}.jpg`;
        return `
          <div class="bible-quote-box">
            <p style="font-style: italic; margin: 0; color: #ffffff;">${dayData.cita}</p>
            <span class="bible-ref" style="display: block; margin-top: 0.55rem; font-weight: 700; color: var(--gold-amber);">— ${dayData.referencia}</span>
          </div>

          <!-- Fotografía Conmemorativa de Mami Olguita -->
          <div class="prayer-photo-card" onclick="window.openLightboxBySrc('${dayPhotoSrc}', 'Mami Olguita • Reflexión del Día ${dayData.dia}')" title="Toca para ver foto ampliada">
            <div class="prayer-photo-img-wrap">
              <img src="${dayPhotoSrc}" alt="Mami Olguita" class="prayer-photo-img" loading="lazy">
              <div class="prayer-photo-overlay">
                <span class="prayer-photo-badge">En memoria de Mami Olguita</span>
              </div>
            </div>

          <div class="guia-part" style="margin-top: 1.2rem;">
            ${oradorBadge('Reflexión')}
            <p class="voice-text" style="margin: 0.4rem 0 0 0;">${dayData.reflexion}</p>
          </div>
        `;
      }
    },

    // Oración del Día
    {
      id: 'oracion-dia',
      badge: `Día ${dayData.dia}`,
      title: `Oración del Día ${dayData.dia}`,
      render: () => `
        <div class="guia-part" style="margin-bottom: 1rem;">
          ${oradorBadge('Guía')}
          <div class="voice-text" style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${dayData.oracion.map(p => `<p style="margin:0;">${p}</p>`).join('')}
          </div>
        </div>
        <div class="todos-part">
          ${todosBadge('Todos')}
          <div class="voice-text">Amén.</div>
        </div>
      `
    },

    // Mensaje para la Familia
    {
      id: 'mensaje-familia',
      badge: `Día ${dayData.dia} • Mensaje`,
      title: 'Mensaje para la Familia',
      render: () => {
        const famPhotoNum = ((dayData.dia * 3) % 20) + 5; // e.g. olguita-08, olguita-11, etc.
        const famPhotoSrc = `/fotos-olguita/olguita-${String(famPhotoNum).padStart(2, '0')}.jpg`;
        return `
          <div class="guia-part" style="border-left: 3px solid var(--fucsia-primary); padding: 1.1rem 1.25rem;">
            ${oradorBadge('Mensaje')}
            <p class="voice-text" style="color: var(--gold-light); margin: 0.4rem 0 0 0;">${dayData.mensajeFamilia}</p>
          </div>

          <!-- Fotografía Familiar Conmemorativa -->
          <div class="prayer-photo-card" onclick="window.openLightboxBySrc('${famPhotoSrc}', 'Familia de Mami Olguita • Día ${dayData.dia}')" title="Toca para ver foto ampliada">
            <div class="prayer-photo-img-wrap">
              <img src="${famPhotoSrc}" alt="Familia Mami Olguita" class="prayer-photo-img" loading="lazy">
              <div class="prayer-photo-overlay">
                <span class="prayer-photo-badge">Recuerdo Familiar</span>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 0.4rem; padding: 0.45rem 1rem; background: rgba(223, 177, 91, 0.08); border: 1px solid var(--gold-border); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--gold-light); font-size: clamp(0.92rem, min(1.35vw, 2.1vh), 1.25rem);">
            <i data-icon="candle" data-size="18"></i>
            <span>${NOVENA_DATA.info.jaculatoria}</span>
          </div>
        </div>
      `
    },

    // 2. Acto de Contrición
    {
      id: 'contricion',
      badge: '1. Ritos Iniciales',
      title: 'II. Acto de Contrición',
      render: () => `
        <div class="single-prayer-view">
          <div class="rubric-hint">(Rezado con devoción a una sola voz por toda la familia)</div>

          <div class="todos-part" style="padding: clamp(0.6rem, 1.4vh, 1.2rem) clamp(0.9rem, 2vw, 1.6rem);">
            ${todosBadge('Todos a una voz')}
            <div class="voice-text" style="display: flex; flex-direction: column; gap: 0.45rem; font-size: clamp(0.95rem, min(1.45vw, 2.2vh), 1.38rem); line-height: clamp(1.34, 2.4vh, 1.55);">
              <p style="margin:0;">
                Señor mío Jesucristo, Dios y Hombre verdadero, Creador, Padre y Redentor mío; por ser Tú quien eres, Bondad infinita, y porque te amo sobre todas las cosas, me pesa de todo corazón haberte ofendido; también me pesa porque puedes castigarme con las penas del infierno.
              </p>
              <p style="margin:0;">
                Ayudado de tu divina gracia, propongo firmemente nunca más pecar, confesarme y cumplir la penitencia que me fuere impuesta. Amén.
              </p>
            </div>
          </div>
        </div>
      `
    },

    // 3. Intención del Día
    {
      id: 'intencion',
      badge: dayData.dia === 5 ? '2. Intención del Quinto Día' : `2. Intención del Día ${dayData.dia}`,
      title: dayData.dia === 5 ? 'Intención del Quinto Día por la Mami Olguita' : `Intención del Día ${dayData.dia}`,
      render: () => `
        <div class="single-prayer-view">
          <div class="rubric-hint">(Ofrecimiento del Santo Rosario por el descanso de la mami Olguita)</div>

          <div class="guia-part" style="padding: clamp(0.7rem, 1.6vh, 1.3rem) clamp(0.9rem, 2vw, 1.6rem);">
            ${oradorBadge('Guía')}
            <div class="voice-text" style="font-size: clamp(1.02rem, min(1.55vw, 2.35vh), 1.5rem); line-height: clamp(1.36, 2.5vh, 1.58);">
              ${dayData.intencion}
            </div>
          </div>

          <div style="text-align: center; margin-top: 0.4rem; padding: 0.45rem 1rem; background: rgba(223, 177, 91, 0.08); border-radius: var(--radius-md); border: 1.5px solid var(--gold-border); display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--gold-light); font-size: clamp(0.9rem, min(1.25vw, 2vh), 1.18rem);">
            <i data-icon="candle" data-size="18"></i>
            <span>Por el descanso eterno de nuestra querida e inolvidable mami Olguita</span>
          </div>
        </div>
      `
    },

    // 4. El Credo
    {
      id: 'credo',
      badge: '2. Profesión de Fe',
      title: 'El Credo de los Apóstoles',
      render: () => `
        <div class="single-prayer-view">
          <div class="rubric-hint">(Rezado con fe viva a una sola voz por toda la familia)</div>

          <div class="todos-part" style="padding: clamp(0.55rem, 1.2vh, 1rem) clamp(0.85rem, 1.8vw, 1.4rem);">
            ${todosBadge('Todos')}
            <div class="voice-text" style="display: flex; flex-direction: column; gap: 0.38rem; font-size: clamp(0.88rem, min(1.3vw, 1.95vh), 1.25rem); line-height: clamp(1.3, 2.2vh, 1.48);">
              <p style="margin: 0; font-weight: 600; color: #ffffff;">Creo en Dios, Padre Todopoderoso, Creador del cielo y de la tierra.</p>
              <p style="margin: 0;">Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo; nació de Santa María Virgen; padeció bajo el poder de Poncio Pilato; fue crucificado, muerto y sepultado; descendió a los infiernos; al tercer día resucitó de entre los muertos; subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos.</p>
              <p style="margin: 0;">Creo en el Espíritu Santo, la Santa Iglesia Católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.</p>
            </div>
          </div>
        </div>
      `
    },

    // 📿 Las Meditaciones de los 5 Misterios y sus Decenarios Atómicos
    ...mysteryObj.lista.flatMap((mItem, index) => {
      const rawTitulo = typeof mItem === 'string' ? mItem : mItem.titulo;
      const mTitulo = rawTitulo.replace(/^(\d+\.?\s*|Primer\s+|Segundo\s+|Tercer\s+|Cuarto\s+|Quinto\s+Misterio:?\s*)/i, '').trim();
      const mMeditacion = typeof mItem === 'object' && mItem.meditacion ? mItem.meditacion : '';
      const mCita = typeof mItem === 'object' && mItem.cita ? mItem.cita : '';
      const mReferencia = typeof mItem === 'object' && mItem.referencia ? mItem.referencia : '';

      return {
        id: `misterio-${index + 1}`,
        badge: `${mysteryObj.nombre} (${index + 1}/5)`,
        title: `${index + 1}º Misterio: ${mTitulo}`,
        render: () => `
          ${mCita ? `
            <div class="bible-quote-box" style="margin-bottom: 0.9rem;">
              <p style="font-style: italic; margin: 0; color: #ffffff;">${mCita}</p>
              ${mReferencia ? `<span class="bible-ref" style="display: block; margin-top: 0.5rem; font-weight: 700; color: var(--gold-amber);">— ${mReferencia}</span>` : ''}
            </div>
          ` : ''}

          ${mMeditacion ? `
            <div class="meditacion-box">
              <div class="meditacion-title">
                Meditación por Mami Olguita
              </div>
              <p class="meditacion-text">
                "${mMeditacion}"
              </p>
            </div>
          ` : ''}

          <!-- Recuerdo Conmemorativo de Mami Olguita -->
          <div class="mystery-memory-chip" onclick="window.openLightboxBySrc('/fotos-olguita/olguita-${String(13 + index).padStart(2, '0')}.jpg', 'Recuerdo de Mami Olguita • ${mTitulo}')" title="Toca para ver foto ampliada">
            <img src="/fotos-olguita/olguita-${String(13 + index).padStart(2, '0')}.jpg" alt="Mami Olguita" class="mystery-chip-thumb" loading="lazy">
            <div class="mystery-chip-info">
              <div class="mystery-chip-label">En memoria de su fe y devoción</div>
              <div class="mystery-chip-quote">«Ofrecemos este misterio por el eterno descanso de Mami Olguita.»</div>
            </div>
          </div>

          <!-- 1. Padre Nuestro -->
          <div class="prayer-section">
            <div class="prayer-subheading">
              Padre Nuestro
            </div>
            <div class="dialogo-block">
              <div class="guia-part">
                ${oradorBadge('Guía')}
                <div class="voice-text">${NOVENA_DATA.rosario.padreNuestro.guia}</div>
              </div>
              <div class="todos-part">
                ${todosBadge('Todos')}
                <div class="voice-text">${NOVENA_DATA.rosario.padreNuestro.todos}</div>
              </div>
            </div>
          </div>

          <!-- 2. Diez Ave Marías -->
          <div class="prayer-section">
            <div class="prayer-subheading">
              Diez Avemarías
            </div>

            <!-- Rosario Contador de 10 Ave Marías -->
            <div class="rosario-counter-card">
              <div class="rosario-counter-header" style="display:flex; align-items:center; justify-content:center; gap:0.4rem; font-size:1.10rem; font-weight:600; color:var(--gold-light);">
                Avemarías rezadas: (<span id="bead-count-label">${state.currentAveMaria}</span> de 10)
              </div>
              <div class="beads-row" id="beads-container">
                ${Array.from({ length: 10 }).map((_, bIdx) => `
                  <div class="bead-item ${bIdx < state.currentAveMaria ? 'completed' : ''} ${bIdx === state.currentAveMaria - 1 ? 'active' : ''}" 
                       onclick="window.setAveMaria(${bIdx + 1})" title="Ave María ${bIdx + 1}">
                    ${bIdx + 1}
                  </div>
                  <p class="meditacion-text" style="font-size: clamp(1.02rem, min(1.5vw, 2.3vh), 1.42rem); line-height: clamp(1.35, 2.4vh, 1.55); margin: 0; color: #faf6f9;">
                    "${mMeditacion}"
                  </p>
                </div>
              ` : ''}

              <div style="text-align: center; padding: 0.45rem 0.8rem; background: rgba(223, 177, 91, 0.08); border: 1px solid var(--gold-border); border-radius: var(--radius-md); color: var(--gold-light); font-size: clamp(0.88rem, min(1.3vw, 2vh), 1.15rem); font-family: var(--font-sans); font-weight: 600;">
                📿 Rezar: 1 Padre Nuestro, 10 Ave Marías y 1 Gloria (Toca Siguiente para el conteo y Jaculatoria)
              </div>
              <div class="beads-control-btns" style="margin-top: 0.65rem; display: flex; justify-content: center; gap: 0.5rem;">
                <button class="btn-speaker-item" style="padding: 0.45rem 0.95rem; font-size: 0.95rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem;" onclick="window.nextAveMaria()">
                  ${icon('plus', { size: 14 })} Contar Ave María
                </button>
                <button class="btn-speaker-item" style="padding: 0.45rem 0.95rem; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 0.35rem; opacity: 0.8;" onclick="window.setAveMaria(0)">
                  ${icon('refresh', { size: 14 })} Reiniciar cuentas
                </button>
              </div>

              <!-- Jaculatoria Tradicional por la Mami Olguita -->
              <div class="prayer-compact-card" style="border-left: 4.5px solid var(--gold-primary); padding: clamp(0.55rem, 1.2vh, 0.95rem) clamp(0.85rem, 1.8vw, 1.4rem);">
                <div class="prayer-compact-header" style="color: var(--gold-primary); margin-bottom: 0.25rem;">
                  <span>Jaculatoria por la mami Olguita</span>
                  <span style="font-size: clamp(0.76rem, 1.2vh, 0.88rem); color: var(--gold-amber);">(Al terminar cada misterio)</span>
                </div>
                <div class="dialogo-compact" style="gap: clamp(0.25rem, 0.8vh, 0.45rem); font-size: clamp(0.95rem, min(1.4vw, 2.2vh), 1.42rem); line-height: clamp(1.35, 2.4vh, 1.55);">
                  <div style="display:flex; flex-direction:column; gap:0.1rem;">
                    <div><strong style="color:var(--color-guia);">Guía:</strong> Si por tu preciosa sangre, Señor, la has redimido.</div>
                    <div><strong style="color:var(--color-todos);">Todos:</strong> Que la perdones, te pido, por tu pasión dolorosa.</div>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.1rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.2rem;">
                    <div><strong style="color:var(--color-guia);">Guía:</strong> Dale, Señor, el descanso eterno.</div>
                    <div><strong style="color:var(--color-todos);">Todos:</strong> Y luzca para ella la luz perpetua.</div>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.1rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.2rem;">
                    <div><strong style="color:var(--color-guia);">Guía:</strong> Que el alma de nuestra mami Olguita y las demás del Purgatorio, por la misericordia de Dios, descansen en paz.</div>
                    <div><strong style="color:var(--color-todos);">Todos:</strong> Amén.</div>
                  </div>
                </div>
              </div>
            </div>
          `
        }
      ];
    }),

    // 15. 1ª Ave María por su Pureza: Fe
    {
      id: 'cuentas-fe',
      badge: '3. Oraciones Finales (1/3)',
      title: '1ª Ave María por su Pureza • Por la Fe',
      render: () => `
        <div style="text-align: center; margin-bottom: 1.1rem; background: rgba(223, 177, 91, 0.08); padding: 0.85rem 1rem; border-radius: 6px;">
          <p style="font-size: 1.20rem; color: var(--gold-light); font-weight: 600; margin: 0; line-height: 1.6;">
            Al concluir los 5 misterios, rezamos 1 Padre Nuestro, 3 Ave Marías (por la Fe, Esperanza y Caridad) y 1 Gloria al Padre.
          </p>
        </div>

          <div class="dialogo-block">
            <div class="guia-part" style="padding: clamp(0.7rem, 1.6vh, 1.3rem) clamp(0.9rem, 2vw, 1.6rem);">
              ${oradorBadge('Guía')}
              <div class="voice-text" style="font-size: clamp(1.05rem, min(1.55vw, 2.3vh), 1.5rem); line-height: clamp(1.36, 2.5vh, 1.58);">
                Dios te salve, María Santísima, Hija de Dios Padre, Virgen purísima antes del parto; en tus manos encomendamos nuestra fe y el alma de la mami Olguita para que la salves...
              </div>
            </div>

        <div class="prayer-subheading">II. Tres Avemarías</div>
        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Guía')}
            <div class="voice-text">${NOVENA_DATA.rosario.aveMaria.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge('Todos')}
            <div class="voice-text">${NOVENA_DATA.rosario.aveMaria.todos}</div>
          </div>
        </div>
        <p style="font-size: 1.05rem; color: var(--gold-amber); font-style: italic; text-align: center; margin: 0.3rem 0 1rem 0;">(Por el aumento de la Fe, Esperanza y Caridad)</p>

        <div class="prayer-subheading">III. Gloria al Padre</div>
        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Guía')}
            <div class="voice-text">${NOVENA_DATA.rosario.gloria.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge('Todos')}
            <div class="voice-text">${NOVENA_DATA.rosario.gloria.todos}</div>
          </div>
        </div>
      `
    },

    // 16. 2ª Ave María por su Pureza: Esperanza
    {
      id: 'cuentas-esperanza',
      badge: '3. Oraciones Finales (2/3)',
      title: '2ª Ave María por su Pureza • Por la Esperanza',
      render: () => `
        <div class="single-prayer-view" style="gap: clamp(0.4rem, 1vh, 0.75rem);">
          <div class="rubric-hint">(Rezamos entregando la pureza de la mami Olguita y pidiendo por nuestra esperanza)</div>

          <div class="dialogo-block">
            <div class="guia-part" style="padding: clamp(0.7rem, 1.6vh, 1.3rem) clamp(0.9rem, 2vw, 1.6rem);">
              ${oradorBadge('Guía')}
              <div class="voice-text" style="font-size: clamp(1.05rem, min(1.55vw, 2.3vh), 1.5rem); line-height: clamp(1.36, 2.5vh, 1.58);">
                Dios te salve, María Santísima, Madre de Dios Hijo, Virgen purísima en el parto; en tus manos encomendamos nuestra esperanza y el descanso eterno de la mami Olguita...
              </div>
            </div>

            <div class="todos-part" style="padding: clamp(0.7rem, 1.6vh, 1.3rem) clamp(0.9rem, 2vw, 1.6rem);">
              ${todosBadge('Todos')}
              <div class="voice-text" style="font-size: clamp(1.05rem, min(1.55vw, 2.3vh), 1.5rem); line-height: clamp(1.36, 2.5vh, 1.58);">
                ${NOVENA_DATA.rosario.aveMaria.todos}
              </div>
            </div>
          </div>
        </div>
      `
    },

    // 17. 3ª Ave María por su Pureza: Caridad y Unión
    {
      id: 'cuentas-caridad',
      badge: '3. Oraciones Finales (3/3)',
      title: '3ª Ave María por su Pureza • Por la Caridad y Unión',
      render: () => `
        <div class="single-prayer-view" style="gap: clamp(0.4rem, 1vh, 0.75rem);">
          <div class="rubric-hint">(Rezamos entregando la pureza de la mami Olguita y pidiendo por la unión inquebrantable familiar)</div>

          <div class="dialogo-block">
            <div class="guia-part" style="padding: clamp(0.7rem, 1.6vh, 1.3rem) clamp(0.9rem, 2vw, 1.6rem);">
              ${oradorBadge('Guía')}
              <div class="voice-text" style="font-size: clamp(1.05rem, min(1.55vw, 2.3vh), 1.5rem); line-height: clamp(1.36, 2.5vh, 1.58);">
                Dios te salve, María Santísima, Esposa del Espíritu Santo, Virgen purísima después del parto; en tus manos encomendamos nuestra caridad y la unión inquebrantable de nuestra familia...
              </div>
            </div>

            <div class="todos-part" style="padding: clamp(0.7rem, 1.6vh, 1.3rem) clamp(0.9rem, 2vw, 1.6rem);">
              ${todosBadge('Todos')}
              <div class="voice-text" style="font-size: clamp(1.05rem, min(1.55vw, 2.3vh), 1.5rem); line-height: clamp(1.36, 2.5vh, 1.58);">
                ${NOVENA_DATA.rosario.aveMaria.todos}
              </div>
            </div>
          </div>
        </div>
      `
    },

    // 18. La Salve
    {
      id: 'la-salve',
      badge: '3. Oraciones Finales',
      title: 'La Salve a la Santísima Virgen María',
      render: () => `
        <div class="single-prayer-view" style="gap: clamp(0.4rem, 1vh, 0.75rem);">
          <div class="rubric-hint">(Diálogo filial a una sola voz)</div>

    // Las Letanías
    {
      id: 'letanias',
      badge: 'Santo Rosario',
      title: 'Letanías a la Santísima Virgen María',
      render: () => {
        const marianas = NOVENA_DATA.rosario.letanias.slice(3);
        const categories = [
          { start: 1, end: 3, name: "Invocaciones a Santa María", icon: "✨" },
          { start: 4, end: 15, name: "Títulos de la Maternidad Divina", icon: "🌹" },
          { start: 16, end: 21, name: "Virtudes Virginales", icon: "🕊️" },
          { start: 22, end: 34, name: "Símbolos y Figuras Bíblicas", icon: "🏺" },
          { start: 35, end: 38, name: "Amparo, Salud y Consuelo", icon: "🛡️" },
          { start: 39, end: 51, name: "Títulos de la Realeza Celestial", icon: "👑" }
        ];

        return `
          <div style="background: rgba(223, 177, 91, 0.08); border-left: 3px solid var(--gold-primary); padding: 0.95rem 1.2rem; border-radius: 0 8px 8px 0; margin-bottom: 1rem;">
            <p style="font-size: 1.18rem; color: #ffffff; margin: 0; font-weight: 500; line-height: 1.6;">
              El Guía proclama cada invocación — Respondemos todos a una sola voz: <strong style="color: var(--gold-primary);">"Ruega por ella"</strong> (o "Ruega por nosotros")
            </p>
          </div>

          <!-- Súplicas Iniciales (Kyrie) -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.85rem 1.1rem; margin-bottom: 0.95rem;">
            <div style="font-size: 0.92rem; font-weight: 700; color: var(--gold-amber); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">
              Súplicas Iniciales
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.45rem; font-size: 1.22rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dotted rgba(255,255,255,0.08); padding-bottom: 4px;">
                <span style="color: #eeeeee;">Señor, ten piedad.</span>
                <span style="color: var(--gold-primary); font-weight: 700;">Señor, ten piedad.</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dotted rgba(255,255,255,0.08); padding-bottom: 4px;">
                <span style="color: #eeeeee;">Cristo, ten piedad.</span>
                <span style="color: var(--gold-primary); font-weight: 700;">Cristo, ten piedad.</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #eeeeee;">Señor, ten piedad.</span>
                <span style="color: var(--gold-primary); font-weight: 700;">Señor, ten piedad.</span>
              </div>
            </div>
          </div>

          <!-- 51 Invocaciones Numeradas y Categorizadas -->
          <div style="display: flex; flex-direction: column; gap: 0.45rem; max-height: 560px; overflow-y: auto; padding-right: 0.35rem;">
            ${marianas.map((item, idx) => {
              const num = idx + 1;
              const numStr = String(num).padStart(2, '0');
              const cat = categories.find(c => c.start === num);
              const catHeader = cat ? `
                <div style="margin: 0.9rem 0 0.3rem 0; font-family: var(--font-sans); font-size: 0.95rem; font-weight: 700; color: var(--gold-primary); text-transform: uppercase; letter-spacing: 0.04em; display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.7rem; background: rgba(223, 177, 91, 0.09); border-radius: 6px; border-left: 3px solid var(--gold-primary);">
                  <span>${cat.icon}</span>
                  <span>${cat.name} (${String(cat.start).padStart(2, '0')} – ${String(cat.end).padStart(2, '0')})</span>
                </div>
              ` : '';

              return `
                ${catHeader}
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.95rem; border-radius: 8px; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border-subtle); font-size: 1.25rem; gap: 0.6rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-family: var(--font-sans); font-size: 0.95rem; font-weight: 700; color: var(--gold-primary); background: rgba(223, 177, 91, 0.15); padding: 3px 8px; border-radius: 4px; min-width: 32px; text-align: center;">${numStr}</span>
                    <span style="color: #ffffff; font-family: var(--font-body); font-weight: 400;">${item.invocacion}</span>
                  </div>
                  <span style="color: var(--gold-primary); font-weight: 700; font-family: var(--font-sans); font-size: 1.15rem; letter-spacing: 0.02em; white-space: nowrap;">Ruega por ella</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Cordero de Dios (Agnus Dei) -->
          <div style="background: rgba(223, 177, 91, 0.08); border: 1.5px solid var(--gold-primary); border-radius: 10px; padding: 1rem 1.25rem; margin-top: 1.1rem;">
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--gold-primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.7rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>🐑</span> <span>Cordero de Dios (Agnus Dei)</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.7rem; font-size: 1.22rem;">
              <div style="padding-bottom: 0.5rem; border-bottom: 1px dashed rgba(223, 177, 91, 0.3);">
                <div style="color: #d6cfc7; font-size: 1.12rem;"><strong style="color: var(--gold-primary);">Guía:</strong> Cordero de Dios, que quitas los pecados del mundo.</div>
                <div style="color: #ffffff; font-weight: 700; margin-top: 3px;"><strong style="color: var(--gold-primary);">Todos:</strong> Perdónanos, Señor.</div>
              </div>
              <div style="padding-bottom: 0.5rem; border-bottom: 1px dashed rgba(223, 177, 91, 0.3);">
                <div style="color: #d6cfc7; font-size: 1.12rem;"><strong style="color: var(--gold-primary);">Guía:</strong> Cordero de Dios, que quitas los pecados del mundo.</div>
                <div style="color: #ffffff; font-weight: 700; margin-top: 3px;"><strong style="color: var(--gold-primary);">Todos:</strong> Escúchanos, Señor.</div>
              </div>
              <div>
                <div style="color: #d6cfc7; font-size: 1.12rem;"><strong style="color: var(--gold-primary);">Guía:</strong> Cordero de Dios, que quitas los pecados del mundo.</div>
                <div style="color: #ffffff; font-weight: 700; margin-top: 3px;"><strong style="color: var(--gold-primary);">Todos:</strong> Ten piedad y misericordia de nosotros.</div>
              </div>
            </div>
          </div>
        `;
      }
    },

    // 19. Letanías Lauretanas (1/3): Invocaciones y Santa María
    {
      id: 'oracion-final-olguita',
      badge: 'Oraciones Finales',
      title: NOVENA_DATA.oracionFinalOlguita.title,
      render: () => `
        <div class="guia-part" style="margin-bottom: 1rem;">
          ${oradorBadge('Guía')}
          <div class="voice-text" style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${NOVENA_DATA.oracionFinalOlguita.paragraphs.map(p => `<p style="margin:0;">${p}</p>`).join('')}
          </div>
        `;
      }
    },

    // 20. Letanías Lauretanas (2/3): Títulos de la Santísima Virgen
    {
      id: 'oracion-final-familia',
      badge: 'Oraciones Finales',
      title: NOVENA_DATA.oracionFinalFamilia.title,
      render: () => `
        <div class="guia-part" style="margin-bottom: 1rem;">
          ${oradorBadge('Guía')}
          <div class="voice-text" style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${NOVENA_DATA.oracionFinalFamilia.paragraphs.map(p => `<p style="margin:0;">${p}</p>`).join('')}
          </div>
        `;
      }
    },

    // 21. Letanías Lauretanas (3/3): Reina Celestial y Cordero de Dios
    {
      id: 'letanias-3',
      badge: '3. Oraciones Finales • Letanías (3/3)',
      title: 'Letanías: Reina Celestial y Cordero de Dios',
      render: () => {
        const items = NOVENA_DATA.rosario.letanias.slice(32);
        return `
          <div class="single-prayer-view" style="gap: clamp(0.3rem, 0.8vh, 0.6rem);">
            <div style="background: rgba(223, 177, 91, 0.08); border-left: 4px solid var(--gold-primary); padding: 0.35rem 0.8rem; border-radius: 0 6px 6px 0; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: clamp(0.82rem, 1.2vw, 0.95rem); color: #ffffff; font-weight: 600;">
                Reina del Cielo y Cordero de Dios
              </span>
              <span style="font-size: clamp(0.82rem, 1.2vw, 0.95rem); color: var(--gold-primary); font-weight: 700;">
                Respondemos todos: «Ruega por la mami Olguita»
              </span>
            </div>

            <div class="letanias-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: clamp(0.18rem, 0.5vh, 0.35rem) clamp(0.5rem, 1.2vw, 1rem);">
              ${items.map(item => `
                <div class="letania-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: clamp(0.18rem, 0.45vh, 0.32rem) 0.5rem; background: rgba(255,255,255,0.02); border-radius: 4px;">
                  <span class="letania-invocacion" style="font-size: clamp(0.82rem, min(1.15vw, 1.85vh), 1.1rem);">${item.guia || item.invocacion}</span>
                  <span class="letania-respuesta" style="font-size: clamp(0.8rem, min(1.05vw, 1.75vh), 1rem); color: var(--gold-primary); font-weight: 600;">Ruega por ella</span>
                </div>
              `).join('')}
            </div>

            <div style="text-align: center; margin-top: 0.2rem; padding: 0.35rem 0.8rem; background: rgba(192, 51, 116, 0.08); border: 1px solid var(--fucsia-border-subtle); border-radius: var(--radius-md); font-size: clamp(0.85rem, min(1.2vw, 1.9vh), 1.1rem); color: var(--fucsia-light); font-weight: 600;">
              Cordero de Dios: Perdónanos, escúchanos y ten misericordia de la mami Olguita.
            </div>
          </div>
        `;
      }
    },

    // 22. Oración Familiar (1/2): Conciencia y Perdón
    {
      id: 'oracion-reconciliacion-1',
      badge: '4. Oración Familiar (1/2)',
      title: '🤍 Oración Familiar: Conciencia y Perdón',
      render: () => {
        const fullPrayer = dayData.oracionFamiliar || '';
        const paragraphs = fullPrayer.split('\n\n').filter(Boolean);
        const p1 = paragraphs[0] || fullPrayer;
        return `
          <div class="single-prayer-view" style="gap: clamp(0.4rem, 1vh, 0.75rem);">
            <div style="background: rgba(223, 177, 91, 0.1); border: 1.5px solid var(--gold-primary); border-radius: 8px; padding: 0.4rem 0.85rem; text-align: center;">
              <span style="font-size: clamp(0.88rem, min(1.25vw, 2vh), 1.1rem); font-weight: 700; color: var(--gold-primary);">
                🤲 Momento Sagrado de Unión Familiar —
              </span>
              <span style="font-size: clamp(0.85rem, min(1.2vw, 1.9vh), 1.05rem); font-style: italic; color: #ffffff;">
                (Nos tomamos de las manos o cerramos los ojos)
              </span>
            </div>

            <div class="guia-part" style="padding: clamp(0.7rem, 1.6vh, 1.3rem) clamp(0.9rem, 2vw, 1.6rem);">
              ${oradorBadge('Guía')}
              <div class="voice-text" style="font-size: clamp(1.02rem, min(1.5vw, 2.25vh), 1.46rem); line-height: clamp(1.35, 2.45vh, 1.56);">
                <p style="margin:0;">${p1}</p>
              </div>
            </div>

            <div style="text-align: right; color: var(--gold-amber); font-size: clamp(0.82rem, 1.1vw, 0.95rem); font-family: var(--font-sans); font-weight: 600;">
              Continúa en la siguiente pantalla →
            </div>
          </div>
        `;
      }
    },

    // 23. Oración Familiar (2/2): Unión y Sanación
    {
      id: 'oracion-reconciliacion-2',
      badge: '4. Oración Familiar (2/2)',
      title: '🤍 Oración Familiar: Unión y Sanación',
      render: () => {
        const fullPrayer = dayData.oracionFamiliar || '';
        const paragraphs = fullPrayer.split('\n\n').filter(Boolean);
        const remaining = paragraphs.slice(1).join('<br><br>');
        return `
          <div class="single-prayer-view" style="gap: clamp(0.4rem, 1vh, 0.75rem);">
            <div class="guia-part" style="padding: clamp(0.7rem, 1.6vh, 1.3rem) clamp(0.9rem, 2vw, 1.6rem);">
              ${oradorBadge('Guía')}
              <div class="voice-text" style="font-size: clamp(1rem, min(1.48vw, 2.2vh), 1.44rem); line-height: clamp(1.34, 2.4vh, 1.54);">
                <p style="margin:0;">${remaining || fullPrayer}</p>
              </div>
            </div>

            <div class="todos-part" style="padding: 0.5rem 1rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                ${todosBadge('Todos')}
                <span style="font-size: clamp(1.05rem, 1.5vw, 1.35rem); font-weight: 700; color: var(--gold-light);">Amén.</span>
              </div>
              <div style="font-size: clamp(0.85rem, 1.1vw, 1rem); font-style: italic; color: var(--gold-amber);">
                ✝️ (Se finaliza con la señal de la cruz)
              </div>
            </div>
          </div>
        `;
      }
    },

    // 24. Cierre, Bendición y Homenaje
    {
      id: 'despedida-homenaje',
      badge: '5. Cierre y Homenaje',
      title: 'Despedida, Bendición Final y Homenaje Conmemorativo',
      render: () => `
        <div class="single-prayer-view" style="gap: clamp(0.4rem, 1vh, 0.75rem);">
          <div class="dialogo-block">
            <div class="guia-part" style="padding: clamp(0.6rem, 1.4vh, 1.1rem) clamp(0.85rem, 1.8vw, 1.4rem);">
              ${oradorBadge('Guía')}
              <div class="voice-text" style="font-size: clamp(1.02rem, min(1.5vw, 2.2vh), 1.45rem); line-height: 1.42; color: #ffffff;">
                El Señor nos bendiga, nos guarde de todo mal y nos lleve a la vida eterna.
              </div>
            </div>

            <div class="todos-part" style="padding: clamp(0.6rem, 1.4vh, 1.1rem) clamp(0.85rem, 1.8vw, 1.4rem);">
              ${todosBadge('Todos')}
              <div class="voice-text" style="font-size: clamp(1.02rem, min(1.5vw, 2.2vh), 1.45rem); line-height: 1.42; color: #fff8fc;">
                Amén.
              </div>
            </div>
          </div>

          <div style="background: rgba(223, 177, 91, 0.08); border: 1.5px solid var(--gold-border); border-radius: var(--radius-md); padding: clamp(0.5rem, 1.2vh, 0.9rem); text-align: center; color: var(--gold-light);">
            <div style="font-size: clamp(1rem, min(1.4vw, 2.1vh), 1.35rem); font-weight: 600; margin-bottom: 0.25rem;">
              «Dale, Señor, el descanso eterno, y brille para ella la luz perpetua. Que en paz descanse. Amén.»
            </div>
          </div>

          <div style="display: flex; justify-content: center; margin-top: 0.3rem;">
            <button class="btn-theater-trigger" onclick="window.startTheaterMode()" style="padding: clamp(0.55rem, 1.3vh, 0.85rem) 1.5rem; font-size: clamp(0.95rem, 1.3vw, 1.15rem); font-weight: 700; background: linear-gradient(135deg, var(--fucsia-primary), var(--fucsia-deep)); border: 1.5px solid var(--fucsia-light); border-radius: var(--radius-full); color: #ffffff; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 18px rgba(192, 51, 116, 0.4);">
              <i data-icon="sparkles" data-size="18"></i>
              <span>Proyectar Homenaje Conmemorativo de la Mami Olguita</span>
            </button>
          </div>
        </div>
      `
    }
  ];
}

// Variables del DOM
let steps = buildStepsForDay(state.currentDay);

// ========================================================
// CONTROL DE ROLES EN LA ENTRADA
// ========================================================
window.selectEntryRole = function(role) {
  state.selectedEntryRole = role;

  const cardFamilia = document.getElementById('entry-card-familia');
  const cardOrador = document.getElementById('entry-card-orador');
  const cardAnfitrion = document.getElementById('entry-card-anfitrion');
  const pinBox = document.getElementById('entry-pin-box');

  if (cardFamilia) cardFamilia.classList.toggle('active', role === 'familia');
  if (cardOrador) cardOrador.classList.toggle('active', role === 'orador');
  if (cardAnfitrion) cardAnfitrion.classList.toggle('active', role === 'anfitrion');

  const radio = document.querySelector(`input[name="entry-role-radio"][value="${role}"]`);
  if (radio) radio.checked = true;

  if (pinBox) {
    pinBox.style.display = (role === 'anfitrion') ? 'block' : 'none';
    if (role === 'anfitrion') {
      const pinInput = document.getElementById('entry-pin-input');
      if (pinInput) pinInput.focus();
    }
  }
};

// ========================================================
// RENDERIZADO DEL PASO ACTUAL (MEMOIZADO Y DIFERENCIAL)
// ========================================================
const stepsCache = new Map();
function getStepsForDay(dayNumber, mysteryType) {
  const dayData = NOVENA_DATA.dias.find(d => d.dia === dayNumber) || NOVENA_DATA.dias[0];
  const mType = mysteryType || state.activeMysteryType || dayData.tipoMisterio || getAutoMysteryType();
  const cacheKey = `${dayNumber}_${mType}`;
  if (!stepsCache.has(cacheKey)) {
    stepsCache.set(cacheKey, buildStepsForDay(dayNumber));
  }
  return stepsCache.get(cacheKey);
}

let lastRenderedKey = null;

function updateBeadsUI(count) {
  const label = document.getElementById('bead-count-label');
  if (label) label.textContent = count;

  const container = document.getElementById('beads-container');
  if (container) {
    const items = container.children;
    for (let idx = 0; idx < items.length; idx++) {
      const b = items[idx];
      b.classList.toggle('completed', idx < count);
      b.classList.toggle('active', idx === count - 1);
    }
  }

  // Sincronizar widget TV de cuentas
  const tvCount = document.getElementById('tv-rosary-count');
  if (tvCount) tvCount.textContent = `${count} / 10`;

  const tvDots = document.getElementById('tv-rosary-dots');
  if (tvDots) {
    if (tvDots.children.length !== 10) {
      tvDots.innerHTML = '';
      for (let i = 1; i <= 10; i++) {
        const dot = document.createElement('div');
        dot.className = 'tv-rosary-dot';
        dot.textContent = i;
        tvDots.appendChild(dot);
      }
    }
    const dotItems = tvDots.children;
    for (let idx = 0; idx < dotItems.length; idx++) {
      const d = dotItems[idx];
      d.classList.toggle('completed', idx < count);
      d.classList.toggle('active', idx === count - 1);
    }
  }
}

function renderCurrentStep(force = false) {
  steps = getStepsForDay(state.currentDay, state.activeMysteryType);
  const totalSteps = steps.length;
  if (state.currentStepIndex >= totalSteps) state.currentStepIndex = totalSteps - 1;
  if (state.currentStepIndex < 0) state.currentStepIndex = 0;

  const currentStep = steps[state.currentStepIndex];
  const currentKey = `${state.currentDay}_${state.currentStepIndex}_${state.activeMysteryType || 'auto'}`;

  // Actualizar títulos e indicadores
  const badgeEl = document.getElementById('day-step-badge');
  const titleEl = document.getElementById('card-section-title');
  const bodyEl = document.getElementById('card-step-body');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');

  if (badgeEl) badgeEl.textContent = `Día ${state.currentDay} • ${currentStep.badge}`;
  if (titleEl) titleEl.textContent = currentStep.title;

  // Sincronizar componentes del modo TV en pantalla grande
  const tvSidebarImg = document.getElementById('tv-sidebar-img');
  const tvSidebarDay = document.getElementById('tv-sidebar-day');
  const tvProgress = document.getElementById('step-progress-indicator');
  const tvRosaryWidget = document.getElementById('tv-rosary-widget');
  const tvSpeakerName = document.getElementById('tv-sidebar-speaker-name');

  if (tvSidebarDay && badgeEl) tvSidebarDay.textContent = badgeEl.textContent;
  if (tvProgress) tvProgress.textContent = `Paso ${state.currentStepIndex + 1} de ${totalSteps}`;
  if (tvSpeakerName) tvSpeakerName.textContent = state.speakerName || 'Oración Comunitaria';

  // Si estamos en un paso con foto (ej. misterios o fotos intermedias), mostrarla en grande a la izquierda en la TV
  if (tvSidebarImg && currentStep) {
    if (currentStep.id.startsWith('misterio-')) {
      const mysteryPhotoIdx = parseInt(currentStep.id.replace('misterio-', '').replace('-rosario', ''), 10) || 1;
      tvSidebarImg.src = `/fotos-olguita/olguita-${String(12 + mysteryPhotoIdx).padStart(2, '0')}.jpg`;
    } else if (currentStep.id === 'cruz' || currentStep.id === 'contricion') {
      tvSidebarImg.src = '/fotos-olguita/olguita-01.jpg';
    } else if (currentStep.id === 'intencion' || currentStep.id === 'credo') {
      tvSidebarImg.src = '/fotos-olguita/olguita-02.jpg';
    } else if (currentStep.id.startsWith('cuentas-') || currentStep.id === 'la-salve') {
      tvSidebarImg.src = '/fotos-olguita/olguita-03.jpg';
    } else if (currentStep.id.startsWith('letanias')) {
      tvSidebarImg.src = '/fotos-olguita/olguita-04.jpg';
    } else if (currentStep.id.startsWith('oracion-reconciliacion')) {
      tvSidebarImg.src = '/fotos-olguita/olguita-08.jpg';
    } else if (currentStep.id === 'despedida-homenaje') {
      tvSidebarImg.src = '/fotos-olguita/olguita-05.jpg';
    } else {
      tvSidebarImg.src = '/olguita.jpg';
    }
  }

  // Si estamos en un misterio del rosario, encender el widget TV de cuentas
  const isMysteryStep = Boolean(currentStep && currentStep.id.startsWith('misterio-'));
  if (tvRosaryWidget) {
    tvRosaryWidget.style.display = isMysteryStep ? 'block' : 'none';
  }

  // Solo reinyectar contenido HTML si el paso cambió o se fuerza la recarga
  if (force || lastRenderedKey !== currentKey) {
    lastRenderedKey = currentKey;
    if (bodyEl) {
      bodyEl.innerHTML = currentStep.render();
      replaceDomIcons(bodyEl);
    }
  }

  // Actualizar visualización de las cuentas si es un misterio
  updateBeadsUI(state.currentAveMaria);

  // Botones de navegación del anfitrión
  if (prevBtn) prevBtn.disabled = state.currentStepIndex === 0;
  if (nextBtn) {
    if (state.currentStepIndex === totalSteps - 1) {
      nextBtn.innerHTML = `<span>Finalizar</span>`;
    } else {
      nextBtn.innerHTML = `<span>Siguiente</span> <i data-icon="chevron-right" data-size="16"></i>`;
      replaceDomIcons(nextBtn);
    }
  }

  applyRoleUI();

  // Si somos anfitrión, transmitir cambio a toda la familia inmediatamente
  if (state.isHost && state.socket && state.socket.connected) {
    state.socket.emit('update-step', {
      currentDay: state.currentDay,
      currentStepIndex: state.currentStepIndex,
      selectedMystery: state.activeMysteryType,
      currentAveMaria: state.currentAveMaria
    });
  }
}

// ========================================================
// APLICACIÓN DE ESTILOS Y CONTROLES SEGÚN EL ROL
// ========================================================
function applyRoleUI() {
  const isHost = state.isHost;
  const isSpeaker = state.isSpeaker || (state.socket && state.socket.id === state.speakerSocketId);

  document.body.classList.toggle('is-host', isHost);
  document.body.classList.toggle('role-familia', !isHost && !isSpeaker);
  document.body.classList.toggle('is-speaker', isSpeaker);

  // Ocultar banner de modo coro por completo
  const banner = document.getElementById('role-cue-banner');
  if (banner) banner.style.display = 'none';

  // Botón de logística en la barra superior
  const hostTrigger = document.getElementById('btn-host-trigger');
  if (hostTrigger) {
    hostTrigger.innerHTML = isHost ? icon('settings', { size: 18 }) : icon('crown', { size: 18 });
    hostTrigger.title = isHost ? 'Panel de Logística' : 'Acceso de Anfitrión';
  }
}

function updateSpeakerUI(speakerSocketId, speakerName) {
  state.speakerSocketId = speakerSocketId;
  state.speakerName = speakerName || 'Esperando Orador';

  const isMe = state.socket && state.socket.id === speakerSocketId;
  state.isSpeaker = isMe;

  const label = document.getElementById('speaker-name-label');
  if (label) {
    if (isMe) {
      label.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.25rem;">${icon('speaker', { size: 13 })} ¡Tú eres el Guía!</span>`;
    } else if (speakerSocketId) {
      label.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.25rem;">${icon('speaker', { size: 13 })} Guía: ${state.speakerName}</span>`;
    } else {
      label.textContent = '🕊️ Oración Familiar';
    }
  }

  const tvSpeaker = document.getElementById('tv-sidebar-speaker-name');
  if (tvSpeaker) {
    tvSpeaker.textContent = isMe ? `${state.speakerName} (Tú)` : state.speakerName;
  }

  applyRoleUI();
}

// Navegación (Solo activada por el Anfitrión)
window.nextStep = function() {
  if (state.currentStepIndex < steps.length - 1) {
    state.currentStepIndex++;
    state.currentAveMaria = 0;
    renderCurrentStep(true);
  }
};

window.prevStep = function() {
  if (state.currentStepIndex > 0) {
    state.currentStepIndex--;
    state.currentAveMaria = 0;
    renderCurrentStep(true);
  }
};

window.selectDay = function(dayNumber) {
  state.currentDay = dayNumber;
  state.currentStepIndex = 0;
  state.currentAveMaria = 0;
  renderLogisticsModal();
  renderCurrentStep(true);
};

window.jumpToStep = function(stepIdx) {
  state.currentStepIndex = stepIdx;
  state.currentAveMaria = 0;
  renderCurrentStep(true);
  closeModal('logistics-modal');
};

window.jumpToStepId = function(stepId) {
  const sIdx = steps.findIndex(s => s.id === stepId);
  if (sIdx !== -1) {
    window.jumpToStep(sIdx);
  }
};

// Ave María contador con actualización DOM in-place ultra ligera
window.setAveMaria = function(count, emit = true) {
  state.currentAveMaria = Math.min(10, Math.max(0, count));
  updateBeadsUI(state.currentAveMaria);

  if (emit && state.isHost && state.socket && state.socket.connected) {
    state.socket.emit('update-step', {
      currentAveMaria: state.currentAveMaria
    });
  }
};

window.nextAveMaria = function() {
  if (state.currentAveMaria < 10) {
    window.setAveMaria(state.currentAveMaria + 1);
  }
};

// ========================================================
// SINCRONIZACIÓN EN TIEMPO REAL (Socket.io)
// ========================================================
let appFallbackPollInterval = null;
function startAppFallbackPolling() {
  if (!appFallbackPollInterval) {
    appFallbackPollInterval = setInterval(syncFromHttpState, 3500);
  }
}
function stopAppFallbackPolling() {
  if (appFallbackPollInterval) {
    clearInterval(appFallbackPollInterval);
    appFallbackPollInterval = null;
  }
}

function initRealtimeSync() {
  if (typeof io !== 'undefined') {
    state.socket = io({
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    state.socket.on('connect', () => {
      state.isOffline = false;
      stopAppFallbackPolling();

      const savedName = localStorage.getItem('novena-user-name') || state.userName;
      if (savedName) {
        state.userName = savedName;
        state.socket.emit('set-name', { userName: savedName });
      }

      // Re-reclamar anfitrión SOLO si explícitamente se eligió anfitrión en esta sesión
      if (state.isHost && state.selectedEntryRole === 'anfitrion') {
        state.socket.emit('claim-host', { pin: '1234', name: state.userName || savedName });
      }
    });

    state.socket.on('disconnect', () => {
      state.isOffline = true;
      startAppFallbackPolling();
    });

    state.socket.on('state-update', (data) => {
      // Sincronizar el rezo familiar inmediatamente con lo que dicte el servidor
      let changed = false;
      if (data.currentDay !== undefined && data.currentDay !== state.currentDay) {
        state.currentDay = data.currentDay;
        changed = true;
      }
      if (data.currentStepIndex !== undefined && data.currentStepIndex !== state.currentStepIndex) {
        state.currentStepIndex = data.currentStepIndex;
        changed = true;
      }
      if (data.selectedMystery && data.selectedMystery !== state.activeMysteryType) {
        state.activeMysteryType = data.selectedMystery;
        changed = true;
      }
      if (data.currentAveMaria !== undefined) {
        state.currentAveMaria = data.currentAveMaria;
      }
      if (data.speakerName) updateSpeakerUI(data.speakerSocketId, data.speakerName);
      
      if (changed) {
        renderCurrentStep();
      } else {
        updateBeadsUI(state.currentAveMaria);
      }
    });

    // Evento de paso cambiado por el anfitrión (Logística o Host)
    state.socket.on('step-changed', (data) => {
      let changed = false;
      if (data.currentDay !== undefined && data.currentDay !== state.currentDay) {
        state.currentDay = data.currentDay;
        changed = true;
      }
      if (data.currentStepIndex !== undefined && data.currentStepIndex !== state.currentStepIndex) {
        state.currentStepIndex = data.currentStepIndex;
        changed = true;
      }
      if (data.selectedMystery && data.selectedMystery !== state.activeMysteryType) {
        state.activeMysteryType = data.selectedMystery;
        changed = true;
      }
      if (data.currentAveMaria !== undefined) {
        state.currentAveMaria = data.currentAveMaria;
      }

      if (changed) {
        renderCurrentStep();
      } else {
        updateBeadsUI(state.currentAveMaria);
      }
    });

    state.socket.on('speaker-changed', ({ speakerSocketId, speakerName }) => {
      updateSpeakerUI(speakerSocketId, speakerName);
      if (state.socket && state.socket.id === speakerSocketId) {
        showToast('¡Has sido designado como el Orador / Guía de la oración!', 'speaker');
      }
      if (state.isHost) renderLogisticsModal();
    });

    state.socket.on('participants-list', (list) => {
      if (Array.isArray(list)) {
        state.participants = list;
        if (state.isHost) renderLogisticsModal();
      }
    });

    state.socket.on('host-confirmed', () => {
      state.isHost = true;
      localStorage.setItem('novena-is-host', 'true');
      closeModal('host-modal');
      renderLogisticsModal();
      applyRoleUI();
      renderCurrentStep();
      showToast('Acceso de Anfitrión confirmado', 'crown');
    });

    state.socket.on('host-error', (err) => {
      alert(err.message || 'PIN erróneo');
    });

    // Eventos de Proyección Conmemorativa de Despedida
    state.socket.on('tribute-projection-started', (data) => {
      window.openTributeTheater((data && data.startIndex) || 0, (data && data.intervalMs) || 5500);
    });

    state.socket.on('tribute-projection-stopped', () => {
      window.closeTributeTheater();
    });
  }
}

// Logística del Anfitrión
function renderLogisticsModal() {
  // 1. Selector de Días
  const daysContainer = document.getElementById('logistics-days-grid');
  if (daysContainer) {
    const autoDay = getAutoNovenaDay();
    daysContainer.innerHTML = NOVENA_DATA.dias.map(d => `
      <button class="logistics-day-btn ${d.dia === state.currentDay ? 'active' : ''}" onclick="window.selectDay(${d.dia})">
        Día ${d.dia} ${d.dia === autoDay ? '(Hoy)' : ''}
      </button>
    `).join('');
  }

  // 2. Selector de Orador (Todos los conectados)
  const speakerContainer = document.getElementById('speaker-selection-list');
  if (speakerContainer) {
    const isMeSpeaker = state.socket && state.socket.id === state.speakerSocketId;
    let html = `
      <button class="btn-speaker-item ${isMeSpeaker ? 'active' : ''}" onclick="window.designateSpeaker('${state.socket ? state.socket.id : ''}', '${state.userName || 'Anfitrión'} (Yo)')" style="display:flex; align-items:center; gap:0.4rem;">
        <span>${icon('user', { size: 16 })}</span>
        <span>${state.userName || 'Anfitrión'} (Yo)</span>
      </button>
    `;

    if (Array.isArray(state.participants)) {
      state.participants.forEach((user) => {
        if (state.socket && user.socketId === state.socket.id) return;
        const isThisSpeaker = user.socketId === state.speakerSocketId;
        html += `
          <button class="btn-speaker-item ${isThisSpeaker ? 'active' : ''}" onclick="window.designateSpeaker('${user.socketId}', '${user.userName || 'Familiar'}')" style="display:flex; align-items:center; gap:0.4rem;">
            <span>${icon('speaker', { size: 16 })}</span>
            <span>${user.userName || 'Familiar'}</span>
          </button>
        `;
      });
    }

    speakerContainer.innerHTML = html;
  }

  // 3. Saltar a pasos
  const stepsList = document.getElementById('index-steps-list');
  if (stepsList) {
    stepsList.innerHTML = steps.map((s, idx) => `
      <div class="index-step-item ${idx === state.currentStepIndex ? 'active' : ''}" onclick="window.jumpToStep(${idx})">
        <span>${idx + 1}. ${s.title}</span>
        <span style="font-size: 0.72rem; color: var(--gold-amber);">${s.badge}</span>
      </div>
    `).join('');
  }
}

window.designateSpeaker = function(socketId, speakerName) {
  if (state.socket && state.socket.connected) {
    state.socket.emit('set-speaker', { socketId, speakerName });
    showToast(`${speakerName} ha sido designado como Orador`, 'speaker');
  }
  closeModal('logistics-modal');
};

// Acceso de anfitrión
window.openHostModal = function() {
  if (state.isHost) {
    renderLogisticsModal();
    openModal('logistics-modal');
  } else {
    openModal('host-modal');
  }
};

window.submitHostPin = function() {
  const pinInput = document.getElementById('host-pin-input');
  const pin = pinInput ? pinInput.value.trim() : '';

  if (pin === '1234') {
    if (state.socket && state.socket.connected) {
      state.socket.emit('claim-host', { pin, name: state.userName });
    } else {
      state.isHost = true;
      localStorage.setItem('novena-is-host', 'true');
      closeModal('host-modal');
      renderLogisticsModal();
      applyRoleUI();
      renderCurrentStep();
    }
  } else {
    alert('PIN incorrecto. El PIN es 1234');
  }
};

// Entrar a la sala con un solo toque (Sincronización instantánea de rezo)
window.enterRoomOneTouch = function() {
  const nameInput = document.getElementById('welcome-name-input');
  let chosenName = nameInput ? nameInput.value.trim() : '';

  if (!chosenName) {
    chosenName = 'Familiar ' + Math.floor(Math.random() * 90 + 10);
  }

  state.userName = chosenName;
  localStorage.setItem('novena-user-name', chosenName);

  // Verificación de PIN si eligió Anfitrión
  if (state.selectedEntryRole === 'anfitrion') {
    const pinInput = document.getElementById('entry-pin-input');
    const pin = pinInput ? pinInput.value.trim() : '';
    if (pin === '1234') {
      state.isHost = true;
      localStorage.setItem('novena-is-host', 'true');
    } else {
      state.isHost = false;
      localStorage.removeItem('novena-is-host');
      state.selectedEntryRole = 'familia';
      showToast('PIN incorrecto o vacío (es 1234). Entraste como familiar.', 'users');
    }
  } else {
    state.isHost = false;
    localStorage.removeItem('novena-is-host');
  }

  const gateOverlay = document.getElementById('welcome-gate-overlay');
  if (gateOverlay) gateOverlay.style.display = 'none';

  if (state.socket && state.socket.connected) {
    state.socket.emit('set-name', { userName: state.userName });

    if (state.selectedEntryRole === 'anfitrion') {
      state.socket.emit('claim-host', { pin: '1234', name: state.userName });
    } else if (state.selectedEntryRole === 'orador') {
      state.socket.emit('claim-speaker', { name: state.userName });
    }
  }

  applyRoleUI();
  renderCurrentStep();
  showToast(`¡Bienvenido(a), ${state.userName}!`, 'candle');
};

function showToast(message, iconName = null) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  if (iconName) {
    toast.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.4rem;">${icon(iconName, { size: 16 })} ${message}</span>`;
  } else {
    toast.textContent = message;
  }
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3500);
}

// ========================================================
// CONTROLES DE ZOOM Y TAMAÑO DE FUENTE
// ========================================================
function applyZoom(notify = false) {
  const scale = state.zoomLevels[state.currentZoomIndex] || 1.0;
  document.documentElement.style.setProperty('--font-scale', scale);
  const percentage = Math.round(scale * 100);
  const label = document.getElementById('zoom-percentage-text');
  if (label) {
    label.textContent = `${percentage}%`;
  }
  try {
    localStorage.setItem('novena_zoom_index', state.currentZoomIndex);
    localStorage.setItem('novena_zoom_scale', scale);
  } catch (e) {}

  if (notify) {
    showToast(`Tamaño de letra: ${percentage}%`, 'type');
  }
}

window.zoomIn = function() {
  if (state.currentZoomIndex < state.zoomLevels.length - 1) {
    state.currentZoomIndex++;
    applyZoom(true);
  } else {
    showToast('Tamaño máximo de letra (150%)', 'zoom-in');
  }
};

window.zoomOut = function() {
  if (state.currentZoomIndex > 0) {
    state.currentZoomIndex--;
    applyZoom(true);
  } else {
    showToast('Tamaño mínimo de letra (75%)', 'zoom-out');
  }
};

window.zoomReset = function() {
  state.currentZoomIndex = 3; // 1.0 = 100%
  applyZoom(true);
  showToast('Tamaño de letra restablecido (100%)', 'refresh-cw');
};

window.cycleFontSize = function() {
  if (state.currentZoomIndex >= state.zoomLevels.length - 1) {
    state.currentZoomIndex = 3; // volver a 100%
  } else {
    state.currentZoomIndex++;
  }
  applyZoom(true);
};

// Modales
window.openModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
};

window.closeModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
};

// ========================================================
// SISTEMA DE ÁLBUM CONMEMORATIVO Y LIGHTBOX (46 FOTOGRAFÍAS)
// ========================================================
let currentLightboxIndex = 0;
let slideshowTimer = null;
let isSlideshowActive = false;

window.openPhotoAlbum = function() {
  const container = document.getElementById('album-grid-container');
  if (container && (!container.children || container.children.length === 0)) {
    const fotos = (NOVENA_DATA.fotosOlguita && NOVENA_DATA.fotosOlguita.length) 
      ? NOVENA_DATA.fotosOlguita 
      : Array.from({ length: 46 }, (_, i) => ({
          id: i + 1,
          url: `/fotos-olguita/olguita-${String(i + 1).padStart(2, '0')}.jpg`,
          titulo: `Mami Olguita • Recuerdo #${i + 1}`
        }));

    container.innerHTML = fotos.map((foto, idx) => `
      <div class="album-grid-item" onclick="window.openLightbox(${idx})" title="${foto.titulo}">
        <img src="${foto.url}" alt="${foto.titulo}" loading="lazy">
        <span class="album-item-num">#${idx + 1}</span>
      </div>
    `).join('');
  }
  window.openModal('album-modal');
};

window.openLightbox = function(index) {
  const total = (NOVENA_DATA.fotosOlguita && NOVENA_DATA.fotosOlguita.length) ? NOVENA_DATA.fotosOlguita.length : 46;
  if (index < 0) index = total - 1;
  if (index >= total) index = 0;
  currentLightboxIndex = index;

  const foto = NOVENA_DATA.fotosOlguita && NOVENA_DATA.fotosOlguita[currentLightboxIndex]
    ? NOVENA_DATA.fotosOlguita[currentLightboxIndex]
    : {
        url: `/fotos-olguita/olguita-${String(currentLightboxIndex + 1).padStart(2, '0')}.jpg`,
        titulo: `Mami Olguita • Recuerdo #${currentLightboxIndex + 1}`
      };

  const overlay = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  const counterLabel = document.getElementById('lightbox-counter-label');
  const captionText = document.getElementById('lightbox-caption-text');

  if (imgEl && foto) {
    imgEl.style.opacity = '0.4';
    imgEl.src = foto.url;
    imgEl.alt = foto.titulo;
    imgEl.onload = () => { imgEl.style.opacity = '1'; };
  }
  if (counterLabel) {
    counterLabel.textContent = `Foto ${currentLightboxIndex + 1} de ${total}`;
  }
  if (captionText && foto) {
    captionText.textContent = foto.titulo;
  }

  if (overlay) {
    overlay.classList.add('open');
  }
  replaceDomIcons();
};

window.openLightboxBySrc = function(src, customCaption) {
  const cleanSrc = src.split('?')[0];
  let foundIdx = -1;
  if (NOVENA_DATA.fotosOlguita) {
    foundIdx = NOVENA_DATA.fotosOlguita.findIndex(f => f.url === cleanSrc);
  }
  if (foundIdx === -1) {
    const match = cleanSrc.match(/olguita-(\d+)\.jpg/);
    if (match) foundIdx = parseInt(match[1], 10) - 1;
  }
  const targetIdx = foundIdx >= 0 ? foundIdx : 0;
  window.openLightbox(targetIdx);
  if (customCaption) {
    const captionText = document.getElementById('lightbox-caption-text');
    if (captionText) captionText.textContent = customCaption;
  }
};

window.closeLightbox = function() {
  const overlay = document.getElementById('lightbox-modal');
  if (overlay) overlay.classList.remove('open');
  if (isSlideshowActive) {
    window.toggleSlideshow();
  }
};

window.nextLightbox = function() {
  window.openLightbox(currentLightboxIndex + 1);
};

window.prevLightbox = function() {
  window.openLightbox(currentLightboxIndex - 1);
};

window.toggleSlideshow = function() {
  isSlideshowActive = !isSlideshowActive;
  const iconSpan = document.getElementById('slideshow-icon');
  const labelSpan = document.getElementById('slideshow-label');
  const lightIcon = document.getElementById('lightbox-slideshow-icon');

  if (isSlideshowActive) {
    if (iconSpan) iconSpan.textContent = '⏸️';
    if (labelSpan) labelSpan.textContent = 'Pausar Pase';
    if (lightIcon) lightIcon.textContent = '⏸️';

    const overlay = document.getElementById('lightbox-modal');
    if (!overlay || !overlay.classList.contains('open')) {
      window.openLightbox(currentLightboxIndex);
    }

    if (slideshowTimer) clearInterval(slideshowTimer);
    slideshowTimer = setInterval(() => {
      window.nextLightbox();
    }, 4500);
  } else {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
    if (iconSpan) iconSpan.textContent = '▶️';
    if (labelSpan) labelSpan.textContent = 'Pase de Diapositivas';
    if (lightIcon) lightIcon.textContent = '▶️';
  }
};

// Navegación con teclado (Flechas y Escape)
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox-modal');
  if (lightbox && lightbox.classList.contains('open')) {
    if (e.key === 'ArrowRight') {
      window.nextLightbox();
    } else if (e.key === 'ArrowLeft') {
      window.prevLightbox();
    } else if (e.key === 'Escape') {
      window.closeLightbox();
    }
  } else if (e.key === 'Escape') {
    window.closeModal('album-modal');
  }
});

// ========================================================
// TEATRO DE PROYECCIÓN DE DESPEDIDA (46 FOTOGRAFÍAS A PANTALLA COMPLETA)
// ========================================================
let theaterPhotoIndex = 0;
let theaterInterval = null;
const THEATER_TOTAL_PHOTOS = 46;
const THEATER_QUOTES = [
  "«Tu vida fue un regalo, tu amor una bendición y tu recuerdo será eterno.»",
  "«Siempre en nuestros corazones, amada Mami Olguita.»",
  "«Gracias por cada sonrisa, cada abrazo y tu amor incondicional.»",
  "«Tu legado de fe, alegría y unión familiar vivirá por siempre en nosotros.»",
  "«Descansa en la paz y el gozo del Señor, Madre y Abuelita querida.»",
  "«Tu luz y tu ternura guiarán por siempre a nuestra familia.»"
];

function updateTheaterPhoto(idx) {
  theaterPhotoIndex = ((idx % THEATER_TOTAL_PHOTOS) + THEATER_TOTAL_PHOTOS) % THEATER_TOTAL_PHOTOS;
  const pNum = theaterPhotoIndex + 1;
  const imgEl = document.getElementById('theater-img');
  const counterLabel = document.getElementById('theater-counter-label');
  const quoteEl = document.getElementById('theater-quote-text');

  if (imgEl) {
    imgEl.style.opacity = '0.3';
    imgEl.style.transform = 'scale(0.98)';
    imgEl.src = `/fotos-olguita/olguita-${String(pNum).padStart(2, '0')}.jpg`;
    imgEl.onload = () => {
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1)';
    };
  }

  if (counterLabel) {
    counterLabel.textContent = `Foto ${pNum} de ${THEATER_TOTAL_PHOTOS}`;
  }

  if (quoteEl) {
    const qIdx = Math.floor(theaterPhotoIndex / 3) % THEATER_QUOTES.length;
    quoteEl.textContent = THEATER_QUOTES[qIdx];
  }
}

window.openTributeTheater = function(startIndex = 0, intervalMs = 5500) {
  const overlay = document.getElementById('tribute-theater-overlay');
  if (!overlay) return;

  overlay.style.display = 'flex';
  updateTheaterPhoto(startIndex);

  // Control de finalizar proyección general: solo para el anfitrión
  const stopBtn = document.getElementById('btn-theater-stop-host');
  if (stopBtn) {
    stopBtn.style.display = state.isHost ? 'inline-flex' : 'none';
  }

  // Reproducir audio si está disponible
  const audio = document.getElementById('tribute-audio-player');
  if (audio) {
    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('[Tribute Audio] Audio en espera o archivo no cargado aún:', err);
        });
      }
    } catch (e) {
      console.log('[Tribute Audio] Error:', e);
    }
  }

  if (theaterInterval) clearInterval(theaterInterval);
  theaterInterval = setInterval(() => {
    updateTheaterPhoto(theaterPhotoIndex + 1);
  }, intervalMs);

  replaceDomIcons();
};

window.closeTributeTheater = function() {
  const overlay = document.getElementById('tribute-theater-overlay');
  if (overlay) overlay.style.display = 'none';

  if (theaterInterval) {
    clearInterval(theaterInterval);
    theaterInterval = null;
  }

  const audio = document.getElementById('tribute-audio-player');
  if (audio) {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {}
  }
  const btn = document.getElementById('btn-theater-audio-toggle');
  if (btn) btn.innerHTML = '<i data-icon="volume-2" data-size="16"></i>';
  replaceDomIcons();
};

window.toggleTributeAudio = function() {
  const audio = document.getElementById('tribute-audio-player');
  const btn = document.getElementById('btn-theater-audio-toggle');
  if (!audio) return;
  if (audio.paused) {
    audio.play().then(() => {
      if (btn) btn.innerHTML = '<i data-icon="volume-2" data-size="16"></i>';
      replaceDomIcons();
      showToast('Música instrumental activada', 'music');
    }).catch(err => {
      console.log('Error al reproducir audio:', err);
    });
  } else {
    audio.pause();
    if (btn) btn.innerHTML = '<i data-icon="volume-x" data-size="16"></i>';
    replaceDomIcons();
    showToast('Música silenciada', 'volume-x');
  }
};

window.closeTheaterLocal = function() {
  const overlay = document.getElementById('tribute-theater-overlay');
  if (overlay) overlay.style.display = 'none';
  const audio = document.getElementById('tribute-audio-player');
  if (audio) {
    try {
      audio.pause();
    } catch (e) {}
  }
};

window.startTributeProjection = function() {
  if (state.socket && state.socket.connected) {
    state.socket.emit('start-tribute-projection', { intervalMs: 5500 });
  } else {
    fetch('/api/tribute/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: state.isHost ? 'Anfitrión' : 'Logística', intervalMs: 5500 })
    });
  }
  window.openTributeTheater(0, 5500);
  showToast('Iniciando proyección de despedida para todos...', 'sparkles');
};

window.stopTributeProjection = function() {
  if (state.socket && state.socket.connected) {
    state.socket.emit('stop-tribute-projection');
  } else {
    fetch('/api/tribute/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  }
  window.closeTributeTheater();
  showToast('Proyección conmemorativa finalizada', 'check');
};

// Sincronización HTTP Dual-Channel Fallback
async function syncFromHttpState() {
  try {
    const res = await fetch('/api/state?t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      let changed = false;
      if (data.currentDay !== undefined && data.currentDay !== state.currentDay) {
        state.currentDay = data.currentDay;
        changed = true;
      }
      if (data.currentStepIndex !== undefined && data.currentStepIndex !== state.currentStepIndex) {
        state.currentStepIndex = data.currentStepIndex;
        changed = true;
      }
      if (data.selectedMystery && data.selectedMystery !== state.activeMysteryType) {
        state.activeMysteryType = data.selectedMystery;
        changed = true;
      }
      if (data.currentAveMaria !== undefined && data.currentAveMaria !== state.currentAveMaria) {
        state.currentAveMaria = data.currentAveMaria;
        changed = true;
      }
      if (data.speakerName && data.speakerSocketId !== state.speakerSocketId) {
        updateSpeakerUI(data.speakerSocketId, data.speakerName);
      }
      if (data.isTributeProjecting) {
        const overlay = document.getElementById('tribute-theater-overlay');
        if (!overlay || overlay.style.display === 'none') {
          window.openTributeTheater(0, 5500);
        }
      }
      if (changed) {
        renderCurrentStep();
      }
    }
  } catch (e) {
    // Modo offline o reconexión silenciosa
  }
}

// Inicializar
function init() {
  // Cargar nivel de zoom guardado o iniciar en 100%
  try {
    const savedIdx = localStorage.getItem('novena_zoom_index');
    if (savedIdx !== null && state.zoomLevels[parseInt(savedIdx, 10)] !== undefined) {
      state.currentZoomIndex = parseInt(savedIdx, 10);
    } else {
      state.currentZoomIndex = 3; // 100% por defecto
    }
  } catch (e) {
    state.currentZoomIndex = 3;
  }
  applyZoom(false);
  replaceDomIcons();
  renderCurrentStep();
  initRealtimeSync();

  // Carga inmediata de estado actual por HTTP para renderizado inicial instantáneo (0ms)
  syncFromHttpState();

  const savedName = localStorage.getItem('novena-user-name');
  const nameField = document.getElementById('welcome-name-input');
  if (savedName && nameField) {
    nameField.value = savedName;
  }

  // Sincronizar radio buttons del rol de entrada
  document.querySelectorAll('input[name="entry-role-radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      window.selectEntryRole(e.target.value);
    });
  });
}

// ========================================================
// CONTROL REMOTO / PANTALLA COMPLETA PARA SMART TV
// ========================================================
window.toggleFullScreen = function() {
  if (!document.fullscreenElement) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        showToast('Modo Pantalla Completa TV activado', 'maximize');
      }).catch(err => {
        console.log('Error intentando entrar en pantalla completa:', err);
      });
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        showToast('Saliendo de Pantalla Completa', 'minimize');
      }).catch(() => {});
    }
  }
};

document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('btn-fullscreen-tv');
  const isFull = !!document.fullscreenElement;
  document.body.classList.toggle('modo-tv', isFull);
  if (btn) {
    btn.innerHTML = `<i data-icon="${isFull ? 'minimize' : 'maximize'}" data-size="14"></i> <span class="btn-tv-label">${isFull ? 'Salir TV' : 'Modo TV'}</span>`;
    replaceDomIcons(btn);
  }
});

// Navegación con teclado inalámbrico o mando de TV (Flechas y Espacio)
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault();
    window.nextStep();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    window.prevStep();
  } else if (e.key === 'f' || e.key === 'F') {
    e.preventDefault();
    window.toggleFullScreen();
  } else if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    window.zoomIn();
  } else if (e.key === '-' || e.key === '_') {
    e.preventDefault();
    window.zoomOut();
  } else if (e.key === '0') {
    e.preventDefault();
    window.zoomReset();
  }
});

function startApp() {
  init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
