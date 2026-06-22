import { customCaptions, captions, } from "./captions.js";
let state = {
    directionX: "none",
    directionY: "none",
    position: { x: 0, y: 0 },
    speed: 0,
};
const videoWrapper = document.querySelector(".video-wrapper");
const video = document.querySelector("video");
let currentId = null;
let isPaused = false;
function playCaption() {
    if (isPaused)
        return;
    const time = video.currentTime * 1000;
    const custom = customCaptions.find((c) => c.condition(state));
    if (custom && currentId !== custom.id)
        createCaption(custom);
    else if (!currentId) {
        const currentCaption = captions.find((c) => c.timeStart < time && c.timeStart + c.duration > time);
        if (currentCaption) {
            createCaption(currentCaption);
        }
    }
    requestAnimationFrame(playCaption);
}
playCaption();
function createCaption(caption) {
    const { id, text, duration } = caption;
    currentId = id;
    const rectangle = document.createElement("div");
    rectangle.classList.add("caption-container");
    rectangle.textContent = text;
    videoWrapper.append(rectangle);
    setTimeout(() => {
        rectangle.remove();
        currentId = null;
    }, duration);
}
video.addEventListener("pause", () => {
    isPaused = true;
});
video.addEventListener("play", () => {
    isPaused = false;
    playCaption();
});
let lastX = 0;
let lastY = 0;
let lastTime = 0;
window.addEventListener("mousemove", (e) => {
    const time = e.timeStamp;
    const currentX = e.x;
    const currentY = e.y;
    const dx = currentX - lastX;
    const dy = currentY - lastY;
    const dt = time - lastTime;
    const hyp = Math.sqrt(dx * dx + dy * dy);
    const speed = hyp / dt;
    lastX = currentX;
    lastY = currentY;
    lastTime = time;
    state = {
        directionX: dx > 0 ? "right" : dx < 0 ? "left" : "none",
        directionY: dy > 0 ? "down" : dy < 0 ? "up" : "none",
        position: { x: lastX, y: lastY },
        speed: speed,
    };
});
const videoContainer = document.querySelector(".video-container");
const playButton = document.querySelector(".play-button");
playButton.addEventListener("click", () => {
    console.log("clicked");
    videoContainer.classList.toggle("show");
});
videoContainer.addEventListener("click", (e) => {
    if (e.target !== videoWrapper) {
        videoContainer.classList.toggle("show");
    }
});
console.log("Got to the end of the file");
