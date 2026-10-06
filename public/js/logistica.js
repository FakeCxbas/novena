// logistica.js - Consola de Mando para el Anfitrión / Director de Logística
import { NOVENA_DATA } from '/js/novena-data.js?v=8.0';
import { icon, replaceDomIcons } from '/js/icons.js?v=8.0';

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

// Estado local reactivo de la consola
const state = {
  socket: null,
  isUnlocked: false,
  hostName: localStorage.getItem('novena-host-name') || 'Anfitrión',
  currentDay: getAutoNovenaDay(),
  currentStepIndex: 0,
  currentAveMaria: 0,
  activeMysteryType: null,
  speakerSocketId: null,
  speakerName: 'Esperando Orador',
  participants: [],
  activeTab: 'rezo', // 'rezo', 'tools'
  steps: []
};

// Generador de misterio del día según tradición católica
function getMysteryByDay(dayIndex) {
  const mapping = {
    0: 'gloriosos', // Domingo
    1: 'gozosos',   // Lunes
    2: 'dolorosos', // Martes
    3: 'gloriosos', // Miércoles
    4: 'luminosos', // Jueves
    5: 'dolorosos', // Viernes
    6: 'gozosos'    // Sábado
  };
  const key = mapping[dayIndex % 7];
  return NOVENA_DATA.rosario.misterios[key];
}

