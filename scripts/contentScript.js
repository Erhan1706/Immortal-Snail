let mouseX;
let mouseY;

let snailX;
let snailY;

const speed = 10;

const snail = document.createElement("img");
snail.src = chrome.runtime.getURL("assets/square.jpeg");
snail.id = "chasing-element";
document.body.appendChild(snail);

snail.style.width = "100px";
snail.style.height = "100px";
snail.style.position = "absolute";

snail.style.left = "0px";
snail.style.top = "0px";

snailX = 0;
snailY = 0;

function getCoordinates(event) {
  // Get the mouse coordinates from the event object
  mouseX = event.clientX;
  mouseY = event.clientY;
}

function chase(event) {
  const xPos = mouseX - snail.offsetWidth / 2;
  const yPos = mouseY - snail.offsetHeight / 2;

  const currentX = parseInt(snail.style.left);
  const currentY = parseInt(snail.style.top);

  const dx = xPos - currentX;
  const dy = yPos - currentY;

  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= speed) {
    snail.style.left = xPos + "px";
    snail.style.top = yPos + "px";
  } else {
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    snail.style.left = currentX + vx + "px";
    snail.style.top = currentY + vy + "px";
  }
}
setInterval(chase, 10);
document.addEventListener("mousemove", getCoordinates);
//document.addEventListener("mousemove", chase);
