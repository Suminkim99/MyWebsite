const ws = new WebSocket("wss://hodoonamu-bbd19873c971.herokuapp.com/");
const sliderControl = document.getElementById("sliderControl");
const sliderFeedback = document.getElementById("sliderFeedback");
const pairedDevicesList = document.getElementById("pairedDevices");
const refreshDevicesButton = document.getElementById("refreshDevices");

// Initialize WebSocket connection
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

// Send slider control data
sliderControl.addEventListener("input", () => {
  const value = sliderControl.value / 100;
  const data = { sliderValue: value };
  ws.send(JSON.stringify(data));
  console.log("Sent to server:", data);
});

// Fetch only paired Bluetooth devices
refreshDevicesButton.addEventListener("click", () => {
  navigator.bluetooth.getDevices()
    .then((devices) => {
      pairedDevicesList.innerHTML = "";
      devices.forEach((device) => {
        const listItem = document.createElement("li");
        listItem.textContent = device.name || "Unknown Device";
        listItem.addEventListener("click", () => connectToDevice(device));
        pairedDevicesList.appendChild(listItem);
      });

      if (devices.length === 0) {
        pairedDevicesList.textContent = "No paired devices found.";
      }
    })
    .catch((error) => console.error("Error fetching paired devices:", error));
});

// Connect to a specific paired device
function connectToDevice(device) {
  device.gatt.connect()
    .then((server) => {
      console.log(`Connected to ${device.name}`);
    })
    .catch((error) => console.error("Error connecting to device:", error));
}
