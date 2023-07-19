let mouseX;
let mouseY;

function handleMouseMove(event) {
  // Get the mouse coordinates from the event object
  mouseX = event.clientX;
  mouseY = event.clientY;
}
// Step 1: Create an <img> element
const imgElement = document.createElement("img");

// Step 2: Set the image source
imgElement.src = chrome.runtime.getURL("assets/square.jpeg");
imgElement.id = "chasing-element";
// Step 3: Append the image to the body
document.body.appendChild(imgElement);
imgElement.style.width = "100px";
imgElement.style.height = "100px";
imgElement.style.position = "absolute";

document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("mousemove", function (event) {
  var element = document.getElementById("chasing-element");
  var xPos = mouseX - element.offsetWidth / 2;
  var yPos = mouseY - element.offsetHeight / 2;
  element.style.left = xPos + "px";
  element.style.top = yPos + "px";
});
