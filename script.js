let ws;

// WebSocket 초기화 함수
function initializeWebSocket() {
  ws = new WebSocket('ws://localhost:3000');

  ws.onopen = () => {
    console.log('[WebSocket] Connected to server.');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[WebSocket] Received:', data);

      if (data.type === 'devices') {
        deviceList.innerHTML = '';
        data.devices.forEach((device) => {
          const listItem = document.createElement('li');
          listItem.textContent = `${device.name || 'Unnamed Device'} (${device.address})`;
          listItem.addEventListener('click', () => connectToDevice(device.address));
          deviceList.appendChild(listItem);
        });
      } else if (data.type === 'status') {
        alert(data.message);
      } else if (data.type === 'error') {
        console.error('[WebSocket] Error:', data.message);
      }
    } catch (error) {
      console.error('[WebSocket] Message parse error:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('[WebSocket] Error:', error);
  };

  ws.onclose = () => {
    console.warn('[WebSocket] Connection closed. Attempting to reconnect...');
    setTimeout(initializeWebSocket, 3000); // 3초 후에 WebSocket 재연결 시도
  };
}

// WebSocket 연결 상태를 확인하고 메시지를 보내는 함수
function sendMessage(message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.warn('[WebSocket] Cannot send message. WebSocket is not open.');
  }
}

// DOM 요소 참조
const refreshButton = document.getElementById('refreshDevices');
const deviceList = document.getElementById('deviceList');

// 버튼 이벤트 핸들러
refreshButton.addEventListener('click', () => {
  if (ws.readyState === WebSocket.OPEN) {
    sendMessage({ command: 'listDevices' });
  } else {
    console.warn('[WebSocket] WebSocket is not open. Retrying connection...');
    initializeWebSocket(); // WebSocket 연결이 끊어진 경우 다시 초기화
  }
});

// Bluetooth 장치 연결 요청
function connectToDevice(address) {
  sendMessage({ command: 'connect', address });
}

// 초기 실행
document.addEventListener('DOMContentLoaded', () => {
  initializeWebSocket(); // WebSocket 초기화
});