// Construir lista de los 24 pasos canónicos de la Novena y Santo Rosario (Pantalla Única)
function buildSteps(diaNum, mysteryType) {
  const dayData = NOVENA_DATA.dias.find(d => d.dia === diaNum) || NOVENA_DATA.dias[0];
  const mType = mysteryType || dayData.tipoMisterio || getMysteryByDay(new Date().getDay());
  const mysteryObj = NOVENA_DATA.rosario.misterios[mType] || NOVENA_DATA.rosario.misterios.dolorosos;

  const fullPrayer = dayData.oracionFamiliar || '';
  const paragraphs = fullPrayer.split('\n\n').filter(Boolean);
  const p1 = paragraphs[0] || fullPrayer;
  const p2 = paragraphs.slice(1).join(' ') || fullPrayer;

  return [
    {
      id: 'cruz',
      badge: '1. Ritos Iniciales',
      title: 'I. Señal de la Santa Cruz',
      role: 'chorus',
      preview: 'Por la señal de la Santa Cruz, de nuestros enemigos, líbranos, Señor...'
    },
    {
      id: 'contricion',
      badge: '1. Ritos Iniciales',
      title: 'II. Acto de Contrición',
      role: 'chorus',
      preview: 'Señor mío Jesucristo, Dios y Hombre verdadero, Creador, Padre y Redentor mío...'
    },
    {
      id: 'intencion',
      badge: dayData.dia === 5 ? '2. Intención (Quinto Día)' : `2. Intención (Día ${dayData.dia})`,
      title: dayData.dia === 5 ? 'Intención del Quinto Día por la Mami Olguita' : `Intención del Día ${dayData.dia}`,
      role: 'orador',
      preview: dayData.intencion ? dayData.intencion.slice(0, 140) + '...' : 'Padre Misericordioso, nos reunimos en este día para ofrecerte este Santo Rosario...'
    },
    {
      id: 'credo',
      badge: '2. Profesión de Fe',
      title: 'El Credo de los Apóstoles',
      role: 'chorus',
      preview: 'Creo en Dios, Padre Todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo...'
    },
    ...mysteryObj.lista.flatMap((mItem, idx) => {
      const mTitulo = typeof mItem === 'string' ? mItem : mItem.titulo;
      const mMeditacion = typeof mItem === 'object' && mItem.meditacion ? mItem.meditacion : '';
      return [
        {
          id: `misterio-${idx + 1}`,
          badge: `${mysteryObj.nombre} (${idx + 1}/5) • Meditación`,
          title: `${idx + 1}º Misterio: ${mTitulo}`,
          role: 'orador',
          preview: mMeditacion ? `Meditación: "${mMeditacion.slice(0, 100)}..."` : 'Contemplamos este misterio ofreciéndolo por el descanso eterno de la mami Olguita.'
        },
        {
          id: `misterio-${idx + 1}-rosario`,
          badge: `${mysteryObj.nombre} (${idx + 1}/5) • Rezo y Jaculatoria`,
          title: `${idx + 1}º Misterio: Decenario y Jaculatoria`,
          role: 'rosario',
          preview: '10 Avemarías interactivas con cuentas táctiles y Jaculatoria tradicional: "Si por tu preciosa sangre..."'
        }
      ];
    }),
    {
      id: 'cuentas-fe',
      badge: '3. Oraciones Finales (1/3)',
      title: '1ª Ave María por su Pureza • Por la Fe',
      role: 'chorus',
      preview: 'Guía: Dios te salve, María Santísima, Hija de Dios Padre... en tus manos encomendamos nuestra fe y el alma de la mami Olguita.'
    },
    {
      id: 'cuentas-esperanza',
      badge: '3. Oraciones Finales (2/3)',
      title: '2ª Ave María por su Pureza • Por la Esperanza',
      role: 'chorus',
      preview: 'Guía: Dios te salve, María Santísima, Madre de Dios Hijo... en tus manos encomendamos nuestra esperanza y el descanso eterno de la mami Olguita.'
    },
    {
      id: 'cuentas-caridad',
      badge: '3. Oraciones Finales (3/3)',
      title: '3ª Ave María por su Pureza • Por la Caridad y Unión',
      role: 'chorus',
      preview: 'Guía: Dios te salve, María Santísima, Esposa del Espíritu Santo... en tus manos encomendamos nuestra caridad y la unión inquebrantable de nuestra familia.'
    },
    {
      id: 'la-salve',
      badge: '3. Oraciones Finales',
      title: 'La Salve a la Santísima Virgen María',
      role: 'chorus',
      preview: NOVENA_DATA.rosario.salve.guia.slice(0, 130) + '...'
    },
    {
      id: 'letanias-1',
      badge: '3. Oraciones Finales • Letanías (1/3)',
      title: 'Letanías: Invocaciones y Santa María',
      role: 'chorus',
      preview: 'Invocaciones a la Santísima Trinidad y Santa María. Respondemos: "Ruega por la mami Olguita"'
    },
    {
      id: 'letanias-2',
      badge: '3. Oraciones Finales • Letanías (2/3)',
      title: 'Letanías: Títulos de la Santísima Virgen',
      role: 'chorus',
      preview: 'Títulos y virtudes marianas (Madre del Salvador, Rosa mística, Salud de los enfermos...). Respondemos: "Ruega por la mami Olguita"'
    },
    {
      id: 'letanias-3',
      badge: '3. Oraciones Finales • Letanías (3/3)',
      title: 'Letanías: Reina Celestial y Cordero de Dios',
      role: 'chorus',
      preview: 'Reina de los Ángeles, de las Familias y Cordero de Dios. Respondemos: "Ruega por la mami Olguita"'
    },
    {
      id: 'oracion-reconciliacion-1',
      badge: '4. Oración Familiar (1/2)',
      title: '🤍 Oración Familiar: Conciencia y Perdón',
      role: 'orador',
      preview: p1.slice(0, 140) + '...'
    },
    {
      id: 'oracion-reconciliacion-2',
      badge: '4. Oración Familiar (2/2)',
      title: '🤍 Oración Familiar: Unión y Sanación',
      role: 'orador',
      preview: p2.slice(0, 140) + '...'
    },
    {
      id: 'despedida-homenaje',
      badge: '5. Cierre y Homenaje',
      title: 'Despedida, Bendición y Homenaje Conmemorativo',
      role: 'chorus',
      preview: 'El Señor nos bendiga y nos guarde de todo mal... Homenaje conmemorativo de fotos.'
    }
  ];
}

// Retroalimentación Háptica
function haptic(ms = 30) {
  if (navigator.vibrate) {
    try { navigator.vibrate(ms); } catch (e) {}
  }
}

