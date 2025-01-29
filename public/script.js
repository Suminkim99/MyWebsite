const ws = new WebSocket("ws://localhost:8080");

const controlTD = document.querySelector(".controlTD");
const controlledByTD = document.querySelector(".controlledByTD");

// WebSocket 연결
ws.onopen = () => {
  console.log("WebSocket connected");
};

// WebSocket 메시지 수신
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);

  if (data.slider1 !== undefined) {
    controlledByTD.value = data.slider1;
  }
};

// 슬라이더 이벤트
controlTD.addEventListener("input", () => {
  const value = controlTD.value;
  ws.send(JSON.stringify({ slider1: value }));
});
