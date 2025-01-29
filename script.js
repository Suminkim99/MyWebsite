// WebSocket 설정
const ws = new WebSocket("wss://hodoonamu-bbd19873c971.herokuapp.com/");

// DOM 요소 참조
const controlSlider = document.getElementById("controlSlider");
const controlledSlider = document.getElementById("controlledSlider");
const pairedDevicesList = document.getElementById("pairedDevices");
const refreshDevicesButton = document.getElementById("refreshDevices");

// WebSocket 이벤트 처리
ws.onopen = () => {
  console.log("[WebSocket] Connection established.");
  // 초기 슬라이더 값을 전송
  const initialValue = controlSlider.value / 100;
  ws.send(JSON.stringify({ sliderValue: initialValue }));
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log("[WebSocket] Received:", data);

    // WebSocket 메시지를 슬라이더에 반영
    if (data.sliderValue !== undefined) {
      controlledSlider.value = data.sliderValue * 100; // 0~1 범위 → 0~100 범위
    }
  } catch (error) {
    console.error("[WebSocket] Message error:", error);
  }
};

ws.onerror = (error) => {
  console.error("[WebSocket] Error:", error);
};

ws.onclose = () => {
  console.log("[WebSocket] Connection closed.");
};

// 슬라이더 이벤트
controlSlider.addEventListener("input", () => {
  if (ws.readyState === WebSocket.OPEN) {
    const value = controlSlider.value / 100; // 0~100 → 0~1 범위
    ws.send(JSON.stringify({ sliderValue: value }));
    console.log("[Slider] Sent:", { sliderValue: value });
  } else {
    console.warn("[Slider] WebSocket not open.");
  }
});

// 페어링된 Bluetooth 장치 표시
async function refreshPairedDevices() {
  try {
    console.log("[Bluetooth] Fetching paired devices...");
    const devices = await navigator.bluetooth.getDevices();

    pairedDevicesList.innerHTML = ""; // 기존 목록 초기화
    if (devices.length === 0) {
      pairedDevicesList.innerHTML = "<li>No paired devices found.</li>";
    } else {
      devices.forEach((device) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${device.name || "Unnamed Device"} (${device.id})`;
        listItem.addEventListener("click", () => connectToDevice(device));
        pairedDevicesList.appendChild(listItem);
      });
    }
  } catch (error) {
    console.error("[Bluetooth] Error fetching devices:", error);
    alert("Failed to fetch paired devices. Ensure your browser supports Bluetooth APIs.");
  }
}

// Bluetooth 장치 연결
async function connectToDevice(device) {
  try {
    console.log(`[Bluetooth] Connecting to ${device.name}...`);
    const server = await device.gatt.connect();
    console.log("[Bluetooth] Connected:", server);
  } catch (error) {
    console.error("[Bluetooth] Connection error:", error);
    alert("Failed to connect to device.");
  }
}

// 버튼 클릭 이벤트
refreshDevicesButton.addEventListener("click", refreshPairedDevices);

// 초기 실행
document.addEventListener("DOMContentLoaded", refreshPairedDevices);