// Notificación Flotante con Icono SVG
function showToast(text, iconName = null) {
  const existing = document.querySelector('.toast-box');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-box';
  if (iconName) {
    toast.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.4rem;">${icon(iconName, { size: 16 })} ${text}</span>`;
  } else {
    toast.textContent = text;
  }
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 2800);
}

// -------------------------------------------------------------
// CARGA INMEDIATA VÍA HTTP (Polling Fallback y Carga Instantánea)
// -------------------------------------------------------------

async function fetchState() {
  try {
    const res = await fetch('/api/state?t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data.participants && Array.isArray(data.participants)) {
        state.participants = data.participants;
        renderRoster();
        updateConnectedCountBadge();
      }

      // Evitar sobreescritura accidental si el anfitrión pulsó un botón hace menos de 3.5 segundos
      const isRecentLocalAction = state.lastLocalStepAction && (Date.now() - state.lastLocalStepAction < 3500);

      if (!isRecentLocalAction) {
        if (data.currentDay !== undefined && data.currentDay !== state.currentDay) {
          state.currentDay = data.currentDay;
        }
        if (data.currentStepIndex !== undefined && data.currentStepIndex !== state.currentStepIndex) {
          state.currentStepIndex = data.currentStepIndex;
        }
        if (data.currentAveMaria !== undefined) state.currentAveMaria = data.currentAveMaria;
      }

      if (data.selectedMystery) state.activeMysteryType = data.selectedMystery;
      if (data.speakerName) {
        state.speakerSocketId = data.speakerSocketId;
        state.speakerName = data.speakerName;
      }
      updateAllViews();
    }
  } catch (err) {
    console.warn('Error fetching /api/state:', err);
  }
}

// -------------------------------------------------------------
// INICIALIZACIÓN DE SOCKET.IO
// -------------------------------------------------------------

// Fallback polling inteligente: Solo se activa si los WebSockets se desconectan
let fallbackPollInterval = null;
function startFallbackPolling() {
  if (!fallbackPollInterval) {
    fallbackPollInterval = setInterval(fetchState, 3500);
  }
}
function stopFallbackPolling() {
  if (fallbackPollInterval) {
    clearInterval(fallbackPollInterval);
    fallbackPollInterval = null;
  }
}

function initSocket() {
  if (typeof io === 'undefined') {
    console.error('Socket.io library not loaded');
    startFallbackPolling();
    return;
  }

  state.socket = io({
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    timeout: 10000
  });

  state.socket.on('connect', () => {
    stopFallbackPolling();
    const statusText = document.getElementById('connection-status-text');
    if (statusText) statusText.textContent = 'En Vivo';

    const socketStatusEl = document.getElementById('telemetry-socket-status');
    if (socketStatusEl) {
      socketStatusEl.textContent = 'En Tiempo Real';
      socketStatusEl.style.color = '#22c55e';
    }

    // Auto-reclamar anfitrión si ya estaba desbloqueado
    const savedPin = localStorage.getItem('novena-host-pin');
    state.socket.emit('claim-host', { pin: savedPin || '1234', name: state.hostName, isLogistics: true });

    // La consola de logística es un control remoto puro
    state.socket.emit('get-participants');
  });

  state.socket.on('disconnect', () => {
    startFallbackPolling();
    const statusText = document.getElementById('connection-status-text');
    if (statusText) statusText.textContent = 'Reconectando...';

    const socketStatusEl = document.getElementById('telemetry-socket-status');
    if (socketStatusEl) {
      socketStatusEl.textContent = 'Reconectando (HTTP)';
      socketStatusEl.style.color = '#f59e0b';
    }
  });

  state.socket.on('state-update', (data) => {
    if (data.currentDay !== undefined) state.currentDay = data.currentDay;
    if (data.currentStepIndex !== undefined) state.currentStepIndex = data.currentStepIndex;
    if (data.selectedMystery) state.activeMysteryType = data.selectedMystery;
    if (data.currentAveMaria !== undefined) state.currentAveMaria = data.currentAveMaria;
    if (data.speakerName) {
      state.speakerSocketId = data.speakerSocketId;
      state.speakerName = data.speakerName;
    }
    updateAllViews();
  });

  state.socket.on('step-changed', (data) => {
    const isRecentLocalAction = state.lastLocalStepAction && (Date.now() - state.lastLocalStepAction < 1000);
    if (!isRecentLocalAction) {
      if (data.currentDay !== undefined) state.currentDay = data.currentDay;
      if (data.currentStepIndex !== undefined) state.currentStepIndex = data.currentStepIndex;
      if (data.selectedMystery) state.activeMysteryType = data.selectedMystery;
      if (data.currentAveMaria !== undefined) state.currentAveMaria = data.currentAveMaria;
      updateAllViews();
    }
  });

  state.socket.on('speaker-changed', ({ speakerSocketId, speakerName }) => {
    state.speakerSocketId = speakerSocketId;
    state.speakerName = speakerName || 'Esperando Orador';
    updateSpeakerUI();
    renderRoster();
  });

  state.socket.on('participants-list', (list) => {
    if (Array.isArray(list)) {
      state.participants = list;
      renderRoster();
      updateConnectedCountBadge();
    }
  });

  state.socket.on('user-count', (count) => {
    updateConnectedCountBadge();
  });

  state.socket.on('host-confirmed', () => {
    unlockConsole();
    showToast('Consola de Anfitrión Activada', 'crown');
  });
}

