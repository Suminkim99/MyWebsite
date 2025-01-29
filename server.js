// server.js

const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

// WebSocket 서버 생성
const server = new WebSocket.Server({ port: PORT }, () => {
  console.log(`[WebSocket Server] Listening on port ${PORT}`);
});

// 연결된 클라이언트 저장
let clients = [];

server.on('connection', (ws) => {
  console.log('[WebSocket Server] New client connected.');
  clients.push(ws);

  ws.on('message', (message) => {
    console.log(`[WebSocket Server] Received: ${message}`);
    try {
      const parsedMessage = JSON.parse(message);
      // 모든 클라이언트에게 메시지 브로드캐스트 (보내는 클라이언트를 제외)
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    } catch (error) {
      console.error(`[WebSocket Server] Error parsing message: ${error.message}`);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket Server] Client disconnected.');
    clients = clients.filter((client) => client !== ws);
  });

  ws.on('error', (error) => {
    console.error(`[WebSocket Server] Error: ${error.message}`);
  });
});

console.log(`[WebSocket Server] Running on ws://localhost:${PORT}`);
