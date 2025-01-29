// WebSocket 설정
const ws = new WebSocket("ws://localhost:8080");

// DOM 요소
const controlSlider = document.getElementById("controlSlider");
const controlledSlider = document.getElementById("controlledSlider");
const pairedDevicesList = document.getElementById("pairedDevices");

// WebSocket 이벤트 처리
ws.onopen = () => {
  console.log("[WebSocket] Connected to server.");
};

ws.onmessage = (event) => {
  console.log("[WebSocket] Received:", event.data);

  try {
    const data = JSON.parse(event.data);
    if (data.sliderValue !== undefined) {
      controlledSlider.value = data.sliderValue * 100; // 서버에서 받은 값을 슬라이더에 반영
    }
  } catch (error) {
    console.error("[WebSocket] Parsing error:", error);
  }
};

ws.onerror = (error) => {
  console.error("[WebSocket] Error:", error);
};

// 슬라이더 값 전송
controlSlider.addEventListener("input", () => {
  const value = controlSlider.value / 100;
  ws.send(JSON.stringify({ sliderValue: value }));
  console.log("[Slider] Sent:", { sliderValue: value });
});

// 블루투스 장치 표시
async function listBluetoothDevices() {
  pairedDevicesList.innerHTML = "<li>Loading paired devices...</li>";
  // 실제 블루투스 시리얼 포트 장치를 표시하려면 서버와 통신 필요
  console.log("[Bluetooth] Fetching paired devices...");
}
listBluetoothDevices();