// -------------------------------------------------------------
// CONTROL DE NAVEGACIÓN Y DIAPOSITIVAS
// -------------------------------------------------------------

function broadcastStepUpdate() {
  state.lastLocalStepAction = Date.now();
  const payload = {
    currentDay: state.currentDay,
    currentStepIndex: state.currentStepIndex,
    selectedMystery: state.activeMysteryType,
    currentAveMaria: state.currentAveMaria
  };

  // 1. Canal WebSocket (ultra-rápido, ~5ms)
  if (state.socket && state.socket.connected) {
    state.socket.emit('update-step', payload);
  }

  // 2. Canal HTTP Dual Fallback (fiabilidad garantizada, ~50ms)
  fetch('/api/step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => console.warn('POST /api/step error:', err));

  updateAllViews();
}

window.nextStep = function() {
  haptic(40);
  if (state.currentStepIndex < state.steps.length - 1) {
    state.currentStepIndex++;
    state.currentAveMaria = 0;
    broadcastStepUpdate();
  }
};

window.prevStep = function() {
  haptic(40);
  if (state.currentStepIndex > 0) {
    state.currentStepIndex--;
    broadcastStepUpdate();
  }
};

window.selectDay = function(diaNum) {
  haptic(50);
  state.currentDay = diaNum;
  state.currentStepIndex = 0;
  state.currentAveMaria = 0;
  state.steps = buildSteps(state.currentDay, state.activeMysteryType);
  broadcastStepUpdate();
  showToast(`Día ${diaNum} seleccionado`, 'calendar');
};

window.jumpToStep = function(stepIdx) {
  haptic(40);
  state.currentStepIndex = stepIdx;
  state.currentAveMaria = 0;
  broadcastStepUpdate();
  closeJumpModal();
  showToast(`${state.steps[stepIdx].title}`, 'book');
};

window.jumpToStepId = function(stepId) {
  const sIdx = state.steps.findIndex(s => s.id === stepId);
  if (sIdx !== -1) {
    window.jumpToStep(sIdx);
  }
};

window.setAveMaria = function(count) {
  haptic(30);
  state.currentAveMaria = Math.min(10, Math.max(0, count));
  broadcastStepUpdate();
};

window.nextAveMaria = function() {
  haptic(35);
  if (state.currentAveMaria < 10) {
    state.currentAveMaria++;
    broadcastStepUpdate();
  } else {
    showToast('10 Ave Marías completadas en este misterio', 'check');
  }
};

window.prevAveMaria = function() {
  haptic(30);
  if (state.currentAveMaria > 0) {
    state.currentAveMaria--;
    broadcastStepUpdate();
  }
};

window.completeMystery = function() {
  haptic(45);
  window.setAveMaria(10);
  showToast('10 Ave Marías completadas en este misterio', 'check');
};

window.resetBeads = function() {
  haptic(30);
  window.setAveMaria(0);
  showToast('Contador de Ave Marías reiniciado a 0', 'refresh');
};

// Selector manual de Tipo de Misterio
window.setMysteryType = function(type) {
  haptic(35);
  state.activeMysteryType = type === 'auto' ? null : type;
  document.querySelectorAll('.mystery-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mystery === type);
  });
  state.steps = buildSteps(state.currentDay, state.activeMysteryType);
  broadcastStepUpdate();
  showToast(`Misterios: ${type.toUpperCase()}`, 'rosary');
};

