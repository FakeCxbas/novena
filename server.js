const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const compression = require('compression');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

const PORT = process.env.PORT || 3005;
const HOST_PIN = process.env.HOST_PIN || '1234';

// Gzip / Deflate compression middleware (reduces network transfer by 75-80%)
app.use(compression({
  threshold: 512
}));

// Static files with smart caching and ETags enabled
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    }
  }
}));
app.use(express.json());

// Routes for logistics control app on phones
app.get(['/logistica', '/logistica/'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'logistica.html'));
});
app.get(['/control', '/control/'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'logistica.html'));
});

// Atajos amigables para compartir por WhatsApp
app.get(['/guia', '/guia/'], (req, res) => {
  res.redirect('/guia-lectores-dia-7.html');
});
app.get(['/folleto', '/folleto/'], (req, res) => {
  res.redirect('/dia-7-novena.html');
});
app.get(['/dia-7', '/dia7'], (req, res) => {
  res.redirect('/dia-7-novena.html');
});

// Fallback to serve assets under /logistica/ and /control/ in case of relative paths
app.use('/logistica', express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  maxAge: '1d'
}));
app.use('/control', express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  maxAge: '1d'
}));

// Cálculo automático del día de la Novena según fecha local (America/Guayaquil, UTC-5)
// Día 1: 30 de Septiembre de 2026
// Día 2: 1 de Octubre de 2026
// Día 3: 2 de Octubre de 2026 (HOY)
// Día 4: 3 de Octubre de 2026 (MAÑANA)... hasta Día 9
function getLocalDateStr(d = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(d); // YYYY-MM-DD
  } catch (err) {
    return new Date().toISOString().split('T')[0];
  }
}

function getAutoNovenaDay(d = new Date()) {
  try {
    const localDateStr = getLocalDateStr(d);
    const baseDate = new Date('2026-09-30T12:00:00Z'); // Día 1
    const currentDate = new Date(localDateStr + 'T12:00:00Z');
    const diffDays = Math.round((currentDate - baseDate) / (1000 * 60 * 60 * 24));
    const day = 1 + diffDays;
    return Math.min(Math.max(day, 1), 9);
  } catch (err) {
    return 3;
  }
}

// Persistent in-memory state of the active Novena
const novenaState = {
  currentDay: getAutoNovenaDay(),
  lastCalculatedDateStr: getLocalDateStr(),
  manualDayOverride: false,
  currentStepIndex: 0,
  selectedMystery: null, // null means auto by day of week
  currentAveMaria: 0,
  hostSocketId: null,
  hostName: null,
  speakerSocketId: null,
  speakerName: 'Esperando Orador',
  isTributeProjecting: false,
  lastUpdate: Date.now(),
  sessionStartTime: Date.now()
};

function checkDateRollOver() {
  const todayStr = getLocalDateStr();
  if (novenaState.lastCalculatedDateStr !== todayStr) {
    novenaState.lastCalculatedDateStr = todayStr;
    const newAutoDay = getAutoNovenaDay();
    console.log(`[Novena Auto-Día] Cambio de fecha detectado: ${todayStr}. Avanzando automáticamente al Día ${newAutoDay}`);
    novenaState.currentDay = newAutoDay;
    novenaState.currentStepIndex = 0;
    novenaState.currentAveMaria = 0;
    novenaState.manualDayOverride = false;
    io.emit('step-changed', {
      currentDay: novenaState.currentDay,
      currentStepIndex: novenaState.currentStepIndex,
      selectedMystery: novenaState.selectedMystery,
      currentAveMaria: novenaState.currentAveMaria,
      hostName: novenaState.hostName
    });
  }
}

function getParticipantsList() {
  const list = [];
  for (const [id, s] of io.sockets.sockets) {
    // Excluir consolas de mando / logística para que no figuren como familiar
    if (s.isLogistics || (s.userName && s.userName.includes('(Mando)'))) continue;

    list.push({
      socketId: id,
      userName: s.userName || (id === novenaState.hostSocketId ? (novenaState.hostName || 'Anfitrión') : 'Familiar'),
      isHost: Boolean(s.isHost || id === novenaState.hostSocketId),
      isSpeaker: id === novenaState.speakerSocketId
    });
  }
  return list;
}

