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
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate, proxy-revalidate');
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

// Persistent in-memory state of the active Novena
const novenaState = {
  currentDay: 1,
  currentStepIndex: 0,
  selectedMystery: null, // null means auto by day of week
  currentAveMaria: 0,
  hostSocketId: null,
  hostName: null,
  speakerSocketId: null,
  speakerName: 'Esperando Orador',
  lastUpdate: Date.now(),
  sessionStartTime: Date.now()
};

function getParticipantsList() {
  const list = [];
  for (const [id, s] of io.sockets.sockets) {
    // Solo incluir usuarios que realmente hayan entrado a la novena (inCall === true)
    if (!s.inCall) continue;

    // Excluir consolas de mando / logística para que no figuren como familiar a silenciar
    if (s.isLogistics || (s.userName && s.userName.includes('(Mando)'))) continue;

    list.push({
      socketId: id,
      userName: s.userName || (id === novenaState.hostSocketId ? (novenaState.hostName || 'Anfitrión') : 'Familiar'),
      isHost: Boolean(s.isHost || id === novenaState.hostSocketId),
      isSpeaker: id === novenaState.speakerSocketId,
      inCall: true,
      isAudioMuted: Boolean(s.isAudioMuted),
      isVideoOff: Boolean(s.isVideoOff)
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
  if (currentDay !== undefined) novenaState.currentDay = Number(currentDay);
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

// HTTP Endpoint para silenciar o abrir micrófonos de todos
app.post('/api/audio/all', (req, res) => {
  const { enabled } = req.body;
  const isOpening = Boolean(enabled);
  for (const [id, s] of io.sockets.sockets) {
    s.isAudioMuted = !isOpening;
  }
  io.emit('force-audio-state', { enabled: isOpening });
  broadcastParticipantsList();
  console.log(`[Novena Audio HTTP] Todos los micrófonos: ${isOpening ? 'ABIERTOS' : 'SILENCIADOS'}`);
  res.json({ success: true, enabled: isOpening });
});

// HTTP Endpoint para presintonías maestras de audio (Orador solo, Coro, Silencio total)
app.post('/api/audio/preset', (req, res) => {
  const { preset } = req.body; // 'orador' | 'coro' | 'silencio'
  if (preset === 'orador') {
    // Silencia a todos los oyentes y abre únicamente el micrófono del orador
    for (const [id, s] of io.sockets.sockets) {
      if (id === novenaState.speakerSocketId) {
        s.isAudioMuted = false;
        io.to(id).emit('force-audio-state', { enabled: true });
      } else {
        s.isAudioMuted = true;
        io.to(id).emit('force-audio-state', { enabled: false });
      }
    }
  } else if (preset === 'coro') {
    // Abre todos los micrófonos para respuesta comunitaria
    for (const [id, s] of io.sockets.sockets) {
      s.isAudioMuted = false;
    }
    io.emit('force-audio-state', { enabled: true });
  } else if (preset === 'silencio') {
    // Silencio completo para reflexión
    for (const [id, s] of io.sockets.sockets) {
      s.isAudioMuted = true;
    }
    io.emit('force-audio-state', { enabled: false });
  }
  broadcastParticipantsList();
  console.log(`[Novena Audio Preset] Preset aplicado: ${preset}`);
  res.json({ success: true, preset });
});

// HTTP Endpoint para silenciar o abrir micrófono a un usuario específico
app.post('/api/audio/user', (req, res) => {
  const { targetSocketId, enabled } = req.body;
  const willEnable = Boolean(enabled);
  const targetSocket = io.sockets.sockets.get(targetSocketId);
  if (targetSocket) {
    targetSocket.isAudioMuted = !willEnable;
  }
  io.to(targetSocketId).emit('force-audio-state', { enabled: willEnable });
  io.emit('user-media-state-changed', {
    socketId: targetSocketId,
    isAudioMuted: !willEnable
  });
  broadcastParticipantsList();
  console.log(`[Novena Audio HTTP] Micrófono de ${targetSocketId}: ${willEnable ? 'ABIERTO' : 'SILENCIADO'}`);
  res.json({ success: true, targetSocketId, enabled: willEnable });
});

// HTTP Endpoint para nombrar orador
app.post('/api/speaker', (req, res) => {
  const { socketId, speakerName } = req.body;
  novenaState.speakerSocketId = socketId;
  novenaState.speakerName = speakerName || 'Orador';

  const targetSocket = io.sockets.sockets.get(socketId);
  if (targetSocket) {
    targetSocket.isAudioMuted = false;
    io.to(socketId).emit('force-audio-state', { enabled: true });
  }

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

      if (socket.isLogistics) {
        const videoCallers = [];
        for (const [id, s] of io.sockets.sockets) {
          if (id !== socket.id && s.inCall && !s.isLogistics) {
            videoCallers.push({
              socketId: id,
              userName: s.userName || 'Familiar',
              isVideoOff: Boolean(s.isVideoOff)
            });
          }
        }
        socket.emit('active-video-callers', { callers: videoCallers });
      }
    } else {
      socket.emit('host-error', { message: 'El PIN ingresado es incorrecto' });
    }
  });

  socket.on('request-video-callers', () => {
    const videoCallers = [];
    for (const [id, s] of io.sockets.sockets) {
      if (id !== socket.id && s.inCall && !s.isLogistics) {
        videoCallers.push({
          socketId: id,
          userName: s.userName || 'Familiar',
          isVideoOff: Boolean(s.isVideoOff)
        });
      }
    }
    socket.emit('active-video-callers', { callers: videoCallers });
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

    // Abrir micrófono al orador automáticamente
    const targetSocket = io.sockets.sockets.get(socketId);
    if (targetSocket) {
      targetSocket.isAudioMuted = false;
      io.to(socketId).emit('force-audio-state', { enabled: true });
    }

    io.emit('speaker-changed', {
      speakerSocketId: novenaState.speakerSocketId,
      speakerName: novenaState.speakerName
    });
    broadcastParticipantsList();
  });

  // Silenciar o Abrir micrófonos a todos los oyentes (Control del Anfitrión)
  socket.on('set-all-listeners-audio', ({ enabled }) => {
    const isOpening = Boolean(enabled);
    console.log(`[Novena Audio] Mando ordenó ${isOpening ? 'ABRIR' : 'SILENCIAR'} micrófonos a todos`);
    for (const [id, s] of io.sockets.sockets) {
      if (id !== socket.id) {
        s.isAudioMuted = !isOpening;
      }
    }
    io.emit('force-audio-state', { enabled: isOpening });
    broadcastParticipantsList();
  });

  // Presintonías maestras de audio (Orador solo, Coro, Silencio total) por Socket
  socket.on('set-audio-preset', ({ preset }) => {
    console.log(`[Novena Audio Socket] Preset recibido: ${preset}`);
    if (preset === 'orador') {
      for (const [id, s] of io.sockets.sockets) {
        if (id === novenaState.speakerSocketId) {
          s.isAudioMuted = false;
          io.to(id).emit('force-audio-state', { enabled: true });
        } else {
          s.isAudioMuted = true;
          io.to(id).emit('force-audio-state', { enabled: false });
        }
      }
    } else if (preset === 'coro') {
      for (const [id, s] of io.sockets.sockets) {
        s.isAudioMuted = false;
      }
      io.emit('force-audio-state', { enabled: true });
    } else if (preset === 'silencio') {
      for (const [id, s] of io.sockets.sockets) {
        s.isAudioMuted = true;
      }
      io.emit('force-audio-state', { enabled: false });
    }
    broadcastParticipantsList();
  });

  // Silenciar o Abrir micrófono a un usuario específico (Control del Anfitrión)
  socket.on('set-user-audio-state', ({ targetSocketId, enabled }) => {
    const willEnable = Boolean(enabled);
    console.log(`[Novena Audio] Mando ordenó micrófono para ${targetSocketId}: ${willEnable ? 'ABRIR' : 'SILENCIAR'}`);
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.isAudioMuted = !willEnable;
    }
    io.to(targetSocketId).emit('force-audio-state', { enabled: willEnable });
    io.emit('user-media-state-changed', {
      socketId: targetSocketId,
      isAudioMuted: !willEnable
    });
    broadcastParticipantsList();
  });

  // Compatibilidad: silenciar a todos
  socket.on('mute-all-listeners', () => {
    console.log(`[Novena Audio] mute-all-listeners recibido`);
    for (const [id, s] of io.sockets.sockets) {
      if (id !== socket.id) {
        s.isAudioMuted = true;
      }
    }
    io.emit('force-audio-state', { enabled: false });
    broadcastParticipantsList();
  });

  // Host navigation update (Sincronización instantánea a TODOS los clientes)
  socket.on('update-step', (data) => {
    if (data.currentDay !== undefined) novenaState.currentDay = Number(data.currentDay);
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

  // WebRTC Videollamada Familiar
  socket.on('join-call', ({ userName, isAudioOnly, isLogistics }) => {
    socket.userName = userName || 'Familiar';
    socket.isAudioOnly = Boolean(isAudioOnly);
    socket.isAudioMuted = false;
    socket.isVideoOff = Boolean(isAudioOnly);
    if (isLogistics) socket.isLogistics = true;
    
    // Obtener lista de usuarios actuales en la llamada
    const currentCallers = [];
    for (const [id, s] of io.sockets.sockets) {
      if (id !== socket.id && s.inCall) {
        currentCallers.push({
          socketId: id,
          userName: s.userName || 'Familiar',
          isAudioOnly: s.isAudioOnly || false
        });
      }
    }

    socket.inCall = true;

    // Responder al nuevo usuario con la lista de usuarios ya conectados
    socket.emit('call-joined', {
      existingUsers: currentCallers
    });

    // Notificar a los demás que alguien nuevo se unió
    socket.broadcast.emit('user-joined-call', {
      socketId: socket.id,
      userName: socket.userName,
      isAudioOnly: socket.isAudioOnly
    });
    broadcastParticipantsList();
  });

  // Reenvío de señal WebRTC (Oferta)
  socket.on('webrtc-offer', ({ targetSocketId, offer, senderName }) => {
    io.to(targetSocketId).emit('webrtc-offer', {
      senderSocketId: socket.id,
      senderName: senderName || socket.userName || 'Familiar',
      offer
    });
  });

  // Reenvío de señal WebRTC (Respuesta)
  socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit('webrtc-answer', {
      senderSocketId: socket.id,
      answer
    });
  });

  // Reenvío de candidatos ICE
  socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('webrtc-ice-candidate', {
      senderSocketId: socket.id,
      candidate
    });
  });

  // Actualización de estado de micrófono o cámara
  socket.on('call-media-state', ({ isAudioMuted, isVideoOff }) => {
    socket.isAudioMuted = Boolean(isAudioMuted);
    socket.isVideoOff = Boolean(isVideoOff);
    socket.broadcast.emit('user-media-state-changed', {
      socketId: socket.id,
      isAudioMuted,
      isVideoOff
    });
    broadcastParticipantsList();
  });

  // Salir de la llamada
  socket.on('leave-call', () => {
    if (socket.inCall) {
      socket.inCall = false;
      socket.broadcast.emit('user-left-call', {
        socketId: socket.id,
        userName: socket.userName
      });
      broadcastParticipantsList();
    }
  });

  socket.on('disconnect', () => {
    if (socket.inCall) {
      socket.broadcast.emit('user-left-call', {
        socketId: socket.id,
        userName: socket.userName
      });
    }
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Novena] Servidor activo en http://localhost:${PORT}`);
  console.log(`[Novena] PIN de Anfitrión: ${HOST_PIN}`);
});
