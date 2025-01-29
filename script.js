// script.js

// WebSocket 설정 (원격 서버 URL로 변경)
const ws = new WebSocket("wss://hodoonamu-bbd19873c971.herokuapp.com/");

// DOM 요소 참조
const controlSlider = document.getElementById("controlSlider");
const controlledSlider = document.getElementById("controlledSlider");
const pairedDevicesList = document.getElementById("pairedDevices");
const refreshDevicesButton = document.getElementById("refreshDevices");

// WebSocket 이벤트 처리
ws.onopen = () => {
  console.log("[WebSocket] Connection established.");
  // 브리지 애플리케이션과의 통신이 자동으로 이루어짐
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log("[WebSocket] Received:", data);

    // Bluetooth 데이터 처리
    if (data.bluetoothData !== undefined) {
      // Bluetooth 데이터를 웹 페이지에 표시하거나 추가 기능 구현
      console.log(`[WebSocket] Bluetooth Data: ${data.bluetoothData}`);
      // 예: 화면에 표시
      const bluetoothDataDisplay = document.getElementById("bluetoothData");
      if (bluetoothDataDisplay) {
        bluetoothDataDisplay.textContent = `Bluetooth Data: ${data.bluetoothData}`;
      }
    }

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

// Bluetooth 장치 목록 및 연결 기능은 브리지 애플리케이션에서 처리됨
// 따라서 웹 클라이언트에서는 이를 단순히 표시하거나 추가 기능을 구현

// 버튼 클릭 이벤트 (페어링된 장치 목록 필요 없음)
refreshDevicesButton.addEventListener("click", () => {
  alert("Bluetooth 장치 관리는 브리지 애플리케이션에서 처리됩니다.");
});

// 초기 실행 (브리지가 처리)
document.addEventListener("DOMContentLoaded", () => {
  pairedDevicesList.innerHTML = "<li>Bluetooth 장치 관리는 브리지 애플리케이션에서 처리됩니다.</li>";
});
