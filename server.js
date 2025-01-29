const WebSocket = require("ws");
const SerialPort = require("bluetooth-serial-port").BluetoothSerialPort;

// WebSocket 서버 설정
const wss = new WebSocket.Server({ port: 8080 });
const bluetoothSerialPort = new SerialPort();

console.log("[Server] WebSocket server running on ws://localhost:8080");

wss.on("connection", (ws) => {
  console.log("[WebSocket] Client connected.");

  ws.on("message", (message) => {
    console.log("[WebSocket] Received from client:", message);

    // 클라이언트로부터 받은 데이터를 블루투스 장치로 전송
    try {
      bluetoothSerialPort.write(Buffer.from(message, "utf-8"), (err, bytesWritten) => {
        if (err) console.error("[Bluetooth] Write error:", err);
        else console.log("[Bluetooth] Sent to device:", message);
      });
    } catch (error) {
      console.error("[Bluetooth] Error writing to device:", error);
    }
  });

  ws.on("close", () => {
    console.log("[WebSocket] Client disconnected.");
  });
});

// 블루투스 장치 스캔 및 연결
bluetoothSerialPort.on("found", (address, name) => {
  console.log(`[Bluetooth] Found device: ${name} (${address})`);

  // 연결 시도
  bluetoothSerialPort.findSerialPortChannel(address, (channel) => {
    bluetoothSerialPort.connect(address, channel, () => {
      console.log(`[Bluetooth] Connected to ${name}`);
    }, (err) => {
      console.error("[Bluetooth] Connection error:", err);
    });
  });
});

bluetoothSerialPort.on("data", (buffer) => {
  const receivedData = buffer.toString("utf-8");
  console.log("[Bluetooth] Received from device:", receivedData);

  // 클라이언트로 데이터 전송
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(receivedData);
    }
  });
});

// 블루투스 검색 시작
bluetoothSerialPort.inquire();