// -------------------------------------------------------------
// DESIGNACIÓN DE ORADOR & MODAL DE FAMILIARES
// -------------------------------------------------------------

window.openSpeakerModal = function() {
  haptic(30);
  const modal = document.getElementById('speaker-modal-overlay');
  if (modal) {
    modal.classList.add('open');
    renderRoster();
  }
};

window.closeSpeakerModal = function() {
  const modal = document.getElementById('speaker-modal-overlay');
  if (modal) modal.classList.remove('open');
};

window.designateSpeaker = function(targetSocketId, userName) {
  haptic(60);
  if (state.socket && state.socket.connected) {
    state.socket.emit('set-speaker', {
      socketId: targetSocketId,
      speakerName: userName
    });
  }
  fetch('/api/speaker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ socketId: targetSocketId, speakerName: userName })
  }).catch(() => {});

  showToast(`${userName} designado como Orador`, 'speaker');

  state.speakerSocketId = targetSocketId;
  state.speakerName = userName;
  updateSpeakerUI();
  renderRoster();
  window.closeSpeakerModal();
};

// -------------------------------------------------------------
// RENDERIZADO VISUAL
// -------------------------------------------------------------

function updateAllViews() {
  state.steps = buildSteps(state.currentDay, state.activeMysteryType);
  renderCurrentSlide();
  renderDaysStrip();
  updateSpeakerUI();
  updateNavButtons();
  updateConnectedCountBadge();
  replaceDomIcons();
}

function renderCurrentSlide() {
  const currentStep = state.steps[state.currentStepIndex] || state.steps[0];
  
  const dayBadge = document.getElementById('slide-day-badge');
  const indexBadge = document.getElementById('slide-step-badge');
  const titleEl = document.getElementById('slide-title-el');
  const roleEl = document.getElementById('slide-role-guidance');
  const previewEl = document.getElementById('slide-preview-text');
  const rosarioCard = document.getElementById('rosario-counter-container');

  if (dayBadge) dayBadge.textContent = `Día ${state.currentDay} de la Novena`;
  if (indexBadge) indexBadge.textContent = `Paso ${state.currentStepIndex + 1} de ${state.steps.length}`;
  if (titleEl) titleEl.textContent = currentStep.title;
  if (previewEl) previewEl.textContent = currentStep.preview;

  if (roleEl) {
    if (currentStep.role === 'orador') {
      roleEl.className = 'slide-role-guidance orador-reads';
      roleEl.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.35rem;">${icon('speaker', { size: 14 })} Lee el Orador (${state.speakerName}) solo</span>`;
    } else if (currentStep.role === 'chorus') {
      roleEl.className = 'slide-role-guidance chorus-reads';
      roleEl.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.35rem;">${icon('users', { size: 14 })} Todos responden a coro (Abre micrófonos)</span>`;
    } else {
      roleEl.className = 'slide-role-guidance orador-reads';
      roleEl.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.35rem;">${icon('rosary', { size: 14 })} Rezo del Santo Rosario (Guía y Coro)</span>`;
    }
  }

  // Mostrar tarjeta de Rosario solo en pasos de misterios
  if (rosarioCard) {
    if (currentStep.role === 'rosario') {
      rosarioCard.style.display = 'block';
      renderRosarioCounter();
    } else {
      rosarioCard.style.display = 'none';
    }
  }
}

