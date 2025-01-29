const express = require("express");
const WebSocket = require("ws");
const { BluetoothSerialPort } = require("@abandonware/bluetooth-serial-port");

const app = express();
const PORT = 3000;
const WSPORT = 8080;

// Express로 정적 파일 서빙
app.use(express.static("public"));

// WebSocket 서버 생성
const wss = new WebSocket.Server({ port: WSPORT });

// WebSocket 메시지 처리
wss.on("connection", (ws) => {
  console.log("WebSocket connected");

  ws.on("message", (message) => {
    console.log("Received:", message);
    ws.send(`Echo: ${message}`);
  });
});

// Bluetooth 설정
const btSerial = new BluetoothSerialPort();

btSerial.on("found", (address, name) => {
  console.log(`Found Bluetooth device: ${name} (${address})`);
  btSerial.findSerialPortChannel(address, (channel) => {
    console.log(`Connecting to ${name} on channel ${channel}`);
    btSerial.connect(address, channel, () => {
      console.log(`Connected to ${name}`);
    }, (err) => {
      console.error(`Error connecting to ${name}:`, err);
    });
  });
});

btSerial.on("failure", (err) => {
  console.error("Bluetooth error:", err);
});

btSerial.inquire();

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`WebSocket server running at ws://localhost:${WSPORT}`);
});
