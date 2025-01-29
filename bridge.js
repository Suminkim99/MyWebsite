// bridge.js

const WebSocket = require('ws');
const BluetoothSerialPort = require('bluetooth-serial-port').BluetoothSerialPort;

// WebSocket 서버 주소 (로컬 테스트 시 'ws://localhost:8080/')
const WEBSOCKET_SERVER_URL = 'ws://localhost:8080/';
const ws = new WebSocket(WEBSOCKET_SERVER_URL);
const bluetooth = new BluetoothSerialPort();

let isConnected = false;
let connectedDeviceAddress = '';

// WebSocket 연결 시 페어링된 장치 목록 전송
ws.on('open', () => {
  console.log('[Bridge] WebSocket 연결됨.');
  listPairedDevices();
});

// WebSocket 메시지 수신 시 처리
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    if (message.action === 'connect' && message.address) {
      connectToDevice(message.address);
    } else if (message.sliderValue !== undefined && isConnected) {
      const value = Math.round(message.sliderValue * 100);
      bluetooth.write(Buffer.from([value]), (err, bytesWritten) => {
        if (err) {
          console.error('[Bridge] Bluetooth 전송 오류:', err);
        } else {
          console.log(`[Bridge] Bluetooth로 ${bytesWritten} 바이트 전송됨.`);
        }
      });
    }
  } catch (error) {
    console.error('[Bridge] 메시지 파싱 오류:', error);
  }
});

// 페어링된 Bluetooth 장치 목록 조회 및 전송
function listPairedDevices() {
  bluetooth.listPairedDevices((devices) => {
    console.log('[Bridge] 페어링된 Bluetooth 장치 목록:');
    devices.forEach((device, index) => {
      console.log(`${index + 1}. ${device.name} (${device.address})`);
    });
    // 서버로 장치 목록 전송
    ws.send(JSON.stringify({ action: 'pairedDevices', devices: devices }));
  }, (err) => {
    console.error('[Bridge] 페어링된 장치 목록 조회 오류:', err);
    ws.send(JSON.stringify({ action: 'pairedDevices', devices: [] }));
  });
}

// 특정 장치에 연결
function connectToDevice(address) {
  if (isConnected && connectedDeviceAddress === address) {
    console.log('[Bridge] 이미 해당 장치에 연결되어 있습니다.');
    return;
  }

  bluetooth.findSerialPortChannel(address, (channel) => {
    bluetooth.connect(address, channel, () => {
      isConnected = true;
      connectedDeviceAddress = address;
      console.log(`[Bridge] Bluetooth 장치(${address})와 연결됨.`);

      // 데이터 수신 이벤트 설정
      bluetooth.on('data', (buffer) => {
        const data = buffer.toString('utf-8').trim();
        console.log(`[Bridge] Bluetooth로부터 받은 데이터: ${data}`);
        ws.send(JSON.stringify({ bluetoothData: data }));
      });

      // 연결 상태 서버로 전송
      ws.send(JSON.stringify({ action: 'connected', address: address }));
    }, () => {
      console.error(`[Bridge] Bluetooth 장치(${address}) 연결 실패.`);
      ws.send(JSON.stringify({ action: 'error', message: `Bluetooth 장치(${address}) 연결 실패.` }));
    });
  }, () => {
    console.error(`[Bridge] Bluetooth 장치(${address})의 시리얼 포트 채널을 찾을 수 없음.`);
    ws.send(JSON.stringify({ action: 'error', message: `Bluetooth 장치(${address})의 시리얼 포트 채널을 찾을 수 없음.` }));
  });
}

// 종료 시 Bluetooth 연결 해제
process.on('SIGINT', () => {
  console.log('\n[Bridge] 종료 중...');
  if (isConnected) {
    bluetooth.close();
    console.log('[Bridge] Bluetooth 연결 종료됨.');
  }
  ws.close();
  process.exit();
});
