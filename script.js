// script.js

// WebSocket 설정 (실제 서버 주소로 변경)
const ws = new WebSocket("ws://localhost:8080/"); // 또는 실제 서버 주소

// DOM 요소 참조
const controlSlider = document.getElementById("controlSlider");
const controlledSlider = document.getElementById("controlledSlider");
const pairedDevicesList = document.getElementById("pairedDevices");
const refreshDevicesButton = document.getElementById("refreshDevices");
const bluetoothDataDisplay = document.getElementById("bluetoothData");

// WebSocket 이벤트 처리
ws.onopen = () => {
  console.log("[WebSocket] Connection established.");
  // 페어링된 장치 목록 요청
  ws.send(JSON.stringify({ action: 'listPairedDevices' }));
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log("[WebSocket] Received:", data);

    // 페어링된 장치 목록 처리
    if (data.action === 'pairedDevices' && Array.isArray(data.devices)) {
      pairedDevicesList.innerHTML = "";
      if (data.devices.length === 0) {
        pairedDevicesList.innerHTML = "<li>No paired devices found.</li>";
      } else {
        data.devices.forEach((device) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${device.name} (${device.address})`;
          listItem.addEventListener("click", () => {
            // 선택한 장치에 연결 요청
            ws.send(JSON.stringify({ action: 'connect', address: device.address }));
          });
          pairedDevicesList.appendChild(listItem);
        });
      }
    }

    // Bluetooth 데이터 표시
    if (data.bluetoothData !== undefined) {
      bluetoothDataDisplay.textContent = `Bluetooth Data: ${data.bluetoothData}`;
    }

    // 슬라이더 값 반영
    if (data.sliderValue !== undefined) {
      controlledSlider.value = data.sliderValue * 100;
    }

    // 연결 상태 알림
    if (data.action === 'connected' && data.address) {
      alert(`Connected to Bluetooth device: ${data.address}`);
    }

    if (data.action === 'error' && data.message) {
      alert(`Error: ${data.message}`);
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
    const value = controlSlider.value / 100;
    ws.send(JSON.stringify({ sliderValue: value }));
    console.log("[Slider] Sent:", { sliderValue: value });
  } else {
    console.warn("[Slider] WebSocket not open.");
  }
});

// 장치 목록 새로 고침 버튼
refreshDevicesButton.addEventListener("click", () => {
  ws.send(JSON.stringify({ action: 'listPairedDevices' }));
});

// 초기 실행 시 장치 목록 요청
document.addEventListener("DOMContentLoaded", () => {
  ws.send(JSON.stringify({ action: 'listPairedDevices' }));
});
