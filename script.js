document.addEventListener('DOMContentLoaded', () => {
  // 슬라이더 DOM 요소
  const controlSlider = document.querySelector('.controlSlider');
  const controlledSlider = document.querySelector('.controlledSlider');

  // WebSocket 연결
  const ws = new WebSocket('wss://hodoonamu-bbd19873c971.herokuapp.com/slider');

  // 슬라이더 조작 시 WebSocket으로 데이터 전송
  if (controlSlider) {
    controlSlider.addEventListener('input', () => {
      if (ws.readyState === WebSocket.OPEN) {
        const data = { sliderValue: controlSlider.value / 100 }; // 0~1 범위
        ws.send(JSON.stringify(data));
        console.log('[WebSocket] Sent:', data);
      }
    });
  }

  // WebSocket 메시지 수신하여 다른 슬라이더 업데이트
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if ('sliderValue' in data && controlledSlider) {
        controlledSlider.value = data.sliderValue * 100;
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error);
    }
  };

  // Bluetooth API: 페어링된 장치 목록
  const pairedDevicesList = document.getElementById('pairedDevices');
  const addDeviceButton = document.getElementById('addDevice');

  // 페어링된 장치 표시
  async function showPairedDevices() {
    try {
      const devices = await navigator.bluetooth.getDevices();
      pairedDevicesList.innerHTML = '';
      devices.forEach((device) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${device.name || 'Unknown Device'} (${device.id})`;
        listItem.dataset.deviceId = device.id;
        pairedDevicesList.appendChild(listItem);

        listItem.addEventListener('click', () => connectToDevice(device));
      });
    } catch (error) {
      console.error('[Bluetooth] Error fetching devices:', error);
    }
  }

  // 장치 연결
  async function connectToDevice(device) {
    try {
      const server = await device.gatt.connect();
      console.log('[Bluetooth] Connected to device:', device.name);
    } catch (error) {
      console.error('[Bluetooth] Error connecting to device:', error);
    }
  }

  // 새로운 장치 추가
  addDeviceButton.addEventListener('click', async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });
      console.log('[Bluetooth] Device added:', device);
      showPairedDevices();
    } catch (error) {
      console.error('[Bluetooth] Error adding device:', error);
    }
  });

  // 초기 로드 시 페어링된 장치 표시
  showPairedDevices();
});
