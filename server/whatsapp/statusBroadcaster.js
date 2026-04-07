import { WebSocketServer } from 'ws';

let wss;

export function initializeWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('✓ WebSocket client connected for status updates.');
    ws.on('close', () => {
      console.log('⚠ WebSocket client disconnected.');
    });
  });
  console.log('✓ WebSocket server initialized for real-time status updates.');
}

export function broadcastStatus(status, data = {}) {
  if (!wss) return;
  const payload = JSON.stringify({ status, ...data });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}