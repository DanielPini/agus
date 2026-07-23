import { customCaptions, captions, captionsLoop2 } from "./captions-data.js";
import type { CustomCaption, Caption } from "./captions-types.js";
import { getSettings, onSettingsChange } from "./settings.js";
import { createPointerTracker } from "./pointer-tracker.js";
import { videoPlayer, videoWrapper } from "./video.js";

let currentId: number | null = null;
let currentCaption: Caption | CustomCaption | null = null;
let currentElement: HTMLDivElement | null = null;
let currentTimeout: ReturnType<typeof setTimeout> | null = null;
let isPaused = false;

const pointerTracker = createPointerTracker();

// Odd loops (1st, 3rd, ...) use `captions`; even loops (2nd, 4th, ...) use
// `captionsLoop2` — the two sets are written as call-and-response pairs.
function getActiveCaptions(): Caption[] {
  return videoPlayer.getLoopCount() % 2 === 1 ? captions : captionsLoop2;
}

function playCaption() {
  if (isPaused) return;
  const time = videoPlayer.getCurrentTime() * 1000;

  const custom = customCaptions.find((c) => c.condition(pointerTracker.getState()));
  if (custom && currentId !== custom.id) createCaption(custom);
  else if (!currentId) {
    const currentMatch = getActiveCaptions().find(
      (c) => c.timeStart < time && c.timeStart + c.duration > time,
    );
    if (currentMatch) {
      createCaption(currentMatch);
    }
  }

  requestAnimationFrame(playCaption);
}

function createCaption(caption: Caption | CustomCaption) {
  const { id, text, duration } = caption;

  if (currentTimeout) clearTimeout(currentTimeout);
  if (currentElement) currentElement.remove();

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

  videoPlayer.onPause(() => {
    isPaused = true;
  });
  videoPlayer.onPlay(() => {
    isPaused = false;
    playCaption();
  });

  videoPlayer.onLoop(() => {
    if (currentTimeout) clearTimeout(currentTimeout);
    if (currentElement) currentElement.remove();
    currentId = null;
    currentCaption = null;
    currentElement = null;
    currentTimeout = null;
  });
}
