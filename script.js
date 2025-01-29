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
    // 메시지가 JSON 형식이 아닌 경우 무시
    if (event.data === "ping") {
      console.log("[WebSocket] Ping received, ignoring.");
    } else {
      console.error("[WebSocket] Message error:", error);
    }
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

// Bluetooth 장치 검색 및 선택
async function refreshPairedDevices() {
  try {
    console.log("[Bluetooth] Requesting a device...");
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true, // 모든 장치 허용
      optionalServices: ['battery_service'], // 필요시 서비스 지정
    });

    // 기존 장치 리스트 초기화 후 새 장치 추가
    pairedDevicesList.innerHTML = "";
    const listItem = document.createElement("li");
    listItem.textContent = `${device.name || "Unnamed Device"} (${device.id})`;
    listItem.addEventListener("click", () => connectToDevice(device));
    pairedDevicesList.appendChild(listItem);

    console.log(`[Bluetooth] Found device: ${device.name} (${device.id})`);
  } catch (error) {
    console.error("[Bluetooth] Error fetching devices:", error);
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
  }
}

// 버튼 클릭 이벤트
refreshDevicesButton.addEventListener("click", refreshPairedDevices);
