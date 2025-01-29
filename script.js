// WebSocket setup
const ws = new WebSocket("wss://hodoonamu-bbd19873c971.herokuapp.com/");
const sliderControl = document.getElementById("sliderControl");
const sliderFeedback = document.getElementById("sliderFeedback");
const pairedDevicesList = document.getElementById("pairedDevices");
const refreshDevicesButton = document.getElementById("refreshDevices");

// WebSocket connection events
ws.onopen = () => {
  console.log("WebSocket connected to:", ws.url);
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log("Received from server:", data);

    if ("sliderValue" in data) {
      sliderFeedback.value = data.sliderValue * 100;
    }
  } catch (error) {
    console.error("Error parsing WebSocket message:", error);
  }
};

ws.onclose = () => {
  console.log("WebSocket disconnected.");
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

// Slider control event
sliderControl.addEventListener("input", () => {
  const value = sliderControl.value / 100;
  const data = { sliderValue: value };
  ws.send(JSON.stringify(data));
  console.log("Sent to server:", data);
});

// Bluetooth: Fetch paired devices
refreshDevicesButton.addEventListener("click", async () => {
  pairedDevicesList.innerHTML = "";
  try {
    const devices = await navigator.bluetooth.getDevices();
    if (devices.length === 0) {
      const noDevicesItem = document.createElement("li");
      noDevicesItem.textContent = "No paired devices found.";
      pairedDevicesList.appendChild(noDevicesItem);
    } else {
      devices.forEach((device) => {
        const deviceItem = document.createElement("li");
        deviceItem.textContent = `${device.name || "Unknown Device"} (${device.id})`;
        deviceItem.addEventListener("click", () => connectToDevice(device));
        pairedDevicesList.appendChild(deviceItem);
      });
    }
  } catch (error) {
    console.error("Error fetching paired devices:", error);
    const errorItem = document.createElement("li");
    errorItem.textContent = "Error fetching devices. Check browser support.";
    pairedDevicesList.appendChild(errorItem);
  }
});

// Bluetooth: Connect to a device
async function connectToDevice(device) {
  try {
    const server = await device.gatt.connect();
    console.log(`Connected to device: ${device.name}`);
    // Add additional device-specific logic here if needed
  } catch (error) {
    console.error(`Error connecting to device: ${device.name}`, error);
  }
}
