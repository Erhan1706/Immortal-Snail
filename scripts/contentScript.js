let mouseX;
let mouseY;
let speed = 0.5;
let turned = false;
let dead = false;
let deathScreenCheck = true;

const snailContainer = document.createElement("div");
snailContainer.classList.add("snail-container");
document.body.appendChild(snailContainer);
const snailSVG = chrome.runtime.getURL("assets/snail.svg");
let snail;
let chaseIntervalID;

// Inject the SVG directly into the DOM
fetch(snailSVG)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Error injecting SVG: " + response.statusText);
    }
    return response.text();
  })
  .then((htmlContent) => {
    const svgText = new DOMParser().parseFromString(htmlContent, "text/xml");
    const importedNode = document.importNode(svgText.documentElement, true); // Import the SVG into the current document
    document.body.appendChild(importedNode);
    snail = document.getElementById("snail");
    setupSnail();
    chaseIntervalID = setInterval(chase, 20);
  })
  .catch((error) => {
    console.error("Error fetching content:", error);
  });

function setupSnail() {
  const position = getSnailPosition();
  if (position) {
    snail.style.left = position.left;
    snail.style.top = position.top;
  } else {
    snail.style.left = "0px";
    snail.style.top = "0px";
  }
  const configs = getSnailConfigs();
  if (configs) {
    snail.style.width = configs.size;
    snail.style.height = configs.size;
    speed = configs.speed ? configs.speed : 0.5;
    deathScreenCheck = configs.enableDeathScreen;
  } else {
    snail.style.width = "100px";
    snail.style.height = "100px";
  }
}

function resetSnail() {
  snail.style.left = "0px";
  snail.style.top = "0px";
  turned = false;
  dead = false;
  clearInterval(chaseIntervalID);
  chaseIntervalID = setInterval(chase, 20);
}

function getCoordinates(event) {
  // Get the mouse coordinates from the event object
  mouseX = event.clientX;
  mouseY = event.clientY;
}

function chase() {
  if (!snail) return;
  const snailRect = snail.getBoundingClientRect();
  // Calculate the distance between the snail and the mouse cursor
  const dx = mouseX - (snailRect.left + snailRect.width / 2);
  const dy = mouseY - (snailRect.top + snailRect.height / 2);

  // Calculate the distance to move in each step (adjusting speed)
  const distance = Math.sqrt(dx * dx + dy * dy);
  const stepX = (speed / distance) * dx;
  const stepY = (speed / distance) * dy;

  // Update the snail's position
  if (distance < 20 && !dead) {
    dead = true;
    if (deathScreenCheck) addDeathScreen();
    clearInterval(chaseIntervalID);
  } else if (!turned && mouseX < snailRect.left) {
    snail.classList.add("turnSnail");
    snail.style.left = snailRect.left + stepX - 20 + "px";
    turned = true;
  } else if (turned && mouseX > snailRect.left) {
    snail.classList.remove("turnSnail");
    turned = false;
  } else {
    snail.style.left = snailRect.left + stepX + "px";
    snail.style.top = snailRect.top + stepY + "px";
    saveSnailPosition(snail.style.left, snail.style.top);
  }
}
document.addEventListener("mousemove", getCoordinates);

function addDeathScreen() {
  const deathScreen = document.createElement("div");
  deathScreen.classList.add("death-screen");
  const deathText = document.createElement("div");
  deathText.classList.add("death-text");
  deathText.innerHTML = "YOU DIED";
  deathScreen.appendChild(deathText);
  document.body.appendChild(deathScreen);
}

function saveSnailPosition(left, top) {
  localStorage.setItem("snailPosition", JSON.stringify({ left, top }));
}

function saveSnailConfigs(speed, size, enableDeathScreen) {
  localStorage.setItem(
    "snailConfigs",
    JSON.stringify({ speed, size, enableDeathScreen })
  );
}

function getSnailConfigs() {
  const storedConfigs = localStorage.getItem("snailConfigs");
  console.log(storedConfigs);
  return storedConfigs ? JSON.parse(storedConfigs) : null;
}

// Function to get the snail's position from localStorage
function getSnailPosition() {
  const storedPosition = localStorage.getItem("snailPosition");
  console.log(storedPosition);
  return storedPosition ? JSON.parse(storedPosition) : null;
}

// Save the snail's position before unloading the page
window.addEventListener("beforeunload", () => {
  saveSnailPosition(snail.style.left, snail.style.top);
});

function handleMessage(message, sender, sendResponse) {
  const { type, speedValue, sizeValue, deathScreenCheck } = message;
  switch (type) {
    case "CONFIG":
      console.log(speedValue, sizeValue, deathScreenCheck);
      handleConfigOptions(speedValue, sizeValue, deathScreenCheck);
      break;
    case "TAB_UPDATED":
      setupSnail();
      break;
    case "RESET":
      resetSnail();
      break;
  }
}

// Function to handle the config values received from popup
function handleConfigOptions(speedValue, sizeValue, enableDeathScreen) {
  speed = speedValue;
  snail.style.width = sizeValue + "px";
  snail.style.height = sizeValue + "px";
  deathScreenCheck = enableDeathScreen;
  saveSnailConfigs(speedValue, sizeValue + "px", enableDeathScreen);
}

chrome.runtime.onMessage.addListener(handleMessage);
