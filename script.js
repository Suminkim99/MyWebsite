// ------------------------------------------------------------
// 1) 슬라이더 통신용 WebSocket
// ------------------------------------------------------------
const wsSlider = new WebSocket('wss://hodoonamu-bbd19873c971.herokuapp.com/slider');

const controlTD = document.querySelector('.controlTD');
const controlledByTD = document.querySelector('.controlledByTD');
const pairedDevicesList = document.querySelector('#pairedDevices'); // 페어링된 장치 리스트
const addDeviceButton = document.querySelector('#addDevice'); // 새로운 장치 추가 버튼
let pairedDevices = []; // 페어링된 장치 목록 저장

// 페이지 로딩 후 이벤트
document.addEventListener('DOMContentLoaded', () => {
  console.log('[DOMContentLoaded] Ready to set up slider, Bluetooth, and streaming.');

  // 슬라이더1 (controlTD): 값이 바뀌면 TD로 전송
  if (controlTD) {
    controlTD.addEventListener('input', () => {
      if (wsSlider.readyState === WebSocket.OPEN) {
        const value = controlTD.value / 100; // 0~100 → 0~1 범위
        const dataToSend = { slider1: value };
        
        wsSlider.send(JSON.stringify(dataToSend));
        console.log('[Slider] Sent:', dataToSend);
      } else {
        console.error('[Slider] WebSocket not open.');
      }
    });
  } else {
    console.error('[Slider] controlTD element not found.');
  }
});

// 슬라이더 WebSocket 메시지 수신
wsSlider.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log('[Slider] Received:', data);

    if ('slider1' in data && controlledByTD) {
      controlledByTD.value = data.slider1 * 100;
    }
  } catch (error) {
    console.error('[Slider] JSON parse error:', error);
  }
};

// 에러/종료 처리
wsSlider.onerror = (error) => {
  console.error('[Slider] WebSocket error:', error);
};
wsSlider.onclose = () => {
  console.log('[Slider] WebSocket closed.');
};

// ------------------------------------------------------------
// 2) Bluetooth 페어링된 장치 목록 표시 및 선택
// ------------------------------------------------------------

// 페이지 로드 시 페어링된 장치 표시
async function showPairedDevices() {
  try {
    pairedDevices = await navigator.bluetooth.getDevices();
    console.log('[Bluetooth] Previously paired devices:', pairedDevices);

    pairedDevicesList.innerHTML = ''; // 기존 목록 초기화
    pairedDevices.forEach(device => {
      const deviceItem = document.createElement('li');
      deviceItem.textContent = `${device.name || 'Unknown Device'} (${device.id})`;
      deviceItem.dataset.deviceId = device.id;
      pairedDevicesList.appendChild(deviceItem);
    });

    if (pairedDevices.length === 0) {
      const noDevices = document.createElement('li');
      noDevices.textContent = 'No paired devices found.';
      pairedDevicesList.appendChild(noDevices);
    }
  } catch (error) {
    console.error('[Bluetooth] Error fetching paired devices:', error);
  }
}

// 새로운 장치 추가 버튼 클릭 시
async function addNewDevice() {
  try {
    console.log('[Bluetooth] Requesting a new device...');
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service']
    });

    console.log(`[Bluetooth] Device selected: ${device.name || 'Unknown Device'} (${device.id})`);
    pairedDevices.push(device);
    showPairedDevices(); // 새로 추가된 장치를 목록에 반영
  } catch (error) {
    console.error('[Bluetooth] Error adding new device:', error);
  }
}

// 선택된 장치와 연결
async function connectToSelectedDevice(deviceId) {
  try {
    const device = pairedDevices.find(d => d.id === deviceId);
    if (!device) {
      console.error('[Bluetooth] Device not found in paired list.');
      return;
    }

    console.log(`[Bluetooth] Connecting to device: ${device.name || 'Unknown Device'} (${device.id})`);
    const server = await device.gatt.connect();
    console.log('[Bluetooth] Connected to GATT server.');

    // GATT 서비스 읽기 (예: 배터리 레벨)
    const service = await server.getPrimaryService('battery_service');
    const characteristic = await service.getCharacteristic('battery_level');
    const value = await characteristic.readValue();
    console.log(`[Bluetooth] Battery level: ${value.getUint8(0)}%`);
  } catch (error) {
    console.error('[Bluetooth] Error connecting to device:', error);
  }
}

// 장치 클릭 이벤트 처리
pairedDevicesList.addEventListener('click', (event) => {
  const deviceId = event.target.dataset.deviceId;
  if (deviceId) {
    connectToSelectedDevice(deviceId);
  }
});

// 새로운 장치 추가 버튼 이벤트
addDeviceButton.addEventListener('click', addNewDevice);

// 페이지 로드 시 페어링된 장치 표시
document.addEventListener('DOMContentLoaded', showPairedDevices);
