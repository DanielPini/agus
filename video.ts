export const videoWrapper = document.querySelector<HTMLDivElement>(".video-wrapper")!;
export const video = document.querySelector<HTMLVideoElement>("video")!;

const videoContainer = document.querySelector<HTMLDivElement>(".video-container")!;
const playButton = document.querySelector<HTMLElement>(".play-button")!;
const closeButton = document.querySelector<HTMLButtonElement>(".close-button")!;

const closeListeners: Array<() => void> = [];

export function onVideoClose(fn: () => void) {
  closeListeners.push(fn);
}

export function setVideoOpen(open: boolean) {
  videoContainer.classList.toggle("show", open);
  document.body.classList.toggle("video-open", open);
  if (!open) closeListeners.forEach((fn) => fn());
}

export function initVideoPlayer() {
  playButton.addEventListener("click", () => {
    setVideoOpen(true);
  });

  closeButton.addEventListener("click", () => {
    setVideoOpen(false);
  });

  videoContainer.addEventListener("click", (e) => {
    if (e.target === videoContainer) {
      setVideoOpen(false);
    }
  });

  video.addEventListener("click", () => {
    if (video.paused) video.play();
    else video.pause();
  });

  // `loop` should make this unreachable, but if the browser ever fires
  // `ended` anyway, restart rather than leaving the video stopped on its
  // last frame.
  video.addEventListener("ended", () => {
    video.currentTime = 0;
    video.play();
  });
}
