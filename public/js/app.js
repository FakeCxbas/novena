// app.js - Lógica interactiva con 3 Roles (Anfitrión, Orador, Familia), control total de micrófonos y cámaras activas
import { NOVENA_DATA } from './novena-data.js';
import { icon, replaceDomIcons } from './icons.js';

// Estado de la aplicación
const state = {
  currentDay: 1,
  currentStepIndex: 0,
  activeMysteryType: null, // 'gozosos', 'dolorosos', 'luminosos', 'gloriosos' o auto
  fontScaleIndex: 1,
  fontScales: [0.95, 1.12, 1.28],
  isHost: false, // La consola de anfitrión está en /logistica
  isSpeaker: false,
  isSyncedWithHost: true,
  connectedUsers: 1,
  currentAveMaria: 0,
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

// Generar la lista de pasos secuenciales para el día actual
function buildStepsForDay(dayNumber) {
  const dayData = NOVENA_DATA.dias.find(d => d.dia === dayNumber) || NOVENA_DATA.dias[0];
  const mysteryType = state.activeMysteryType || getAutoMysteryType();
  const mysteryObj = NOVENA_DATA.rosario.misterios[mysteryType];

  const oradorBadge = (label = 'Orador') => `<span class="voice-badge guia" style="display:inline-flex; align-items:center; gap:0.3rem;">${icon('speaker', { size: 14 })} ${label}</span>`;
  const todosBadge = (label = 'Todos responden a coro') => `<span class="voice-badge todos" style="display:inline-flex; align-items:center; gap:0.3rem;">${icon('users', { size: 14 })} ${label}</span>`;

  return [
    // Paso 0: Portada & Apertura
    {
      id: 'apertura',
      badge: 'Inicio de la Novena',
      title: 'Por la Señal de la Santa Cruz',
      render: () => `
        <div style="text-align: center; margin-bottom: 0.9rem;">
          <div class="candle-icon" style="margin: 0 auto 0.4rem auto; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            ${icon('candle', { size: 36, color: '#DFB15B' })}
          </div>
          <h2 style="font-family: var(--font-serif); font-size: 1.35rem; color: var(--gold-primary); margin-bottom: 0.2rem;">MAMI OLGUITA</h2>
          <div style="font-family: var(--font-body); font-style: italic; font-size: 0.95rem; color: var(--gold-light);">
            ${NOVENA_DATA.info.jaculatoria}
          </div>
        </div>

        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Orador (Guía)')}
            <div class="voice-text">Por la señal de la Santa Cruz, de nuestros enemigos líbranos Señor, Dios nuestro. En el nombre del Padre, del Hijo y del Espíritu Santo.</div>
          </div>
          <div class="todos-part">
            ${todosBadge()}
            <div class="voice-text">Amén.</div>
          </div>
        </div>
      `
    },

    // Paso 1: Oración Inicial de todos los días
    {
      id: 'oracion-inicial',
      badge: 'Oración de Todos los Días',
      title: NOVENA_DATA.oracionInicial.title,
      render: () => `
        <div class="guia-part" style="margin-bottom: 0.8rem;">
          ${oradorBadge('Orador lee:')}
          <div style="font-size: 1.05rem; display: flex; flex-direction: column; gap: 0.75rem;">
            ${NOVENA_DATA.oracionInicial.paragraphs.map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>
        <div class="todos-part">
          ${todosBadge()}
          <div class="voice-text">Amén.</div>
        </div>
      `
    },

    // Paso 2: Lectura y Reflexión del Día
    {
      id: 'reflexion-dia',
      badge: `Día ${dayData.dia} de la Novena`,
      title: dayData.titulo,
      render: () => `
        <div class="bible-quote-box">
          ${dayData.cita}
          <span class="bible-ref">— ${dayData.referencia}</span>
        </div>
        <div class="guia-part" style="margin-top: 0.8rem;">
          ${oradorBadge('Orador lee la Reflexión:')}
          <p style="font-size: 1.08rem; line-height: 1.8;">${dayData.reflexion}</p>
        </div>
      `
    },

    // Paso 3: Oración del Día
    {
      id: 'oracion-dia',
      badge: `Día ${dayData.dia}`,
      title: `Oración del Día ${dayData.dia}`,
      render: () => `
        <div class="guia-part" style="margin-bottom: 0.8rem;">
          ${oradorBadge('Orador lee:')}
          <div style="font-size: 1.05rem; display: flex; flex-direction: column; gap: 0.75rem;">
            ${dayData.oracion.map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>
        <div class="todos-part">
          ${todosBadge()}
          <div class="voice-text">Amén.</div>
        </div>
      `
    },

    // Paso 4: Santo Rosario - Oración Inicial y Credo
    {
      id: 'rosario-inicio',
      badge: 'El Santo Rosario',
      title: 'Santo Rosario por Mami Olguita',
      render: () => `
        <div class="guia-part" style="margin-bottom: 1rem;">
          ${oradorBadge('Orador (Ofrecimiento):')}
          <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 1.02rem;">
            ${NOVENA_DATA.rosario.oracionInicial.text.map(t => `<p>${t}</p>`).join('')}
          </div>
        </div>

        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Orador (El Credo)')}
            <div class="voice-text">${NOVENA_DATA.rosario.credo.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge()}
            <div class="voice-text">${NOVENA_DATA.rosario.credo.todos}</div>
          </div>
        </div>
      `
    },

    // Paso 5: Cuentas Iniciales
    {
      id: 'cuentas-iniciales',
      badge: 'Santo Rosario',
      title: 'Cuentas Iniciales del Rosario',
      render: () => `
        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Orador — Padre Nuestro')}
            <div class="voice-text">${NOVENA_DATA.rosario.padreNuestro.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge()}
            <div class="voice-text">${NOVENA_DATA.rosario.padreNuestro.todos}</div>
          </div>
        </div>

        <div style="margin: 0.8rem 0;">
          <div class="dialogo-block">
            <div class="guia-part">
              ${oradorBadge('Orador — 3 Ave Marías')}
              <div class="voice-text">${NOVENA_DATA.rosario.aveMaria.guia}</div>
            </div>
            <div class="todos-part">
              ${todosBadge()}
              <div class="voice-text">${NOVENA_DATA.rosario.aveMaria.todos}</div>
            </div>
          </div>
          <p style="font-size: 0.82rem; color: var(--gold-amber); font-style: italic; text-align: center;">(Se rezan tres veces por la Fe, Esperanza y Caridad)</p>
        </div>

        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Orador — Gloria')}
            <div class="voice-text">${NOVENA_DATA.rosario.gloria.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge()}
            <div class="voice-text">${NOVENA_DATA.rosario.gloria.todos}</div>
          </div>
        </div>
      `
    },

    // Pasos 6 al 10: Los 5 Misterios del día
    ...mysteryObj.lista.map((misterioTexto, index) => ({
      id: `misterio-${index + 1}`,
      badge: `${mysteryObj.nombre} (${index + 1}/5)`,
      title: `${index + 1}º Misterio: ${misterioTexto}`,
      render: () => `
        <div style="text-align: center; margin-bottom: 0.8rem;">
          <div style="font-size: 0.8rem; font-family: var(--font-sans); color: var(--gold-primary); text-transform: uppercase; font-weight: 700;">
            ${mysteryObj.nombre}
          </div>
          <h3 style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--gold-light); margin: 0.2rem 0;">
            ${misterioTexto}
          </h3>
        </div>

        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Orador — Padre Nuestro')}
            <div class="voice-text">${NOVENA_DATA.rosario.padreNuestro.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge()}
            <div class="voice-text">${NOVENA_DATA.rosario.padreNuestro.todos}</div>
          </div>
        </div>

        <!-- Rosario Contador de 10 Ave Marías -->
        <div class="rosario-counter-card">
          <div class="rosario-counter-header" style="display:flex; align-items:center; justify-content:center; gap:0.35rem;">
            ${icon('rosary', { size: 15, color: '#DFB15B' })} 10 Ave Marías • (<span id="bead-count-label">${state.currentAveMaria}</span>/10)
          </div>
          <div class="beads-row" id="beads-container">
            ${Array.from({ length: 10 }).map((_, bIdx) => `
              <div class="bead-item ${bIdx < state.currentAveMaria ? 'completed' : ''} ${bIdx === state.currentAveMaria - 1 ? 'active' : ''}" 
                   onclick="window.setAveMaria(${bIdx + 1})">
                ${bIdx + 1}
              </div>
            `).join('')}
          </div>
          <div style="margin-top: 0.5rem; display: flex; justify-content: center; gap: 0.4rem;">
            <button class="btn-speaker-item" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem;" onclick="window.nextAveMaria()">
              ${icon('plus', { size: 13 })} Contar Ave María
            </button>
            <button class="btn-speaker-item" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem;" onclick="window.setAveMaria(0)">
              ${icon('refresh', { size: 13 })} Reiniciar
            </button>
          </div>
        </div>

        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Orador — Ave María')}
            <div class="voice-text">${NOVENA_DATA.rosario.aveMaria.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge()}
            <div class="voice-text">${NOVENA_DATA.rosario.aveMaria.todos}</div>
          </div>
        </div>

        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Orador — Gloria')}
            <div class="voice-text">${NOVENA_DATA.rosario.gloria.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge()}
            <div class="voice-text">${NOVENA_DATA.rosario.gloria.todos}</div>
          </div>
        </div>

        <!-- Jaculatoria por Mami Olguita -->
        <div class="dialogo-block" style="border: 1px solid var(--border-strong); border-radius: var(--radius-sm); padding: 0.6rem; background: rgba(223, 177, 91, 0.08);">
          <div class="guia-part" style="background: transparent; border: none; padding: 0;">
            ${oradorBadge('Orador — Por Mami Olguita:')}
            <div class="voice-text">${NOVENA_DATA.rosario.jaculatoriaOlguita.guia}</div>
          </div>
          <div class="todos-part" style="background: transparent; border: none; padding: 0.4rem 0 0 0;">
            ${todosBadge('Todos responden a coro:')}
            <div class="voice-text">${NOVENA_DATA.rosario.jaculatoriaOlguita.todos}</div>
          </div>
        </div>
      `
    })),

    // Paso 11: La Salve
    {
      id: 'la-salve',
      badge: 'Santo Rosario',
      title: 'La Salve a la Santísima Virgen',
      render: () => `
        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Orador')}
            <div class="voice-text">${NOVENA_DATA.rosario.salve.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge()}
            <div class="voice-text">${NOVENA_DATA.rosario.salve.todos}</div>
          </div>
        </div>
      `
    },

    // Paso 12: Las Letanías
    {
      id: 'letanias',
      badge: 'Santo Rosario',
      title: 'Letanías a la Santísima Virgen María',
      render: () => `
        <p style="font-size: 0.85rem; color: var(--gold-primary); margin-bottom: 0.6rem; font-weight: 700;">
          El Orador menciona cada título y Todos responden "Ruega por ella":
        </p>
        <div style="display: flex; flex-direction: column; gap: 0.35rem; max-height: 380px; overflow-y: auto; padding-right: 0.3rem;">
          ${NOVENA_DATA.rosario.letanias.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border-subtle); font-size: 0.95rem;">
              <span style="color: var(--text-primary); font-family: var(--font-body);">${item.guia || item.invocacion}</span>
              <span style="color: #fde047; font-weight: 700; font-family: var(--font-sans); font-size: 0.88rem;">${item.todos || item.respuesta}</span>
            </div>
          `).join('')}
        </div>
      `
    },

    // Paso 13: Oración Final por Mami Olguita
    {
      id: 'oracion-final-olguita',
      badge: 'Oraciones Finales',
      title: NOVENA_DATA.oracionFinalOlguita.title,
      render: () => `
        <div class="guia-part" style="margin-bottom: 0.8rem;">
          ${oradorBadge('Orador lee:')}
          <div style="font-size: 1.05rem; display: flex; flex-direction: column; gap: 0.75rem;">
            ${NOVENA_DATA.oracionFinalOlguita.paragraphs.map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>
        <div class="todos-part">
          ${todosBadge()}
          <div class="voice-text">${NOVENA_DATA.oracionFinalOlguita.response}</div>
        </div>
      `
    },

    // Paso 14: Oración Final de la Familia
    {
      id: 'oracion-final-familia',
      badge: 'Oraciones Finales',
      title: NOVENA_DATA.oracionFinalFamilia.title,
      render: () => `
        <div class="guia-part" style="margin-bottom: 0.8rem;">
          ${oradorBadge('Orador lee:')}
          <div style="font-size: 1.05rem; display: flex; flex-direction: column; gap: 0.75rem;">
            ${NOVENA_DATA.oracionFinalFamilia.paragraphs.map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>
        <div class="dialogo-block">
          <div class="guia-part">
            ${oradorBadge('Orador')}
            <div class="voice-text">${NOVENA_DATA.oracionFinalFamilia.despedidaJaculatoria.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge()}
            <div class="voice-text">${NOVENA_DATA.oracionFinalFamilia.despedidaJaculatoria.todos}</div>
          </div>
        </div>
      `
    },

    // Paso 15: Mensaje para la Familia
    {
      id: 'mensaje-familia',
      badge: `Día ${dayData.dia}`,
      title: 'Mensaje para la Familia',
      render: () => `
        <div class="guia-part" style="border-left: 3px solid var(--gold-amber); padding: 1rem;">
          ${oradorBadge('Orador lee para toda la familia:')}
          <p style="font-size: 1.1rem; line-height: 1.85; color: var(--gold-light);">${dayData.mensajeFamilia}</p>
        </div>
      `
    },

    // Paso 16: Despedida & Placa Conmemorativa
    {
      id: 'despedida-homenaje',
      badge: 'Cierre de la Novena',
      title: 'Despedida, Bendición y Homenaje',
      render: () => `
        <div class="dialogo-block" style="margin-bottom: 1.2rem;">
          <div class="guia-part">
            ${oradorBadge('Orador')}
            <div class="voice-text">${NOVENA_DATA.despedidaFinal.guia}</div>
          </div>
          <div class="todos-part">
            ${todosBadge()}
            <div class="voice-text">${NOVENA_DATA.despedidaFinal.todos}</div>
          </div>
        </div>

        <div style="text-align: center; margin: 0.8rem 0; font-family: var(--font-sans); color: var(--gold-amber); font-weight: 700; font-size: 1.05rem;">
          ${NOVENA_DATA.despedidaFinal.bendicion}
        </div>

        <!-- Placa Conmemorativa -->
        <div class="tribute-box">
          <div class="candle-icon" style="margin: 0 auto 0.6rem auto; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            ${icon('candle', { size: 38, color: '#DFB15B' })}
          </div>
          <div class="tribute-name">${NOVENA_DATA.placaHomenaje.nombre}</div>
          <div class="tribute-lines">
            ${NOVENA_DATA.placaHomenaje.lineas.map(l => `<div>${l}</div>`).join('')}
          </div>
          <div class="tribute-rip">${NOVENA_DATA.placaHomenaje.cierre}</div>
          <div class="tribute-footer">${NOVENA_DATA.placaHomenaje.mensajeFinal}</div>
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

  if (pinBox) {
    pinBox.style.display = (role === 'anfitrion') ? 'block' : 'none';
    if (role === 'anfitrion') {
      const pinInput = document.getElementById('entry-pin-input');
      if (pinInput) pinInput.focus();
    }
  }
};

// ========================================================
// RENDERIZADO DEL PASO ACTUAL (SINCRONIZACIÓN Y AUTO-SCROLL)
// ========================================================
function renderCurrentStep() {
  steps = buildStepsForDay(state.currentDay);
  const totalSteps = steps.length;
  if (state.currentStepIndex >= totalSteps) state.currentStepIndex = totalSteps - 1;
  if (state.currentStepIndex < 0) state.currentStepIndex = 0;

  const currentStep = steps[state.currentStepIndex];

  // Actualizar títulos e indicadores
  const badgeEl = document.getElementById('day-step-badge');
  const titleEl = document.getElementById('card-section-title');
  const bodyEl = document.getElementById('card-step-body');
  const stepNumberLabel = document.getElementById('step-counter-text');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');

  if (badgeEl) badgeEl.textContent = `Día ${state.currentDay} • ${currentStep.badge}`;
  if (titleEl) titleEl.textContent = currentStep.title;
  if (bodyEl) bodyEl.innerHTML = currentStep.render();
  if (stepNumberLabel) stepNumberLabel.textContent = `Paso ${state.currentStepIndex + 1} de ${totalSteps}`;

  // Botones de navegación del anfitrión
  if (prevBtn) prevBtn.disabled = state.currentStepIndex === 0;
  if (nextBtn) {
    if (state.currentStepIndex === totalSteps - 1) {
      nextBtn.innerHTML = `<span>Finalizar</span>`;
    } else {
      nextBtn.innerHTML = `<span>Siguiente</span> <i data-icon="chevron-right" data-size="16"></i>`;
    }
  }

  // AUTO-SCROLL AL TOPE: Para que en teléfono celular NUNCA quede cortado el texto
  window.scrollTo({ top: 0, behavior: 'smooth' });

  applyRoleUI();
  replaceDomIcons();

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

  updateCallControlsUI();
  updateLocalTileMicUI();
}

function updateSpeakerUI(speakerSocketId, speakerName) {
  state.speakerSocketId = speakerSocketId;
  state.speakerName = speakerName || 'Esperando Orador';

  const isMe = state.socket && state.socket.id === speakerSocketId;
  state.isSpeaker = isMe;

  const label = document.getElementById('speaker-name-label');
  if (label) {
    if (isMe) {
      label.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.25rem;">${icon('speaker', { size: 13 })} ¡Tú eres el Orador!</span>`;
    } else if (speakerSocketId) {
      label.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.25rem;">${icon('speaker', { size: 13 })} ${state.speakerName}</span>`;
    } else {
      label.textContent = 'Esperando Orador';
    }
  }

  // Resaltar miniatura del orador en la barra de cámaras
  const localTile = document.getElementById('local-camera-tile');
  if (localTile) {
    localTile.classList.toggle('is-speaker', isMe);
  }

  callState.peers.forEach((peer, sId) => {
    if (peer.tileEl) {
      peer.tileEl.classList.toggle('is-speaker', sId === speakerSocketId);
    }
  });

  applyRoleUI();
}

// Navegación (Solo activada por el Anfitrión)
window.nextStep = function() {
  if (state.currentStepIndex < steps.length - 1) {
    state.currentStepIndex++;
    state.currentAveMaria = 0;
    renderCurrentStep();
  }
};

window.prevStep = function() {
  if (state.currentStepIndex > 0) {
    state.currentStepIndex--;
    state.currentAveMaria = 0;
    renderCurrentStep();
  }
};

window.selectDay = function(dayNumber) {
  state.currentDay = dayNumber;
  state.currentStepIndex = 0;
  state.currentAveMaria = 0;
  renderLogisticsModal();
  renderCurrentStep();
};

window.jumpToStep = function(stepIdx) {
  state.currentStepIndex = stepIdx;
  state.currentAveMaria = 0;
  renderCurrentStep();
  closeModal('logistics-modal');
};

// Ave María contador
window.setAveMaria = function(count) {
  state.currentAveMaria = count;
  const label = document.getElementById('bead-count-label');
  if (label) label.textContent = count;

  const container = document.getElementById('beads-container');
  if (container) {
    container.querySelectorAll('.bead-item').forEach((b, idx) => {
      b.classList.toggle('completed', idx < count);
      b.classList.toggle('active', idx === count - 1);
    });
  }

  if (state.isHost && state.socket && state.socket.connected) {
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

      const savedName = localStorage.getItem('novena-user-name') || callState.userName;
      if (savedName) {
        state.socket.emit('set-name', { userName: savedName });
      }

      // Re-unir a la videollamada si ya estaba conectado
      if (callState.inCall) {
        state.socket.emit('join-call', {
          userName: callState.userName || savedName,
          isAudioOnly: callState.isVideoOff
        });
      }

      // Re-reclamar anfitrión SOLO si explícitamente se eligió anfitrión en esta sesión
      if (state.isHost && state.selectedEntryRole === 'anfitrion') {
        state.socket.emit('claim-host', { pin: '1234', name: callState.userName || savedName });
      }
    });

    state.socket.on('state-update', (data) => {
      // Sincronizar el rezo familiar inmediatamente con lo que dicte el servidor
      if (data.currentDay !== undefined) state.currentDay = data.currentDay;
      if (data.currentStepIndex !== undefined) state.currentStepIndex = data.currentStepIndex;
      if (data.selectedMystery) state.activeMysteryType = data.selectedMystery;
      if (data.currentAveMaria !== undefined) state.currentAveMaria = data.currentAveMaria;
      if (data.speakerName) updateSpeakerUI(data.speakerSocketId, data.speakerName);
      renderCurrentStep();
    });

    // Evento de paso cambiado por el anfitrión (Logística o Host)
    state.socket.on('step-changed', (data) => {
      // Sincronización en tiempo real garantizada para toda la familia
      if (data.currentDay !== undefined) state.currentDay = data.currentDay;
      if (data.currentStepIndex !== undefined) state.currentStepIndex = data.currentStepIndex;
      if (data.selectedMystery) state.activeMysteryType = data.selectedMystery;
      if (data.currentAveMaria !== undefined) state.currentAveMaria = data.currentAveMaria;
      renderCurrentStep();
    });

    state.socket.on('speaker-changed', ({ speakerSocketId, speakerName }) => {
      updateSpeakerUI(speakerSocketId, speakerName);
      if (state.socket && state.socket.id === speakerSocketId) {
        // Si este dispositivo fue nombrado Orador, abrir el micrófono automáticamente
        if (callState.localStream) {
          callState.isAudioMuted = false;
          callState.localStream.getAudioTracks().forEach(t => { t.enabled = true; });
          updateCallControlsUI();
          updateLocalTileMicUI();
          showToast('¡Has sido designado como el Orador! Tu micrófono está abierto.', 'speaker');
        }
      }
      if (state.isHost) renderFamilyMicsList();
    });

    // Evento de orden de micrófono del anfitrión (Prender o Apagar)
    state.socket.on('force-audio-state', ({ enabled }) => {
      if (callState.localStream) {
        callState.isAudioMuted = !enabled;
        callState.localStream.getAudioTracks().forEach(t => { t.enabled = enabled; });
        updateCallControlsUI();
        updateLocalTileMicUI();

        showToast(enabled ? 'El anfitrión ha abierto tu micrófono' : 'El anfitrión ha silenciado tu micrófono', enabled ? 'mic' : 'mic-off');

        state.socket.emit('call-media-state', {
          isAudioMuted: callState.isAudioMuted,
          isVideoOff: callState.isVideoOff
        });
      }
    });

    state.socket.on('user-media-state-changed', ({ socketId, isAudioMuted, isVideoOff }) => {
      const peer = callState.peers.get(socketId);
      if (peer) {
        if (isAudioMuted !== undefined) {
          peer.isAudioMuted = isAudioMuted;
          updatePeerTileMicUI(socketId, isAudioMuted);
        }
        if (isVideoOff !== undefined && peer.avatarEl && peer.videoEl) {
          peer.isVideoOff = isVideoOff;
          if (isVideoOff) {
            peer.avatarEl.style.display = 'flex';
            peer.videoEl.style.display = 'none';
          } else {
            peer.avatarEl.style.display = 'none';
            peer.videoEl.style.display = 'block';
          }
        }
      }
      if (state.isHost) {
        renderFamilyMicsList();
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
  }
}

// Logística del Anfitrión
function renderLogisticsModal() {
  // 1. Selector de Días
  const daysContainer = document.getElementById('logistics-days-grid');
  if (daysContainer) {
    daysContainer.innerHTML = NOVENA_DATA.dias.map(d => `
      <button class="logistics-day-btn ${d.dia === state.currentDay ? 'active' : ''}" onclick="window.selectDay(${d.dia})">
        Día ${d.dia}
      </button>
    `).join('');
  }

  // 2. Selector de Orador (Todos los conectados)
  const speakerContainer = document.getElementById('speaker-selection-list');
  if (speakerContainer) {
    const isMeSpeaker = state.socket && state.socket.id === state.speakerSocketId;
    let html = `
      <button class="btn-speaker-item ${isMeSpeaker ? 'active' : ''}" onclick="window.designateSpeaker('${state.socket ? state.socket.id : ''}', '${callState.userName} (Yo)')" style="display:flex; align-items:center; gap:0.4rem;">
        <span>${icon('user', { size: 16 })}</span>
        <span>${callState.userName} (Yo)</span>
      </button>
    `;

    callState.peers.forEach((peer, sId) => {
      const isThisSpeaker = sId === state.speakerSocketId;
      html += `
        <button class="btn-speaker-item ${isThisSpeaker ? 'active' : ''}" onclick="window.designateSpeaker('${sId}', '${peer.userName}')" style="display:flex; align-items:center; gap:0.4rem;">
          <span>${icon('speaker', { size: 16 })}</span>
          <span>${peer.userName}</span>
        </button>
      `;
    });

    speakerContainer.innerHTML = html;
  }

  // 3. Control individual de micrófonos
  renderFamilyMicsList();

  // 4. Saltar a pasos
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

function renderFamilyMicsList() {
  const micListContainer = document.getElementById('family-members-mic-list');
  if (!micListContainer) return;

  if (callState.peers.size === 0) {
    micListContainer.innerHTML = `
      <div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; padding: 0.3rem;">
        Esperando que otros familiares se conecten a la videollamada...
      </div>
    `;
    return;
  }

  let html = '';
  callState.peers.forEach((peer, sId) => {
    const isMuted = Boolean(peer.isAudioMuted);
    const isSpeaker = sId === state.speakerSocketId;
    html += `
      <div class="family-member-row">
        <div class="family-member-name" style="display:flex; align-items:center; gap:0.4rem;">
          <span>${isMuted ? icon('mic-off', { size: 14 }) : icon('mic', { size: 14 })}</span>
          <span>${peer.userName} ${isSpeaker ? `<strong style="color:var(--gold-amber)">(${icon('speaker', { size: 12 })} Orador)</strong>` : ''}</span>
        </div>
        <div class="family-member-actions">
          <button class="btn-member-mic ${isMuted ? 'muted-voice' : 'active-voice'}" 
                  onclick="window.setUserAudio('${sId}', ${isMuted})"
                  style="display:inline-flex; align-items:center; gap:0.25rem;">
            ${isMuted ? `${icon('mic', { size: 13 })} Prender Mic` : `${icon('mic-off', { size: 13 })} Silenciar`}
          </button>
        </div>
      </div>
    `;
  });
  micListContainer.innerHTML = html;
}

window.designateSpeaker = function(socketId, speakerName) {
  if (state.socket && state.socket.connected) {
    state.socket.emit('set-speaker', { socketId, speakerName });
    showToast(`${speakerName} ha sido designado como Orador`, 'speaker');
  }
  closeModal('logistics-modal');
};

// Control global de micrófonos por el anfitrión (Prender o Apagar a todos)
window.setAllListenersAudio = function(enabled) {
  if (state.socket && state.socket.connected) {
    state.socket.emit('set-all-listeners-audio', { enabled });
    showToast(enabled ? 'Se activaron los micrófonos de todos' : 'Se silenciaron los micrófonos de todos', enabled ? 'mic' : 'mic-off');
  }
  closeModal('logistics-modal');
};

// Control individual de micrófono por el anfitrión
window.setUserAudio = function(targetSocketId, enabled) {
  if (state.socket && state.socket.connected) {
    state.socket.emit('set-user-audio-state', { targetSocketId, enabled });
    const peer = callState.peers.get(targetSocketId);
    if (peer) {
      peer.isAudioMuted = !enabled;
      updatePeerTileMicUI(targetSocketId, !enabled);
    }
    renderFamilyMicsList();
    showToast(enabled ? 'Micrófono activado' : 'Micrófono silenciado', enabled ? 'mic' : 'mic-off');
  }
};

window.muteAllListeners = function() {
  window.setAllListenersAudio(false);
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
      state.socket.emit('claim-host', { pin, name: callState.userName });
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

// ========================================================
// VIDEOLLAMADA FAMILIAR CON CÁMARAS ACTIVAS EN CELULAR (WebRTC)
// ========================================================

const callState = {
  inCall: false,
  userName: localStorage.getItem('novena-user-name') || '',
  localStream: null,
  peers: new Map(),
  isAudioMuted: false,
  isVideoOff: false,
  isFincaMode: false,
  rtcConfig: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' }
    ]
  }
};

// Entrar a la sala con un solo toque (Cámara y Voz SIEMPRE activas por defecto)
window.enterRoomOneTouch = async function() {
  const nameInput = document.getElementById('welcome-name-input');
  let chosenName = nameInput ? nameInput.value.trim() : '';

  if (!chosenName) {
    chosenName = 'Familiar ' + Math.floor(Math.random() * 90 + 10);
  }

  callState.userName = chosenName;
  localStorage.setItem('novena-user-name', chosenName);

  // Verificación de PIN si eligió Anfitrión
  if (state.selectedEntryRole === 'anfitrion') {
    const pinInput = document.getElementById('entry-pin-input');
    const pin = pinInput ? pinInput.value.trim() : '';
    if (pin !== '1234') {
      alert('El PIN de Anfitrión es 1234');
      return;
    }
    state.isHost = true;
    localStorage.setItem('novena-is-host', 'true');
  } else {
    // Si entra como familiar u orador, limpiar cualquier estado previo de host
    state.isHost = false;
    localStorage.removeItem('novena-is-host');
  }

  // Mostrar guía de permisos con flecha
  const permGuide = document.getElementById('permission-guide-overlay');
  if (permGuide) permGuide.style.display = 'flex';

  // Pedir cámara y micrófono con video de buena calidad para teléfono
  try {
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: {
        width: { ideal: 360, max: 480 },
        height: { ideal: 360, max: 480 },
        facingMode: 'user'
      }
    };

    callState.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    callState.isVideoOff = false;
  } catch (err) {
    console.warn('Fallo cámara/audio juntos, intentando audio solo:', err);
    try {
      callState.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      callState.isVideoOff = true;
    } catch (audioErr) {
      if (permGuide) permGuide.style.display = 'none';
      openModal('permission-blocked-modal');
      return;
    }
  }

  if (permGuide) permGuide.style.display = 'none';
  const gateOverlay = document.getElementById('welcome-gate-overlay');
  if (gateOverlay) gateOverlay.style.display = 'none';

  callState.inCall = true;

  // Miniatura propia con video forzado a reproducir
  const localVideo = document.getElementById('local-video');
  const localAvatar = document.getElementById('local-avatar');
  const localName = document.getElementById('local-user-name');

  if (localName) localName.textContent = `${callState.userName} (Tú)`;
  if (localAvatar) localAvatar.textContent = callState.userName.slice(0, 2).toUpperCase();

  if (callState.localStream) {
    localVideo.srcObject = callState.localStream;
    localVideo.muted = true;
    localVideo.playsInline = true;
    localVideo.setAttribute('playsinline', 'true');
    localVideo.setAttribute('webkit-playsinline', 'true');
    localVideo.play().catch(e => console.log('Local video play error', e));

    if (callState.isVideoOff) {
      localAvatar.style.display = 'flex';
      localVideo.style.display = 'none';
    } else {
      localAvatar.style.display = 'none';
      localVideo.style.display = 'block';
    }

    // Agregar tracks a peers existentes que ya estuvieran negociados (ej. Mando de Logística)
    callState.peers.forEach(peer => {
      if (peer.pc) {
        callState.localStream.getTracks().forEach(track => {
          try {
            peer.pc.addTrack(track, callState.localStream);
          } catch(e) {}
        });
      }
    });
  }

  if (state.socket && state.socket.connected) {
    state.socket.emit('join-call', {
      userName: callState.userName,
      isAudioOnly: callState.isVideoOff
    });

    if (state.selectedEntryRole === 'anfitrion') {
      state.socket.emit('claim-host', { pin: '1234', name: callState.userName });
    } else if (state.selectedEntryRole === 'orador') {
      state.socket.emit('claim-speaker', { name: callState.userName });
    }
  }

  applyRoleUI();
  renderCurrentStep();
  updateCallControlsUI();
};

// Crear miniatura visible de cámara en la tira superior (~82px)
function createParticipantTile(socketId, userName) {
  const container = document.getElementById('remote-cameras-container');
  
  const tileEl = document.createElement('div');
  tileEl.className = 'camera-mini-tile';
  tileEl.id = `participant-${socketId}`;

  const initials = (userName || 'Familiar').slice(0, 2).toUpperCase();

  tileEl.innerHTML = `
    <video autoplay playsinline muted webkit-playsinline></video>
    <audio autoplay playsinline></audio>
    <div class="camera-mini-avatar">${initials}</div>
    <div class="camera-mini-name">${userName || 'Familiar'}</div>
    <div class="tile-mic-indicator" id="tile-mic-${socketId}" title="Micrófono">${icon('mic', { size: 12 })}</div>
  `;

  container.appendChild(tileEl);

  const videoEl = tileEl.querySelector('video');
  const audioEl = tileEl.querySelector('audio');
  const avatarEl = tileEl.querySelector('.camera-mini-avatar');
  const micIndicator = tileEl.querySelector('.tile-mic-indicator');

  if (socketId === state.speakerSocketId) {
    tileEl.classList.add('is-speaker');
  }

  // Si el usuario actual es el Anfitrión, puede hacer clic en el mic de cualquier miniatura para silenciarlo o prenderlo
  micIndicator.onclick = () => {
    if (state.isHost) {
      const peer = callState.peers.get(socketId);
      const willEnable = peer ? Boolean(peer.isAudioMuted) : true;
      window.setUserAudio(socketId, willEnable);
    }
  };

  return { tileEl, videoEl, audioEl, avatarEl, micIndicator };
}

function createPeerConnection(targetSocketId, targetUserName, isInitiator) {
  if (callState.peers.has(targetSocketId)) {
    const existing = callState.peers.get(targetSocketId);
    if (existing.pc && existing.pc.connectionState !== 'closed' && existing.pc.connectionState !== 'failed') {
      return existing.pc;
    }
    if (existing.pc) existing.pc.close();
    if (existing.tileEl && existing.tileEl.parentNode) existing.tileEl.parentNode.removeChild(existing.tileEl);
    callState.peers.delete(targetSocketId);
  }

  const pc = new RTCPeerConnection(callState.rtcConfig);

  if (callState.localStream) {
    callState.localStream.getTracks().forEach(track => {
      try {
        pc.addTrack(track, callState.localStream);
      } catch (e) {}
    });
  }

  const isMando = Boolean(targetUserName && targetUserName.includes('(Mando)'));

  const { tileEl, videoEl, audioEl, avatarEl, micIndicator } = isMando
    ? { tileEl: null, videoEl: null, audioEl: null, avatarEl: null, micIndicator: null }
    : createParticipantTile(targetSocketId, targetUserName);

  const peerData = {
    pc,
    userName: targetUserName,
    tileEl,
    videoEl,
    audioEl,
    avatarEl,
    micIndicator,
    isAudioMuted: false,
    pendingCandidates: [],
    remoteStream: new MediaStream()
  };

  callState.peers.set(targetSocketId, peerData);

  pc.ontrack = (event) => {
    peerData.remoteStream.addTrack(event.track);

    if (isMando) return;

    if (event.track.kind === 'video' && videoEl) {
      videoEl.srcObject = peerData.remoteStream;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.setAttribute('playsinline', 'true');
      videoEl.setAttribute('webkit-playsinline', 'true');
      videoEl.play().catch(e => console.log('Remote video play err', e));
      if (avatarEl) avatarEl.style.display = 'none';
      videoEl.style.display = 'block';
    } else if (event.track.kind === 'audio' && audioEl) {
      audioEl.srcObject = peerData.remoteStream;
      audioEl.play().catch(e => console.log('Remote audio play err', e));
    }
  };

  pc.onicecandidate = (event) => {
    if (event.candidate && state.socket && state.socket.connected) {
      state.socket.emit('webrtc-ice-candidate', {
        targetSocketId,
        candidate: event.candidate
      });
    }
  };

  if (isInitiator) {
    pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    }).then(offer => pc.setLocalDescription(offer)).then(() => {
      state.socket.emit('webrtc-offer', {
        targetSocketId,
        offer: pc.localDescription
      });
    }).catch(err => console.error(err));
  }

  if (state.isHost) {
    renderFamilyMicsList();
  }

  return pc;
}

function setupWebRTCSocketListeners() {
  if (!state.socket) return;

  state.socket.on('call-joined', ({ existingUsers }) => {
    existingUsers.forEach(u => {
      if (u.userName && u.userName.includes('(Mando)')) return;
      createPeerConnection(u.socketId, u.userName, true);
    });
  });

  state.socket.on('user-joined-call', ({ socketId, userName }) => {
    if (userName && userName.includes('(Mando)')) return;
    createPeerConnection(socketId, userName, false);
  });

  state.socket.on('webrtc-offer', async ({ senderSocketId, senderName, offer }) => {
    const pc = createPeerConnection(senderSocketId, senderName, false);
    const peer = callState.peers.get(senderSocketId);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      // Drenar candidatos que llegaron antes del remoteDescription
      if (peer && peer.pendingCandidates && peer.pendingCandidates.length > 0) {
        for (const cand of peer.pendingCandidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {}
        }
        peer.pendingCandidates = [];
      }
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      state.socket.emit('webrtc-answer', {
        targetSocketId: senderSocketId,
        answer
      });
    } catch (err) {
      console.error(err);
    }
  });

  state.socket.on('webrtc-answer', async ({ senderSocketId, answer }) => {
    const peer = callState.peers.get(senderSocketId);
    if (peer && peer.pc) {
      try {
        await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
        if (peer.pendingCandidates && peer.pendingCandidates.length > 0) {
          for (const cand of peer.pendingCandidates) {
            try {
              await peer.pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {}
          }
          peer.pendingCandidates = [];
        }
      } catch (err) {
        console.error(err);
      }
    }
  });

  state.socket.on('webrtc-ice-candidate', async ({ senderSocketId, candidate }) => {
    const peer = callState.peers.get(senderSocketId);
    if (!peer || !peer.pc || !candidate) return;
    try {
      if (!peer.pc.remoteDescription || !peer.pc.remoteDescription.type) {
        peer.pendingCandidates = peer.pendingCandidates || [];
        peer.pendingCandidates.push(candidate);
      } else {
        await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error(err);
    }
  });

  state.socket.on('user-left-call', ({ socketId }) => {
    const peer = callState.peers.get(socketId);
    if (peer) {
      if (peer.pc) peer.pc.close();
      if (peer.tileEl && peer.tileEl.parentNode) {
        peer.tileEl.parentNode.removeChild(peer.tileEl);
      }
      callState.peers.delete(socketId);
    }
    if (state.isHost) {
      renderFamilyMicsList();
    }
  });
}

// Controles de Micrófono y Cámara
window.toggleAudio = function() {
  if (!callState.localStream) return;
  const audioTracks = callState.localStream.getAudioTracks();
  if (audioTracks.length > 0) {
    callState.isAudioMuted = !callState.isAudioMuted;
    audioTracks.forEach(t => { t.enabled = !callState.isAudioMuted; });
    updateCallControlsUI();
    updateLocalTileMicUI();

    if (state.socket && state.socket.connected) {
      state.socket.emit('call-media-state', {
        isAudioMuted: callState.isAudioMuted,
        isVideoOff: callState.isVideoOff
      });
    }
  }
};

window.toggleVideo = function() {
  if (!callState.localStream) return;
  const videoTracks = callState.localStream.getVideoTracks();
  if (videoTracks.length > 0) {
    callState.isVideoOff = !callState.isVideoOff;
    videoTracks.forEach(t => { t.enabled = !callState.isVideoOff; });
  } else {
    callState.isVideoOff = !callState.isVideoOff;
  }

  const localVideo = document.getElementById('local-video');
  const localAvatar = document.getElementById('local-avatar');

  if (callState.isVideoOff) {
    if (localAvatar) localAvatar.style.display = 'flex';
    if (localVideo) localVideo.style.display = 'none';
  } else {
    if (localAvatar) localAvatar.style.display = 'none';
    if (localVideo) localVideo.style.display = 'block';
  }

  if (state.socket && state.socket.connected) {
    state.socket.emit('call-media-state', {
      isAudioMuted: callState.isAudioMuted,
      isVideoOff: callState.isVideoOff
    });
  }
};

// Alternar entre vista de cámaras grande y compacta
window.toggleCameraLayout = function() {
  const strip = document.getElementById('family-cameras-strip');
  if (strip) {
    strip.classList.toggle('expanded-grid');
    const isExpanded = strip.classList.contains('expanded-grid');
    showToast(isExpanded ? 'Cámaras ampliadas' : 'Vista compacta de rezo', isExpanded ? 'video' : 'book');
  }
};

function updateCallControlsUI() {
  const famMicBtn = document.getElementById('btn-family-mic');
  const famMicIcon = document.getElementById('family-mic-icon');
  const famMicText = document.getElementById('family-mic-text');

  if (famMicBtn && famMicIcon && famMicText) {
    const isSpeaker = state.isSpeaker || (state.socket && state.socket.id === state.speakerSocketId);

    if (callState.isAudioMuted) {
      famMicBtn.className = 'listener-mic-action listener-mic-muted';
      famMicIcon.innerHTML = icon('mic-off', { size: 18 });
      famMicText.textContent = isSpeaker 
        ? 'Voz de Orador en SILENCIO (Toca para hablar)' 
        : 'Mi voz en SILENCIO (Toca para responder)';
    } else {
      famMicBtn.className = 'listener-mic-action listener-mic-open';
      famMicIcon.innerHTML = icon('mic', { size: 18 });
      famMicText.innerHTML = isSpeaker 
        ? `<span style="display:inline-flex; align-items:center; gap:0.25rem;">${icon('speaker', { size: 13 })} Voz de Orador: ABIERTA (Leyendo)</span>` 
        : 'Mi voz: ABIERTA (Respondiendo a coro)';
    }
  }
}

function updateLocalTileMicUI() {
  const badge = document.getElementById('local-tile-mic-badge');
  if (badge) {
    badge.innerHTML = callState.isAudioMuted ? icon('mic-off', { size: 12 }) : icon('mic', { size: 12 });
    badge.classList.toggle('muted', callState.isAudioMuted);
  }
}

function updatePeerTileMicUI(socketId, isMuted) {
  const badge = document.getElementById(`tile-mic-${socketId}`);
  if (badge) {
    badge.innerHTML = isMuted ? icon('mic-off', { size: 12 }) : icon('mic', { size: 12 });
    badge.classList.toggle('muted', isMuted);
  }
}

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

// Tamaño de fuente
window.cycleFontSize = function() {
  state.fontScaleIndex = (state.fontScaleIndex + 1) % state.fontScales.length;
  const scale = state.fontScales[state.fontScaleIndex];
  document.documentElement.style.setProperty('--font-scale', scale);
  const btn = document.getElementById('btn-font-size');
  if (btn) {
    const labels = ['A', 'A+', 'A++'];
    btn.textContent = labels[state.fontScaleIndex];
  }
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
  replaceDomIcons();
  renderCurrentStep();
  initRealtimeSync();

  // Carga inmediata de estado actual por HTTP (0ms)
  syncFromHttpState();
  setInterval(syncFromHttpState, 2500);

  const savedName = localStorage.getItem('novena-user-name');
  const nameField = document.getElementById('welcome-name-input');
  if (savedName && nameField) {
    nameField.value = savedName;
  }
}

function startApp() {
  init();
  setupWebRTCSocketListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
