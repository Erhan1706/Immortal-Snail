let mouseX;
let mouseY;
let speed = 0.5;
let turned = false;
let dead = false;
let deathScreenCheck = true;

const snailSVG = chrome.runtime.getURL("assets/snail.svg");
let snail;
let chaseIntervalID;

/**
 * Fetches the SVG file and injects it into the DOM, then calls all the setup functions.
 */
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
    addAnimations();
    setupSnail();
    chaseIntervalID = setInterval(chase, 20);
  })
  .catch((error) => {
    console.error("Error fetching content:", error);
  });

/**
 * Set's up the snail's initial position and size, according to the stored swttings
 * or default ones if nothing is found in storage.
 */
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
/**
 * Adds the moving animations to the snail.
 */
function addAnimations() {
  const snailHead = document.getElementById("snailHead");
  const snailBody = document.getElementById("snailBody");
  const snailShell = document.getElementById("snailShell");
  snailHead.classList.add("snailHead");
  snailBody.classList.add("snailBody");
  snailShell.classList.add("snailShell");
}

/**
 * Removes the moving animations from the snail. Called when the snail touches the mouse.
 */
function removeAnimations() {
  const snailHead = document.getElementById("snailHead");
  const snailBody = document.getElementById("snailBody");
  const snailShell = document.getElementById("snailShell");
  snailHead.classList.remove("snailHead");
  snailBody.classList.remove("snailBody");
  snailShell.classList.remove("snailShell");
}
/**
 * Resets the snail to it's initial position, and resumes its movement functionality.
 * Also removes the death screen if it's present.
 */
function resetSnail() {
  snail.style.left = "0px";
  snail.style.top = "0px";
  turned = false;

  const deathScreen = document.getElementsByClassName("death-screen")[0];
  if (deathScreen) {
    deathScreen.remove();
  }

  dead = false;
  addAnimations();
  clearInterval(chaseIntervalID);
  chaseIntervalID = setInterval(chase, 20);
}

/**
 * Gets the mouse coordinates from the event object.
 * @param {MouseEvent} event the mouse event object
 */
function getCoordinates(event) {
  // Get the mouse coordinates from the event object
  mouseX = event.clientX;
  mouseY = event.clientY;
}
document.addEventListener("mousemove", getCoordinates);

/**
 * Chasing algorithm, to make the snail follow the mouse cursor. First it calculates
 * the distance between the snail and the mouse cursor, then adjusts the snail's position.
 */
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
  const thresholdDistance = lerp(
    parseFloat(snail.style.width),
    10,
    500,
    5,
    150
  );

  // Update the snail's position or detect if it's too close to mouse cursor.
  if (distance < thresholdDistance && !dead) {
    dead = true;
    if (deathScreenCheck) addDeathScreen();
    clearInterval(chaseIntervalID);
    removeAnimations();
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
/**
 * Linear interpolation to calculate an appropriate distance value to consider that the snail touched the
 * mouse cursor. The bigger the snail, the bigger the distance to consider is.
 * @param {number} value The value to interpolate
 * @param {number} inMin The minimum size of the snail possible (currently 10px)
 * @param {number} inMax The maximum size of the snail possible (currently 500px)
 * @param {number} outMin The minimum distance possible (currently 5px)
 * @param {number} outMax The maximum distance possible (currently 150px)
 * @returns {number} The interpolated distance value
 */
function lerp(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Adds a death screen to the page, whenever the snail touches the mouse cursor.
 */
function addDeathScreen() {
  const deathScreen = document.createElement("div");
  deathScreen.classList.add("death-screen");
  const deathText = document.createElement("div");
  deathText.classList.add("death-text");
  deathText.innerHTML = "YOU DIED";
  deathScreen.appendChild(deathText);
  document.body.appendChild(deathScreen);
}

/**
 * Saves the snail's position to localStorage
 */
function saveSnailPosition(left, top) {
  localStorage.setItem("snailPosition", JSON.stringify({ left, top }));
}

/**
 * Saves the snail's configs to localStorage
 * @param {number} speed the speed of the snail
 * @param {String} size the size of the snail, stored as string since it is the concatenation of the value and 'px'.
 * @param {boolean} enableDeathScreen the boolean to enable/disable the death screen
 */
function saveSnailConfigs(speed, size, enableDeathScreen) {
  localStorage.setItem(
    "snailConfigs",
    JSON.stringify({ speed, size, enableDeathScreen })
  );
}

/**
 * Get the snail's configs from localStorage
 * @returns the snail's configs (speed, size, and the boolean to enable/disable the death screen)
 */
function getSnailConfigs() {
  const storedConfigs = localStorage.getItem("snailConfigs");
  return storedConfigs ? JSON.parse(storedConfigs) : null;
}

/**
 * Get the snail's position from localStorage
 * @returns the snail's position (left and top)
 */
function getSnailPosition() {
  const storedPosition = localStorage.getItem("snailPosition");
  return storedPosition ? JSON.parse(storedPosition) : null;
}

// Save the snail's position before unloading the page
window.addEventListener("beforeunload", () => {
  saveSnailPosition(snail.style.left, snail.style.top);
});

/**
 * Handles the messages received from the popup html and the service worker. According to the
 * type of the message different actions are taken.
 * @param {*} message the message received
 * @param {*} sender the sender of the message
 * @param {*} sendResponse the response to the message
 */
function handleMessage(message, sender, sendResponse) {
  const { type, speedValue, sizeValue, deathScreenCheck } = message;
  switch (type) {
    case "CONFIG":
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

/**
 * Function to handle the config values received from the popup html
 * @param {*} speedValue the speed of the snail
 * @param {*} sizeValue the size of the snail
 * @param {*} enableDeathScreen the boolean to enable/disable the death screen
 */
function handleConfigOptions(speedValue, sizeValue, enableDeathScreen) {
  speed = speedValue;
  snail.style.width = sizeValue + "px";
  snail.style.height = sizeValue + "px";
  deathScreenCheck = enableDeathScreen;
  saveSnailConfigs(speedValue, sizeValue + "px", enableDeathScreen);
}

chrome.runtime.onMessage.addListener(handleMessage);
