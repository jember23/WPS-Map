const map = document.getElementById("map");

let scale = 1;
let posX = 0;
let posY = 0;
let isPanning = false;
let startX, startY;

// For pinch zoom
let initialDistance = null;
let initialScale = 1;

// Zoom limits
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

// Get original map size from CSS (must match styles.css)
const MAP_WIDTH = 2000;  // replace with your actual image width
const MAP_HEIGHT = 900; // replace with your actual image height

function updateTransform() {
  clampPosition();
  map.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) scale(${scale})`;
}

function clampScale(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function clampPosition() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const scaledWidth = MAP_WIDTH * scale;
  const scaledHeight = MAP_HEIGHT * scale;

  // Half-dimensions
  const halfViewportW = viewportWidth / 2;
  const halfViewportH = viewportHeight / 2;
  const halfMapW = scaledWidth / 2;
  const halfMapH = scaledHeight / 2;

  // Max offset allowed
  const maxOffsetX = Math.max(0, halfMapW - halfViewportW);
  const maxOffsetY = Math.max(0, halfMapH - halfViewportH);

  if (posX > maxOffsetX) posX = maxOffsetX;
  if (posX < -maxOffsetX) posX = -maxOffsetX;
  if (posY > maxOffsetY) posY = maxOffsetY;
  if (posY < -maxOffsetY) posY = -maxOffsetY;
}

// Mouse wheel zoom
map.addEventListener("wheel", e => {
  e.preventDefault();
  const zoomSpeed = 0.1;
  if (e.deltaY < 0) {
    scale *= 1 + zoomSpeed;
  } else {
    scale *= 1 - zoomSpeed;
  }
  scale = clampScale(scale);
  updateTransform();
});

// Mouse panning
map.addEventListener("mousedown", e => {
  isPanning = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;
});

document.addEventListener("mousemove", e => {
  if (!isPanning) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  updateTransform();
});

document.addEventListener("mouseup", () => {
  isPanning = false;
});

// Touch handling
map.addEventListener("touchstart", e => {
  if (e.touches.length === 1) {
    // single finger → pan
    isPanning = true;
    startX = e.touches[0].clientX - posX;
    startY = e.touches[0].clientY - posY;
  } else if (e.touches.length === 2) {
    // two fingers → pinch zoom
    isPanning = false;
    initialDistance = getDistance(e.touches[0], e.touches[1]);
    initialScale = scale;
  }
});

map.addEventListener("touchmove", e => {
  e.preventDefault();
  if (e.touches.length === 1 && isPanning) {
    // Pan
    posX = e.touches[0].clientX - startX;
    posY = e.touches[0].clientY - startY;
    updateTransform();
  } else if (e.touches.length === 2) {
    // Pinch zoom
    const newDistance = getDistance(e.touches[0], e.touches[1]);
    const zoomFactor = newDistance / initialDistance;
    scale = clampScale(initialScale * zoomFactor);
    updateTransform();
  }
}, { passive: false });

map.addEventListener("touchend", e => {
  if (e.touches.length === 0) {
    isPanning = false;
    initialDistance = null;
  }
});

// Helpers
function getDistance(touch1, touch2) {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.hypot(dx, dy);
}

// Re-clamp position if window resizes
window.addEventListener("resize", updateTransform);