function renderRosarioCounter() {
  const container = document.getElementById('beads-grid-container');
  const countLabel = document.getElementById('ave-maria-count-label');
  if (countLabel) countLabel.textContent = `${state.currentAveMaria}/10`;

  if (container) {
    container.innerHTML = Array.from({ length: 10 }).map((_, idx) => {
      const isCompleted = idx < state.currentAveMaria;
      const isCurrent = idx === state.currentAveMaria - 1;
      return `
        <div class="bead-bubble ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}"
             onclick="window.setAveMaria(${idx + 1})">
          ${idx + 1}
        </div>
      `;
    }).join('');
  }
}

function updateSpeakerUI() {
  const nameEl = document.getElementById('speaker-master-name');
  if (nameEl) nameEl.textContent = state.speakerName;
}

function renderDaysStrip() {
  const container = document.getElementById('quick-days-strip');
  if (!container) return;

  const autoDay = getAutoNovenaDay();
  container.innerHTML = Array.from({ length: 9 }).map((_, idx) => {
    const day = idx + 1;
    const isActive = day === state.currentDay;
    const isToday = day === autoDay;
    return `
      <div class="day-badge-btn ${isActive ? 'active' : ''}" onclick="window.selectDay(${day})" title="${isToday ? 'Día de hoy (' + day + ')' : 'Día ' + day}">
        <span>${day}</span>
        ${isToday ? '<span style="font-size:0.55rem; line-height:1; font-weight:700; opacity:0.85; text-transform:uppercase;">Hoy</span>' : ''}
      </div>
    `;
  }).join('');
}

// Filtrar la lista para mostrar ÚNICAMENTE a los familiares que rezan (excluyendo el propio teléfono de mando)
function getFamilyParticipants() {
  return state.participants.filter(user => {
    if (user.isLogistics) return false;
    if (state.socket && user.socketId === state.socket.id) return false;
    if (user.userName && user.userName.includes('(Mando)')) return false;
    return true;
  });
}

