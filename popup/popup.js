import { getActiveTabURL } from "../scripts/utils.js";

const speedSlider = document.getElementById("speedSlider");
const speedDisplay = document.getElementById("speedDisplay");
speedDisplay.textContent = speedSlider.value;

const sizeSlider = document.getElementById("sizeSlider");
const sizeDisplay = document.getElementById("sizeDisplay");
sizeDisplay.textContent = sizeSlider.value;

function saveSliderValues(speedValue, sizeValue) {
  chrome.storage.local.set({
    speedValue: speedValue,
    sizeValue: sizeValue,
  });
}

function getSliderValues(callback) {
  chrome.storage.local.get(
    {
      speedValue: 0.5,
      sizeValue: 100,
    },
    function (data) {
      callback(data.speedValue, data.sizeValue);
    }
  );
}

speedSlider.addEventListener("input", function () {
  speedDisplay.textContent = speedSlider.value;
  sendMessageToContentScript({
    speed: speedSlider.value,
    size: sizeSlider.value,
  });
  speedSlider.value = speedSlider.value;
  saveSliderValues(speedSlider.value, sizeSlider.value);
});

sizeSlider.addEventListener("input", function () {
  sizeDisplay.textContent = sizeSlider.value;
  sendMessageToContentScript({
    speed: speedSlider.value,
    size: sizeSlider.value,
  });
  saveSliderValues(speedSlider.value, sizeSlider.value);
});

async function sendMessageToContentScript(value) {
  const activeTab = await getActiveTabURL();
  chrome.tabs.sendMessage(activeTab, {
    speedValue: value.speed,
    sizeValue: value.size,
  });
}

// On load get the previous slider values from storage
document.addEventListener("DOMContentLoaded", function () {
  getSliderValues(function (speedValue, sizeValue) {
    speedSlider.value = speedValue;
    speedDisplay.textContent = speedValue;
    sizeSlider.value = sizeValue;
    sizeDisplay.textContent = sizeValue;
  });
});
