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

// Fetch available Bluetooth devices (alternative to getDevices)
refreshDevicesButton.addEventListener("click", async () => {
  try {
    console.log("[Bluetooth] Requesting a device...");
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["battery_service"],
    });

    // Clear the list and show the selected device
    pairedDevicesList.innerHTML = "";
    const listItem = document.createElement("li");
    listItem.textContent = `${device.name || "Unknown Device"} (${device.id})`;
    listItem.addEventListener("click", () => connectToDevice(device));
    pairedDevicesList.appendChild(listItem);
    console.log("[Bluetooth] Selected device:", device);
  } catch (error) {
    console.error("[Bluetooth] Error requesting device:", error);
  }
});

// Connect to a specific device
function connectToDevice(device) {
  device.gatt
    .connect()
    .then((server) => {
      console.log(`[Bluetooth] Connected to device: ${device.name}`);
    })
    .catch((error) => console.error("[Bluetooth] Error connecting to device:", error));
}