function renderRoster() {
  const container = document.getElementById('roster-cards-container');
  if (!container) return;

  const familyList = getFamilyParticipants();
  if (!familyList || familyList.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 0.88rem; padding: 2rem 1rem; line-height: 1.6;">
        <div style="margin-bottom: 0.6rem; display: flex; justify-content: center;">
          ${icon('users', { size: 36, color: '#DFB15B' })}
        </div>
        <strong style="color: var(--gold-light);">Esperando que los familiares se conecten</strong><br>
        <span style="font-size: 0.8rem;">Cuando tus familiares entren al rezo desde sus celulares, aparecerán aquí para que puedas nombrarlos como Orador.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = familyList.map(user => {
    const isSpeaker = user.socketId === state.speakerSocketId;
    const displayName = user.userName || 'Familiar';
    const initials = displayName.slice(0, 2).toUpperCase();

    return `
      <div class="participant-control-card ${isSpeaker ? 'is-speaker-role' : ''}" 
           style="cursor: pointer; padding: 0.75rem 0.85rem;" 
           onclick="window.designateSpeaker('${user.socketId}', '${displayName}')">
        <div class="participant-card-left">
          <div class="participant-avatar-badge" style="position:relative;">
            ${initials}
          </div>
          <div class="participant-meta-info">
            <span class="participant-name-text">${displayName}</span>
            <span class="participant-role-pill ${isSpeaker ? 'speaker' : ''}">
              ${isSpeaker ? `<span style="display:inline-flex; align-items:center; gap:0.25rem;">${icon('speaker', { size: 11 })} Orador Actual</span>` : `<span style="display:inline-flex; align-items:center; gap:0.25rem;">${icon('user', { size: 11 })} En línea</span>`}
            </span>
          </div>
        </div>

        <div class="participant-card-actions">
          <button class="btn-assign-speaker ${isSpeaker ? 'active' : ''}" 
                  onclick="event.stopPropagation(); window.designateSpeaker('${user.socketId}', '${displayName}')"
                  title="Nombrar orador"
                  style="display:inline-flex; align-items:center; justify-content:center; gap:0.25rem;">
            ${isSpeaker ? `${icon('star', { size: 13 })} Orador` : `${icon('crown', { size: 13 })} Nombrar`}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function updateNavButtons() {
  const btnPrev = document.getElementById('btn-nav-prev');
  const btnNext = document.getElementById('btn-nav-next');
  if (btnPrev) btnPrev.disabled = state.currentStepIndex <= 0;
  if (btnNext) btnNext.disabled = state.currentStepIndex >= state.steps.length - 1;
}

function updateConnectedCountBadge() {
  const familyList = getFamilyParticipants();
  const count = familyList.length;

  // 1. Header user count
  const headerCount = document.getElementById('header-user-count');
  if (headerCount) {
    headerCount.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.25rem;">${icon('users', { size: 13 })} ${count} familiar${count === 1 ? '' : 'es'}</span>`;
  }

  // 2. Quick family bar en la pestaña principal
  const quickCount = document.getElementById('quick-family-count');
  const quickNames = document.getElementById('quick-family-names');
  if (quickCount) quickCount.textContent = `${count}`;
  if (quickNames) {
    if (count > 0) {
      const names = familyList.map(p => p.userName || 'Familiar').join(', ');
      quickNames.textContent = names;
    } else {
      quickNames.textContent = 'Esperando que entren los familiares...';
    }
  }

  const rosterCount = document.getElementById('roster-total-count');
  if (rosterCount) {
    rosterCount.textContent = `${count} familiar${count === 1 ? '' : 'es'}`;
  }
}

// -------------------------------------------------------------
// NAVEGACIÓN POR PESTAÑAS (Tabs)
// -------------------------------------------------------------

window.switchTab = function(tabName) {
  haptic(20);
  state.activeTab = tabName;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-panel-${tabName}`);
  });
};

// -------------------------------------------------------------
// MODAL DE SALTO RÁPIDO
// -------------------------------------------------------------

window.openJumpModal = function() {
  haptic(30);
  const modal = document.getElementById('jump-modal-overlay');
  const container = document.getElementById('jump-steps-container');
  if (!modal || !container) return;

  container.innerHTML = state.steps.map((step, idx) => `
    <div class="jump-step-row ${idx === state.currentStepIndex ? 'active' : ''}" onclick="window.jumpToStep(${idx})">
      <span>${idx + 1}. ${step.title}</span>
      <span style="font-size: 0.72rem; color: var(--gold-amber);">${step.badge}</span>
    </div>
  `).join('');

  modal.classList.add('open');
};

window.closeJumpModal = function() {
  const modal = document.getElementById('jump-modal-overlay');
  if (modal) modal.classList.remove('open');
};

// -------------------------------------------------------------
// CONTROL DE PIN Y AUTENTICACIÓN
// -------------------------------------------------------------

function unlockConsole() {
  state.isUnlocked = true;
  const gate = document.getElementById('pin-gate-screen');
  if (gate) gate.style.display = 'none';

  if (!state.steps || state.steps.length === 0) {
    state.steps = buildSteps(state.currentDay, state.activeMysteryType);
  }
  updateAllViews();
  fetchState();
  if (!state.socket) {
    initSocket();
  }
}

window.submitConsolePin = function() {
  const pinInput = document.getElementById('console-pin-input');
  const pin = pinInput ? pinInput.value.trim() : '';

  if (pin === '1234') {
    haptic([40, 40]);
    localStorage.setItem('novena-host-pin', '1234');
    localStorage.setItem('novena-is-host', 'true');
    unlockConsole();
    if (state.socket && state.socket.connected) {
      state.socket.emit('claim-host', { pin: '1234', name: state.hostName });
    }
  } else {
    haptic(150);
    alert('PIN de logística incorrecto (El PIN es 1234)');
  }
};

// -------------------------------------------------------------
// HERRAMIENTAS DE LOGÍSTICA: CRONÓMETRO, WHATSAPP Y TELEMETRÍA
// -------------------------------------------------------------

let timerSeconds = 0;
let timerRunning = true;
let timerInterval = null;

function initStopwatch() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timerRunning) {
      timerSeconds++;
      updateStopwatchUI();
    }
  }, 1000);
}

function updateStopwatchUI() {
  const el = document.getElementById('session-stopwatch');
  if (!el) return;
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

window.toggleSessionTimer = function() {
  haptic(25);
  timerRunning = !timerRunning;
  const btn = document.getElementById('btn-timer-toggle');
  const badge = document.getElementById('timer-status-badge');
  if (btn) btn.innerHTML = timerRunning ? `<i data-icon="refresh" data-size="14"></i> Pausar` : `<i data-icon="refresh" data-size="14"></i> Continuar`;
  if (badge) badge.textContent = timerRunning ? 'En Curso' : 'Pausado';
  replaceDomIcons();
};

window.resetSessionTimer = function() {
  haptic(30);
  timerSeconds = 0;
  updateStopwatchUI();
  showToast('Cronómetro reiniciado a 00:00', 'refresh');
};

window.shareWhatsApp = function() {
  haptic(35);
  const text = encodeURIComponent(`🕊️ Familia, los invitamos a unirse a la Novena por el Eterno Descanso de Mami Olguita.\n\nEntren a rezar con nosotros aquí:\n${window.location.origin}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
};

window.copyRoomLink = function() {
  haptic(40);
  const url = window.location.origin;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Enlace copiado al portapapeles', 'check');
    }).catch(() => {
      showToast(`Enlace: ${url}`);
    });
  } else {
    showToast(`Enlace: ${url}`);
  }
};

