let mouseX;
let mouseY;
let speed = 0.5;
let turned = false;
let dead = false;

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
    snail.style.width = "100px";
    snail.style.height = "100px";
    snail.style.left = "0px";
    snail.style.top = "0px";
    snail.style.position = "absolute";
    chaseIntervalID = setInterval(chase, 10);
  })
  .catch((error) => {
    console.error("Error fetching content:", error);
  });

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
  if (
    Math.abs(mouseX - snailRect.left) < 50 &&
    Math.abs(mouseY - snailRect.top) < 50 &&
    !dead
  ) {
    dead = true;
    addDeathScreen();
    clearInterval(chaseIntervalID);
  } else if (!turned && mouseX < snailRect.left) {
    snail.classList.add("turnSnail");
    turned = true;
  } else if (turned && mouseX > snailRect.left) {
    snail.classList.remove("turnSnail");
    turned = false;
  } else {
    snail.style.left = snailRect.left + stepX + "px";
    snail.style.top = snailRect.top + stepY + "px";
  }
  //console.log("MouseX: " + mouseX + " MouseY: " + mouseY);
  //console.log("SnailX: " + snailRect.left + " SnailY: " + snailRect.top);
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

// Function to handle the config values received from popup
function handleConfigOptions(message) {
  speed = message.speedValue;
  snail.style.width = message.sizeValue + "px";
  snail.style.height = message.sizeValue + "px";
}

chrome.runtime.onMessage.addListener(handleConfigOptions);
