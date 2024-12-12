let player;
const videoInput = document.getElementById("video-url");
const loadButton = document.getElementById("load-video");
const markButton = document.getElementById("mark-time");
const timestampsList = document.getElementById("timestamps");
const keyBindings = {};

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "390",
    width: "640",
  });
}

loadButton.addEventListener("click", () => {
  const url = videoInput.value;
  const videoId = extractVideoId(url);
  if (videoId) {
    player.loadVideoById(videoId);
  } else {
    alert("Invalid YouTube URL");
  }
});

function extractVideoId(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:.*v=)?([^#&?\n]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function addTimestamp() {
  const currentTime = player.getCurrentTime();
  const listItem = document.createElement("li");

  const timeLabel = document.createElement("span");
  timeLabel.textContent = formatTime(currentTime) + " ";

  // Add time adjustment buttons
  const minusButton = document.createElement("button");
  minusButton.textContent = "-";
  minusButton.onclick = () => adjustTime(keyInput, -0.05);

  const plusButton = document.createElement("button");
  plusButton.textContent = "+";
  plusButton.onclick = () => adjustTime(keyInput, 0.05);

  // Add speed display and control buttons
  const speedLabel = document.createElement("span");
  speedLabel.textContent = "1.0x ";

  const speedDownButton = document.createElement("button");
  speedDownButton.textContent = "↓";
  speedDownButton.onclick = () => adjustSpeed(keyInput, -0.1);

  const speedUpButton = document.createElement("button");
  speedUpButton.textContent = "↑";
  speedUpButton.onclick = () => adjustSpeed(keyInput, 0.1);

  // Add remove button
  const removeButton = document.createElement("button");
  removeButton.textContent = "×";
  removeButton.onclick = () => {
    delete keyBindings[keyInput.value.toLowerCase()];
    listItem.remove();
  };

  const keyInput = document.createElement("input");
  keyInput.type = "text";
  keyInput.placeholder = "Key";
  keyInput.maxLength = 1;
  keyInput.dataset.time = currentTime;
  keyInput.dataset.speed = "1.0";

  listItem.appendChild(timeLabel);
  listItem.appendChild(minusButton);
  listItem.appendChild(plusButton);
  listItem.appendChild(speedLabel);
  listItem.appendChild(speedDownButton);
  listItem.appendChild(speedUpButton);
  listItem.appendChild(keyInput);
  listItem.appendChild(removeButton);
  timestampsList.appendChild(listItem);

  keyInput.addEventListener("change", () => {
    const key = keyInput.value;
    if (key) {
      keyBindings[key.toLowerCase()] = {
        time: parseFloat(keyInput.dataset.time),
        speed: parseFloat(keyInput.dataset.speed),
      };
    }
  });
}

function adjustTime(keyInput, adjustment) {
  const newTime = parseFloat(keyInput.dataset.time) + adjustment;
  keyInput.dataset.time = newTime;
  if (keyInput.value) {
    keyBindings[keyInput.value.toLowerCase()].time = newTime;
  }
  keyInput.parentElement.querySelector("span").textContent =
    formatTime(newTime) + " ";
}

function adjustSpeed(keyInput, adjustment) {
  const newSpeed = Math.max(
    0.1,
    Math.round((parseFloat(keyInput.dataset.speed) + adjustment) * 10) / 10,
  );
  keyInput.dataset.speed = newSpeed;
  if (keyInput.value) {
    keyBindings[keyInput.value.toLowerCase()].speed = newSpeed;
  }
  keyInput.parentElement.querySelectorAll("span")[1].textContent =
    newSpeed.toFixed(1) + "x ";
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  const ms = Math.floor((seconds % 1) * 100)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}.${ms}`;
}

markButton.addEventListener("click", addTimestamp);

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "m") {
    addTimestamp();
    return;
  }

  if (event.key.toLowerCase() === " ") {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    return;
  }

  const binding = keyBindings[event.key.toLowerCase()];
  if (binding) {
    player.seekTo(binding.time, true);
    player.setPlaybackRate(binding.speed);
    player.playVideo();
  }
});
