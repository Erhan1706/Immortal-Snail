import { getActiveTabURL } from "../scripts/utils.js";

const speedSlider = document.getElementById("speedSlider");
const speedDisplay = document.getElementById("speedDisplay");
speedDisplay.value = speedSlider.value;

const sizeSlider = document.getElementById("sizeSlider");
const sizeDisplay = document.getElementById("sizeDisplay");
sizeDisplay.value = sizeSlider.value;

const deathScreenCheckbox = document.getElementById("deathScreenCheck");

function saveConfigValues(speedValue, sizeValue, deathScreenCheck) {
  chrome.storage.local.set({
    speedValue: speedValue,
    sizeValue: sizeValue,
    deathScreenCheck: deathScreenCheck,
  });
}

function getConfigValues(callback) {
  chrome.storage.local.get(
    {
      speedValue: 0.5,
      sizeValue: 100,
      deathScreenCheck: true,
    },
    function (data) {
      callback(data.speedValue, data.sizeValue, data.deathScreenCheck);
    }
  );
}

speedSlider.addEventListener("input", function () {
  speedDisplay.value = speedSlider.value;
  sendMessageToContentScript({
    speed: speedSlider.value,
    size: sizeSlider.value,
    deathScreenCheck: deathScreenCheckbox.checked,
  });
  saveConfigValues(
    speedSlider.value,
    sizeSlider.value,
    deathScreenCheckbox.checked
  );
});

speedDisplay.addEventListener("input", function () {
  speedSlider.value = speedDisplay.value;
  sendMessageToContentScript({
    speed: speedSlider.value,
    size: sizeSlider.value,
    deathScreenCheck: deathScreenCheckbox.checked,
  });
});

sizeSlider.addEventListener("input", function () {
  sizeDisplay.value = sizeSlider.value;
  sendMessageToContentScript({
    speed: speedSlider.value,
    size: sizeSlider.value,
    deathScreenCheck: deathScreenCheckbox.checked,
  });
  saveConfigValues(
    speedSlider.value,
    sizeSlider.value,
    deathScreenCheckbox.checked
  );
});

sizeDisplay.addEventListener("input", function () {
  sizeSlider.value = sizeDisplay.value;
  sendMessageToContentScript({
    speed: speedSlider.value,
    size: sizeSlider.value,
    deathScreenCheck: deathScreenCheckbox.checked,
  });
});

deathScreenCheckbox.addEventListener("change", function () {
  sendMessageToContentScript({
    speed: speedSlider.value,
    size: sizeSlider.value,
    deathScreenCheck: deathScreenCheckbox.checked,
  });
  saveConfigValues(
    speedSlider.value,
    sizeSlider.value,
    deathScreenCheckbox.checked
  );
});

async function sendMessageToContentScript(value) {
  const activeTab = await getActiveTabURL();
  chrome.tabs.sendMessage(activeTab, {
    type: "CONFIG",
    speedValue: value.speed,
    sizeValue: value.size,
    deathScreenCheck: value.deathScreenCheck,
  });
}

// On load get the previous slider values from storage
document.addEventListener("DOMContentLoaded", function () {
  getConfigValues(function (speedValue, sizeValue, deathScreenCheck) {
    speedSlider.value = speedValue;
    speedDisplay.value = speedValue;
    sizeSlider.value = sizeValue;
    sizeDisplay.value = sizeValue;
    deathScreenCheckbox.checked = deathScreenCheck;
  });
});

const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", async function () {
  const activeTab = await getActiveTabURL();
  chrome.tabs.sendMessage(activeTab, {
    type: "RESET",
  });
});