window.lockConsole = function() {
  haptic([50, 50]);
  localStorage.removeItem('novena-host-pin');
  localStorage.removeItem('novena-is-host');
  location.reload();
};

// Medición periódica de latencia (Ping en ms)
async function measurePing() {
  try {
    const t0 = performance.now();
    const res = await fetch('/api/ping?t=' + Date.now());
    if (res.ok) {
      const ping = Math.round(performance.now() - t0);
      const el = document.getElementById('ping-ms-text');
      const container = document.getElementById('telemetry-ping-val');
      if (el) el.textContent = `${ping} ms`;
      if (container) {
        container.className = 'telemetry-stat-val ' + (ping < 120 ? 'latency-indicator-good' : ping < 300 ? 'latency-indicator-fair' : 'latency-indicator-poor');
      }
    }
  } catch(e) {}
}

// -------------------------------------------------------------
// CONTROL DE PROYECCIÓN DE DESPEDIDA CONMEMORATIVA (46 FOTOGRAFÍAS)
// -------------------------------------------------------------
window.triggerTributeProjection = function(start) {
  if (start) {
    if (state.socket && state.socket.connected) {
      state.socket.emit('start-tribute-projection', { intervalMs: 5500 });
    } else {
      fetch('/api/tribute/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: state.hostName || 'Logística', intervalMs: 5500 })
      });
    }
  } else {
    if (state.socket && state.socket.connected) {
      state.socket.emit('stop-tribute-projection');
    } else {
      fetch('/api/tribute/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// -------------------------------------------------------------
// ARRANQUE ROBUSTO
// -------------------------------------------------------------

function startApp() {
  const savedPin = localStorage.getItem('novena-host-pin');
  const isHost = localStorage.getItem('novena-is-host');
  if (savedPin === '1234' || isHost === 'true') {
    unlockConsole();
  }

  state.steps = buildSteps(state.currentDay, state.activeMysteryType);
  updateAllViews();

  // 1. Carga inicial inmediata por HTTP (0ms)
  fetchState();

  // 2. Conexión de sockets en tiempo real (maneja sincronización instantánea)
  initSocket();

  // 3. Iniciar cronómetro de sesión y telemetría de red
  initStopwatch();
  measurePing();
  setInterval(measurePing, 12000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
