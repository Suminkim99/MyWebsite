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

// Bluetooth 장치 연결
async function refreshPairedDevices() {
  try {
    console.log("[Bluetooth] Fetching paired devices...");
    // Web Bluetooth API를 사용할 수 없는 경우의 로직
    pairedDevicesList.innerHTML = "<li>No paired devices found.</li>";
  } catch (error) {
    console.error("[Bluetooth] Error fetching devices:", error);
  }
}

// 버튼 클릭 이벤트
refreshDevicesButton.addEventListener("click", refreshPairedDevices);

// 초기 실행
document.addEventListener("DOMContentLoaded", refreshPairedDevices);
