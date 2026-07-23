declare const Vimeo: {
  Player: new (
    el: string | HTMLElement,
    opts: Record<string, unknown>,
  ) => VimeoPlayerInstance;
};

type VimeoPlayerInstance = {
  getCurrentTime(): Promise<number>;
  setCurrentTime(seconds: number): Promise<number>;
  play(): Promise<void>;
  pause(): Promise<void>;
  on(event: string, cb: () => void): void;
};

// Everything below is assigned inside initVideoPlayer(), not at module load
// time — the elements it queries for are created at runtime by dom.ts, and
// the Vimeo SDK is fetched dynamically rather than via a static <script> tag,
// so neither exists yet when this module first evaluates.
export let videoWrapper: HTMLDivElement;
let videoContainer: HTMLDivElement;
let playButton: HTMLElement;
let closeButton: HTMLButtonElement;
// Clicks inside the Vimeo iframe never bubble to the parent document (separate
// browsing context), so a transparent overlay catches the click instead.
let videoClickTarget: HTMLDivElement;

// `player` isn't created until the Vimeo SDK finishes loading (async), but
// captions-player.ts calls videoPlayer.onPause/onPlay synchronously during
// its own init, which runs immediately after initVideoPlayer() is *called*
// — not after it *completes*. Registrations that arrive before `player`
// exists are queued here and flushed once it's created, instead of
// dereferencing `player.on` on undefined and crashing.
let player: VimeoPlayerInstance | null = null;
const pendingPlayerEvents: Array<[string, () => void]> = [];
function onPlayerEvent(event: string, fn: () => void) {
  if (player) player.on(event, fn);
  else pendingPlayerEvents.push([event, fn]);
}

function loadVimeoSdk(): Promise<void> {
  if (typeof Vimeo !== "undefined") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Vimeo Player SDK"));
    document.head.append(script);
  });
}

let currentTime = 0;
function pollTime() {
  if (!player) return;
  player.getCurrentTime().then((t) => (currentTime = t));
  requestAnimationFrame(pollTime);
}

let isPaused = false;

// `loop: true` is expected to handle this on its own, but Vimeo's embed-level
// loop is unreliable, so fall back to a manual restart whenever `ended` fires.
let loopCount = 1;
const loopListeners: Array<() => void> = [];
function restartLoop(nextLoopCount: number) {
  loopCount = nextLoopCount;
  if (player) player.setCurrentTime(0).then(() => player!.play());
  loopListeners.forEach((fn) => fn());
}

export const videoPlayer = {
  getCurrentTime: () => currentTime,
  getLoopCount: () => loopCount,
  onPause: (fn: () => void) => onPlayerEvent("pause", fn),
  onPlay: (fn: () => void) => onPlayerEvent("play", fn),
  onLoop: (fn: () => void) => loopListeners.push(fn),
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

export async function initVideoPlayer(root: HTMLElement) {
  // Scoped to `root`, not `document` — the host page can have its own
  // same-named elements (e.g. Runway's own nav also uses class="close-button"),
  // and document.querySelector would silently grab theirs instead of ours.
  videoWrapper = root.querySelector<HTMLDivElement>(".video-wrapper")!;
  videoContainer = root.querySelector<HTMLDivElement>(".video-container")!;
  playButton = root.querySelector<HTMLElement>(".play-button")!;
  closeButton = root.querySelector<HTMLButtonElement>(".close-button")!;
  videoClickTarget = root.querySelector<HTMLDivElement>(".video-click-target")!;

  // Wired up immediately, not gated behind the Vimeo SDK load, so the UI
  // stays responsive (close/backdrop/play-pause) even if that load is slow
  // or fails. player-dependent handlers no-op until `player` exists.
  playButton.addEventListener("click", () => {
    restartLoop(1);
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
    if (!player) return;
    if (isPaused) player.play();
    else player.pause();
  });

  await loadVimeoSdk();

  // Passing `id`+`h` separately makes the SDK build its internal oembed lookup
  // as vimeo.com/{id} without the hash, which 404s for an unlisted video. The
  // full hash-qualified `url` avoids that.
  player = new Vimeo.Player("vimeo-player", {
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

  pendingPlayerEvents.forEach(([event, fn]) => player!.on(event, fn));
  pendingPlayerEvents.length = 0;

  pollTime();

  player.on("pause", () => {
    isPaused = true;
  });
  player.on("play", () => {
    isPaused = false;
  });
  player.on("ended", () => {
    restartLoop(loopCount + 1);
  });
}
