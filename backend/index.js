require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const os = require('os');
const cors = require('cors');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000
});

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// HEALTH CHECK - Critical for uptime monitors
app.get('/health', (req, res) => res.json({
  status: 'alive',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  clients: io.engine.clientsCount
}));

app.get('/', (req, res) => res.send('Network Inspector Backend ✅'));

// REAL-TIME PACKET GENERATOR (Simulates network traffic)
setInterval(() => {
  const packet = {
    src_ip: `192.168.1.${Math.floor(Math.random()*255)}`,
    dst_ip: `192.168.1.${Math.floor(Math.random()*255)}`,
    protocol: ['TCP','UDP','ICMP'][Math.floor(Math.random()*3)],
    bytes: Math.floor(Math.random()*1500)+64
  };
  io.emit('packet', packet);
}, 2000);

// SOCKET.IO HANDLERS
io.on('connection', (socket) => {
  console.log(`🟢 ${socket.id} connected (${io.engine.clientsCount} total)`);
  
  socket.emit('welcome', { id: socket.id, time: Date.now() });
  
  socket.on('init', () => {
    socket.emit('system_info', getSystemInfo());
    socket.emit('devices', getDevices());
    socket.emit('topology', getTopology());
  });
  
  socket.on('scan_network', () => {
    socket.emit('devices', getDevices());
  });
  
  socket.on('disconnect', () => {
    console.log(`🔴 ${socket.id} disconnected (${io.engine.clientsCount} remaining)`);
  });
});

// DATA GENERATORS
function getSystemInfo() {
  return {
    local_ip: Object.values(os.networkInterfaces())
      .flat().find(i => i.family === 'IPv4' && !i.internal)?.address || '192.168.1.100',
    uptime: Math.floor(os.uptime()),
    platform: os.platform(),
    totalmem: (os.totalmem() / 1024 / 1024 / 1024).toFixed(1) + 'GB'
  };
}

function getDevices() {
  return Array.from({length: 25}, (_, i) => ({
    ip: `192.168.1.${i+2}`,
    mac: `AA:BB:CC:DD:EE:${(i+2).toString(16).padStart(2,'0')}`,
    hostname: `device-${i+2}`,
    vendor: ['Cisco','TP-Link','Apple','Samsung'][i%4],
    online: Math.random() > 0.08,
    open_ports: [80,443,22,3389,8080].filter(() => Math.random()>0.6),
    vulnerabilities: Math.random()>0.75 ? ['SSH Open','SMBv1','UPnP'] : []
  }));
}

function getTopology() {
  return {
    nodes: [
      {id: 'router', label: 'Router\n192.168.1.1', group: 'router', online: true},
      ...Array.from({length: 15}, (_,i) => ({
        id: `node${i}`, 
        label: `192.168.1.${i+10}`,
        group: 'device',
        online: Math.random()>0.1
      }))
    ],
    edges: Array.from({length: 15}, (_,i) => ({from: 'router', to: `node${i}`}))
  };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Network Inspector Backend`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/health`);
  console.log(`👥 WebSocket: ws://localhost:${PORT}/socket.io/\n`);
});