// Debounced broadcast to avoid flood emissions when multiple sockets connect
let broadcastTimer = null;
function broadcastParticipantsList() {
  if (broadcastTimer) clearTimeout(broadcastTimer);
  broadcastTimer = setTimeout(() => {
    broadcastTimer = null;
    io.emit('participants-list', getParticipantsList());
  }, 35);
}

// Lightweight ping endpoint for measuring round-trip latency (rural connection quality)
app.get('/api/ping', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ pong: true, time: Date.now() });
});

// HTTP Endpoint for light polling fallback if WebSockets fail in rural 3G
app.get('/api/state', (req, res) => {
  checkDateRollOver();
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.json({
    ...novenaState,
    isHostActive: Boolean(novenaState.hostSocketId && io.sockets.sockets.get(novenaState.hostSocketId)),
    participants: getParticipantsList()
  });
});

// HTTP Endpoint para cambiar de paso desde logística con 100% de fiabilidad
app.post('/api/step', (req, res) => {
  const { currentDay, currentStepIndex, selectedMystery, currentAveMaria } = req.body;
  if (currentDay !== undefined) {
    novenaState.currentDay = Number(currentDay);
    novenaState.manualDayOverride = true;
  }
  if (currentStepIndex !== undefined) novenaState.currentStepIndex = Number(currentStepIndex);
  if (selectedMystery !== undefined) novenaState.selectedMystery = selectedMystery;
  if (currentAveMaria !== undefined) novenaState.currentAveMaria = Number(currentAveMaria);
  novenaState.lastUpdate = Date.now();

  io.emit('step-changed', {
    currentDay: novenaState.currentDay,
    currentStepIndex: novenaState.currentStepIndex,
    selectedMystery: novenaState.selectedMystery,
    currentAveMaria: novenaState.currentAveMaria,
    hostName: novenaState.hostName
  });

  console.log(`[Novena Sync HTTP] Día ${novenaState.currentDay} | Paso ${novenaState.currentStepIndex + 1} | Ave María ${novenaState.currentAveMaria}`);
  res.json({ success: true, ...novenaState });
});

app.post('/api/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (pin === HOST_PIN) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'PIN incorrecto' });
  }
});

// HTTP Endpoints para Proyección de Despedida
app.post('/api/tribute/start', (req, res) => {
  novenaState.isTributeProjecting = true;
  io.emit('tribute-projection-started', {
    startedBy: req.body.userName || 'Logística',
    intervalMs: req.body.intervalMs || 5500
  });
  console.log(`[Novena Tribute HTTP] Proyección iniciada por ${req.body.userName || 'Logística'}`);
  res.json({ success: true, isTributeProjecting: true });
});

app.post('/api/tribute/stop', (req, res) => {
  novenaState.isTributeProjecting = false;
  io.emit('tribute-projection-stopped');
  console.log(`[Novena Tribute HTTP] Proyección detenida`);
  res.json({ success: true, isTributeProjecting: false });
});

// HTTP Endpoint para nombrar orador
app.post('/api/speaker', (req, res) => {
  const { socketId, speakerName } = req.body;
  novenaState.speakerSocketId = socketId;
  novenaState.speakerName = speakerName || 'Orador';

  io.emit('speaker-changed', {
    speakerSocketId: novenaState.speakerSocketId,
    speakerName: novenaState.speakerName
  });
  broadcastParticipantsList();
  console.log(`[Novena Orador HTTP] Designado nuevo orador: ${speakerName} (${socketId})`);
  res.json({ success: true, ...novenaState });
});

