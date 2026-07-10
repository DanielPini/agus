import { customCaptions, captions } from "./captions-data.js";
import { getSettings, onSettingsChange } from "./settings.js";
import { createPointerTracker } from "./pointer-tracker.js";
import { video, videoWrapper } from "./video.js";
let currentId = null;
let currentCaption = null;
let currentElement = null;
let currentTimeout = null;
let isPaused = false;
const pointerTracker = createPointerTracker();
function playCaption() {
    if (isPaused)
        return;
    const time = video.currentTime * 1000;
    const custom = customCaptions.find((c) => c.condition(pointerTracker.getState()));
    if (custom && currentId !== custom.id)
        createCaption(custom);
    else if (!currentId) {
        const currentMatch = captions.find((c) => c.timeStart < time && c.timeStart + c.duration > time);
        if (currentMatch) {
            createCaption(currentMatch);
        }
    }
    requestAnimationFrame(playCaption);
}
function createCaption(caption) {
    const { id, text, duration } = caption;
    if (currentTimeout)
        clearTimeout(currentTimeout);
    if (currentElement)
        currentElement.remove();
    currentId = id;
    currentCaption = caption;
    const rectangle = document.createElement("div");
    rectangle.classList.add("caption-container");
    rectangle.textContent = text[getSettings().language];
    videoWrapper.append(rectangle);
    currentElement = rectangle;
    currentTimeout = setTimeout(() => {
        rectangle.remove();
        currentId = null;
        currentCaption = null;
        currentElement = null;
        currentTimeout = null;
    }, duration);
}
export function initCaptionsPlayer() {
    playCaption();
    onSettingsChange((s) => {
        if (currentElement && currentCaption) {
            currentElement.textContent = currentCaption.text[s.language];
        }
    });
    video.addEventListener("pause", () => {
        isPaused = true;
    });
    video.addEventListener("play", () => {
        isPaused = false;
        playCaption();
    });
}
