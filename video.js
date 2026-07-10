export const videoWrapper = document.querySelector(".video-wrapper");
export const video = document.querySelector("video");
const videoContainer = document.querySelector(".video-container");
const playButton = document.querySelector(".play-button");
const closeButton = document.querySelector(".close-button");
const closeListeners = [];
export function onVideoClose(fn) {
    closeListeners.push(fn);
}
export function setVideoOpen(open) {
    videoContainer.classList.toggle("show", open);
    document.body.classList.toggle("video-open", open);
    if (!open)
        closeListeners.forEach((fn) => fn());
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
        if (video.paused)
            video.play();
        else
            video.pause();
    });
    // `loop` should make this unreachable, but if the browser ever fires
    // `ended` anyway, restart rather than leaving the video stopped on its
    // last frame.
    video.addEventListener("ended", () => {
        video.currentTime = 0;
        video.play();
    });
}