// Socket.io Realtime Sync
io.on('connection', (socket) => {
  checkDateRollOver();
  console.log(`[Novena Socket] Cliente conectado: ${socket.id}`);

  // Send current state to newly joined client
  socket.emit('state-update', {
    ...novenaState,
    isHostActive: Boolean(novenaState.hostSocketId && io.sockets.sockets.get(novenaState.hostSocketId)),
    connectedUsers: io.engine.clientsCount
  });

  // Enviar lista de participantes actual
  socket.emit('participants-list', getParticipantsList());

  // Broadcast user count and participant list
  io.emit('user-count', io.engine.clientsCount);
  broadcastParticipantsList();

  socket.on('get-participants', () => {
    socket.emit('participants-list', getParticipantsList());
  });

  socket.on('set-name', ({ userName }) => {
    socket.userName = userName || 'Familiar';
    broadcastParticipantsList();
  });

  // Claim host role
  socket.on('claim-host', ({ pin, name, isLogistics }) => {
    if (pin === HOST_PIN || isLogistics) {
      novenaState.hostSocketId = socket.id;
      novenaState.hostName = name || 'Anfitrión';
      socket.isHost = true;
      socket.isLogistics = Boolean(isLogistics);
      if (socket.isLogistics) {
        socket.userName = `${novenaState.hostName} (Mando)`;
      }
      socket.emit('host-confirmed', { isHost: true });
      io.emit('host-status-changed', {
        isHostActive: true,
        hostName: novenaState.hostName
      });
      console.log(`[Novena Host] Anfitrión autenticado: ${novenaState.hostName} (${socket.id}) [Mando: ${socket.isLogistics}]`);
      broadcastParticipantsList();

    } else {
      socket.emit('host-error', { message: 'El PIN ingresado es incorrecto' });
    }
  });

  // Claim orador directly
  socket.on('claim-speaker', ({ name }) => {
    novenaState.speakerSocketId = socket.id;
    novenaState.speakerName = name || socket.userName || 'Orador';
    io.emit('speaker-changed', {
      speakerSocketId: novenaState.speakerSocketId,
      speakerName: novenaState.speakerName
    });
    broadcastParticipantsList();
  });

  // Designar Orador por el anfitrión
  socket.on('set-speaker', ({ socketId, speakerName }) => {
    console.log(`[Novena Orador] Designado nuevo orador: ${speakerName} (${socketId})`);
    novenaState.speakerSocketId = socketId;
    novenaState.speakerName = speakerName || 'Orador';

    io.emit('speaker-changed', {
      speakerSocketId: novenaState.speakerSocketId,
      speakerName: novenaState.speakerName
    });
    broadcastParticipantsList();
  });

  // Host navigation update (Sincronización instantánea a TODOS los clientes)
  socket.on('update-step', (data) => {
    if (data.currentDay !== undefined) {
      novenaState.currentDay = Number(data.currentDay);
      novenaState.manualDayOverride = true;
    }
    if (data.currentStepIndex !== undefined) novenaState.currentStepIndex = Number(data.currentStepIndex);
    if (data.selectedMystery !== undefined) novenaState.selectedMystery = data.selectedMystery;
    if (data.currentAveMaria !== undefined) novenaState.currentAveMaria = Number(data.currentAveMaria);
    novenaState.lastUpdate = Date.now();

    console.log(`[Novena Sync Socket] Día ${novenaState.currentDay} | Paso ${novenaState.currentStepIndex + 1} | Ave María ${novenaState.currentAveMaria} (por ${socket.id})`);

    // Emitir a TODOS los clientes conectados (familiares y mandos)
    io.emit('step-changed', {
      currentDay: novenaState.currentDay,
      currentStepIndex: novenaState.currentStepIndex,
      selectedMystery: novenaState.selectedMystery,
      currentAveMaria: novenaState.currentAveMaria,
      hostName: novenaState.hostName
    });
  });

  // Proyección Conmemorativa de Despedida (Fotos a pantalla completa para toda la familia)
  socket.on('start-tribute-projection', (data) => {
    novenaState.isTributeProjecting = true;
    console.log(`[Novena Tribute] Proyección de despedida iniciada por: ${socket.userName || socket.id}`);
    io.emit('tribute-projection-started', {
      startedBy: socket.userName || 'Logística',
      intervalMs: (data && data.intervalMs) || 5500
    });
  });

  socket.on('stop-tribute-projection', () => {
    novenaState.isTributeProjecting = false;
    console.log(`[Novena Tribute] Proyección de despedida detenida`);
    io.emit('tribute-projection-stopped');
  });

  socket.on('disconnect', () => {
    if (socket.id === novenaState.hostSocketId) {
      novenaState.hostSocketId = null;
      novenaState.hostName = null;
      io.emit('host-status-changed', {
        isHostActive: false,
        hostName: null
      });
    }
    if (socket.id === novenaState.speakerSocketId) {
      novenaState.speakerSocketId = null;
      novenaState.speakerName = 'Esperando Orador';
      io.emit('speaker-changed', {
        speakerSocketId: null,
        speakerName: 'Esperando Orador'
      });
    }
    io.emit('user-count', io.engine.clientsCount);
    broadcastParticipantsList();
  });
});

if (!process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Novena] Servidor activo en http://localhost:${PORT}`);
    console.log(`[Novena] PIN de Anfitrión: ${HOST_PIN}`);
  });
}

module.exports = app;

