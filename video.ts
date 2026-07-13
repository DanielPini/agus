declare const Vimeo: {
  Player: new (
    el: string | HTMLElement,
    opts: Record<string, unknown>,
  ) => {
    getCurrentTime(): Promise<number>;
    play(): Promise<void>;
    pause(): Promise<void>;
    on(event: string, cb: () => void): void;
  };
};

export const videoWrapper = document.querySelector<HTMLDivElement>(".video-wrapper")!;

const videoContainer = document.querySelector<HTMLDivElement>(".video-container")!;
const playButton = document.querySelector<HTMLElement>(".play-button")!;
const closeButton = document.querySelector<HTMLButtonElement>(".close-button")!;
// Clicks inside the Vimeo iframe never bubble to the parent document (separate
// browsing context), so a transparent overlay catches the click instead.
const videoClickTarget = document.querySelector<HTMLDivElement>(".video-click-target")!;

// Passing `id`+`h` separately makes the SDK build its internal oembed lookup
// as vimeo.com/{id} without the hash, which 404s for an unlisted video. The
// full hash-qualified `url` avoids that.
const player = new Vimeo.Player("vimeo-player", {
  url: "https://vimeo.com/1209314643/8e3ff1a4bd",
  autoplay: true,
  muted: true,
  loop: true,
  playsinline: true,
  controls: false,
  title: false,
  byline: false,
  portrait: false,
  dnt: true,
});

let currentTime = 0;
function pollTime() {
  player.getCurrentTime().then((t) => (currentTime = t));
  requestAnimationFrame(pollTime);
}
pollTime();

let isPaused = false;
player.on("pause", () => {
  isPaused = true;
});
player.on("play", () => {
  isPaused = false;
});

export const videoPlayer = {
  getCurrentTime: () => currentTime,
  onPause: (fn: () => void) => player.on("pause", fn),
  onPlay: (fn: () => void) => player.on("play", fn),
};

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

  videoClickTarget.addEventListener("click", () => {
    if (isPaused) player.play();
    else player.pause();
  });
}
