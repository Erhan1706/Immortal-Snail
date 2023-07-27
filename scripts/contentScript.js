let mouseX;
let mouseY;
let speed = 0.5;
let turned = false;

const snailContainer = document.createElement("div");
snailContainer.classList.add("snail-container");
document.body.appendChild(snailContainer);
const snailSVG = chrome.runtime.getURL("assets/snail.svg");
let snail;

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
    setInterval(chase, 10);
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
  if (!turned && mouseX < snailRect.left) {
    snail.classList.add("turnSnail");
    turned = true;
  } else if (turned && mouseX > snailRect.left) {
    snail.classList.remove("turnSnail");
    turned = false;
  } else {
    snail.style.left = snailRect.left + stepX + "px";
    snail.style.top = snailRect.top + stepY + "px";
  }
}

document.addEventListener("mousemove", getCoordinates);

// Function to handle the config values received from popup
function handleConfigOptions(message) {
  speed = message.speedValue;
  snail.style.width = message.sizeValue + "px";
  snail.style.height = message.sizeValue + "px";
}

chrome.runtime.onMessage.addListener(handleConfigOptions);
