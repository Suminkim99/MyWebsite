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

  // 클라이언트로부터 메시지 수신
  ws.on('message', (message) => {
    console.log(`[WebSocket Server] Received: ${message}`);
    try {
      // 메시지를 다시 모든 클라이언트에 브로드캐스트
      const parsedMessage = JSON.parse(message);
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    } catch (error) {
      console.error(`[WebSocket Server] Error parsing message: ${error.message}`);
    }
  });

  // 연결 종료 시 클라이언트 제거
  ws.on('close', () => {
    console.log('[WebSocket Server] Client disconnected.');
    clients = clients.filter((client) => client !== ws);
  });

  // 에러 처리
  ws.on('error', (error) => {
    console.error(`[WebSocket Server] Error: ${error.message}`);
  });
});

console.log(`[WebSocket Server] Running on ws://localhost:${PORT}`);
