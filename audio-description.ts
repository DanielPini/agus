// Standalone audio-description player, shown under the Play button on the
// landing page.
//
// This is deliberately NOT tied to the video. The delivered audio runs about
// four minutes against a sub-two-minute video, so lockstep playback can't
// work until correctly-timed files exist. Until then it plays here on its
// own, driven only by its own button, with the video closed.
//
// The dormant synced path still lives in video.ts
// (AUDIO_DESCRIPTION_SRC_LOOP_*), ready for when proper files arrive.

// Hosted audio-description files, played in order back to back with no
// deliberate gap between them. One entry for now; add more URLs to the array
// if the description is later split into parts. An empty array disables the
// control.
const AUDIO_DESCRIPTION_PARTS: string[] = [
  "https://runway.org.au/media/pages/issues/translation/test/b30218a1f8-1788419931/ad_version_1b.mp3",
];

export function initAudioDescription(root: HTMLElement) {
  const toggle = root.querySelector<HTMLButtonElement>(
    "#audio-description-toggle",
  )!;
  const audio = root.querySelector<HTMLAudioElement>(
    "#audio-description-standalone",
  )!;

  const parts = AUDIO_DESCRIPTION_PARTS.filter((url) => url !== "");

  if (parts.length === 0) {
    toggle.disabled = true;
    toggle.textContent = "Audio description coming soon";
    return;
  }

  let partIndex = 0;
  let playing = false;

  // Only ever assign a real URL — `audio.src = ""` resolves to the page URL
  // and makes the element try to load the document as media.
  function loadPart(index: number) {
    partIndex = index;
    audio.src = parts[index];
  }

  function setPlaying(next: boolean) {
    playing = next;
    toggle.setAttribute("aria-pressed", String(next));
    toggle.textContent = next
      ? "Pause audio description"
      : "Play audio description";
  }

  loadPart(0);

  toggle.addEventListener("click", () => {
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  });

  audio.addEventListener("ended", () => {
    if (partIndex < parts.length - 1) {
      loadPart(partIndex + 1);
      audio.play().catch(() => setPlaying(false));
    } else {
      // Finished the last part — rewind for next time.
      loadPart(0);
      setPlaying(false);
    }
  });
}
