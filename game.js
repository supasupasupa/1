const cameraData = [
  ["CAM 01", "Party Hall", "Paper hats stare back at you from dusty tables."],
  ["CAM 02", "Main Hall", "An endoskeleton silhouette freezes as static stutters."],
  ["CAM 03", "Game Area", "Arcade lights flicker without power."],
  ["CAM 04", "Stage", "Mascot heads lean at odd angles under dim bulbs."],
  ["CAM 05", "Backroom", "A music box tune hums through cracked speakers."],
  ["CAM 06", "Vent Left", "A scrape echoes deep in the vent shaft."],
  ["CAM 07", "Vent Right", "You hear metal claws tap and then stop."],
  ["CAM 08", "Prize Corner", "The puppet box sways. Keep it wound."],
];

const state = {
  secondsSurvived: 0,
  totalSecondsToWin: 180,
  power: 100,
  musicBox: 100,
  threat: 0,
  selectedCam: 0,
  camerasOpen: false,
  winding: false,
  ended: false,
};

const timeText = document.querySelector("#timeText");
const powerText = document.querySelector("#powerText");
const windText = document.querySelector("#windText");
const threatText = document.querySelector("#threatText");
const cameraToggle = document.querySelector("#cameraToggle");
const cameraOverlay = document.querySelector("#cameraOverlay");
const closeCamera = document.querySelector("#closeCamera");
const cameraGrid = document.querySelector("#cameraGrid");
const cameraLabel = document.querySelector("#cameraLabel");
const cameraFlavor = document.querySelector("#cameraFlavor");
const windButton = document.querySelector("#windButton");
const endOverlay = document.querySelector("#endOverlay");
const endTitle = document.querySelector("#endTitle");
const endMessage = document.querySelector("#endMessage");
const restartButton = document.querySelector("#restartButton");

function setupCameras() {
  cameraData.forEach((cam, index) => {
    const button = document.createElement("button");
    button.className = "cam-btn";
    button.textContent = cam[0];
    button.addEventListener("click", () => {
      state.selectedCam = index;
      renderCamera();
    });
    cameraGrid.appendChild(button);
  });
}

function renderCamera() {
  const [id, name, flavor] = cameraData[state.selectedCam];
  cameraLabel.textContent = `${id} - ${name}`;
  cameraFlavor.textContent = flavor;
  [...cameraGrid.children].forEach((btn, index) => {
    btn.classList.toggle("active", index === state.selectedCam);
  });
}

function updateHud() {
  const hour = 12 + Math.floor((state.secondsSurvived / state.totalSecondsToWin) * 6);
  const displayHour = hour > 12 ? hour - 12 : hour;
  const suffix = hour >= 12 && hour < 24 ? "AM" : "PM";

  timeText.textContent = `${displayHour}:00 ${suffix}`;
  powerText.textContent = `Power: ${Math.max(0, state.power).toFixed(0)}%`;
  windText.textContent = `Music Box: ${Math.max(0, state.musicBox).toFixed(0)}%`;

  let threatLevel = "Low";
  if (state.threat > 35) threatLevel = "Medium";
  if (state.threat > 70) threatLevel = "HIGH";
  threatText.textContent = `Threat: ${threatLevel}`;
  threatText.style.color = state.threat > 70 ? "#ff4d5a" : "#e7ecf3";
}

function gameOver(title, message) {
  state.ended = true;
  endTitle.textContent = title;
  endMessage.textContent = message;
  endOverlay.classList.remove("hidden");
}

function tick() {
  if (state.ended) return;

  state.secondsSurvived += 1;

  const powerDrain = state.camerasOpen ? 0.9 : 0.35;
  const threatRise = state.camerasOpen ? 0.45 : 1.1;

  state.power -= powerDrain;
  state.threat = Math.min(100, state.threat + threatRise);

  state.musicBox -= 1.6;
  if (state.camerasOpen && state.selectedCam === 7 && state.winding) {
    state.musicBox = Math.min(100, state.musicBox + 4.8);
  }

  if (!state.camerasOpen && state.threat > 50) {
    state.threat += 0.7;
  }

  if (state.musicBox <= 0) {
    gameOver("Jumpscare!", "The puppet got out because the music box ran down.");
  } else if (state.power <= 0) {
    gameOver("Power Out", "Everything goes dark. Something is in the office with you.");
  } else if (state.threat >= 100) {
    gameOver("Caught", "You stayed exposed for too long and got caught.");
  } else if (state.secondsSurvived >= state.totalSecondsToWin) {
    gameOver("6:00 AM", "You made it through the shift. Barely.");
  }

  updateHud();
}

cameraToggle.addEventListener("click", () => {
  state.camerasOpen = true;
  cameraOverlay.classList.remove("hidden");
});

closeCamera.addEventListener("click", () => {
  state.camerasOpen = false;
  cameraOverlay.classList.add("hidden");
});

const windStart = () => { state.winding = true; };
const windStop = () => { state.winding = false; };
windButton.addEventListener("mousedown", windStart);
windButton.addEventListener("touchstart", windStart, { passive: true });
window.addEventListener("mouseup", windStop);
window.addEventListener("touchend", windStop);

restartButton.addEventListener("click", () => {
  window.location.reload();
});

setupCameras();
renderCamera();
updateHud();
setInterval(tick, 1000);
