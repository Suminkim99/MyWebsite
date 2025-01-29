// ------------------------------------------------------------
// 1) Slider WebSocket Communication
// ------------------------------------------------------------
const wsSlider = new WebSocket('wss://hodoonamu-bbd19873c971.herokuapp.com/slider');
const controlSlider = document.querySelector('.controlSlider');
const deviceSlider = document.querySelector('.deviceSlider');

// WebSocket event listeners
wsSlider.onopen = () => console.log('[WebSocket] Connected');
wsSlider.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.sliderValue) {
      deviceSlider.value = data.sliderValue * 100;
      console.log('[WebSocket] Received value:', data.sliderValue);
    }
  } catch (error) {
    console.error('[WebSocket] Error parsing message:', error);
  }
};

// Send slider data
controlSlider.addEventListener('input', () => {
  if (wsSlider.readyState === WebSocket.OPEN) {
    const sliderValue = controlSlider.value / 100;
    wsSlider.send(JSON.stringify({ sliderValue }));
    console.log('[Slider] Sent value:', sliderValue);
  } else {
    console.error('[WebSocket] Connection not open.');
  }
});

// ------------------------------------------------------------
// 2) Bluetooth Paired Devices
// ------------------------------------------------------------
const pairedDevicesList = document.getElementById('pairedDevices');
const refreshDevicesButton = document.getElementById('refreshDevices');

// Fetch and display paired devices
async function refreshPairedDevices() {
  try {
    console.log('[Bluetooth] Fetching paired devices...');
    const devices = await navigator.bluetooth.getDevices();

    pairedDevicesList.innerHTML = ''; // Clear existing list
    if (devices.length === 0) {
      pairedDevicesList.innerHTML = '<li>No paired devices found.</li>';
      return;
    }

    devices.forEach((device) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${device.name || 'Unknown Device'} (${device.id})`;
      listItem.addEventListener('click', () => connectToDevice(device));
      pairedDevicesList.appendChild(listItem);
    });
  } catch (error) {
    console.error('[Bluetooth] Error fetching devices:', error);
  }
}

// Connect to a selected device
async function connectToDevice(device) {
  try {
    console.log(`[Bluetooth] Connecting to ${device.name || 'Unknown Device'} (${device.id})...`);
    const server = await device.gatt.connect();
    console.log('[Bluetooth] Connected to GATT server.');

    // Optional: Read services/characteristics
    const service = await server.getPrimaryService('battery_service');
    const characteristic = await service.getCharacteristic('battery_level');
    const value = await characteristic.readValue();
    console.log(`[Bluetooth] Battery level: ${value.getUint8(0)}%`);
  } catch (error) {
    console.error('[Bluetooth] Connection failed:', error);
  }
}

// Add event listener for refreshing devices
refreshDevicesButton.addEventListener('click', refreshPairedDevices);
document.addEventListener('DOMContentLoaded', refreshPairedDevices);
