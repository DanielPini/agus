// Builds the app's markup at runtime instead of shipping it as static HTML,
// and appends it directly to <body> rather than into the host page's mount
// element. A host CMS's own block wrapper can carry a `transform` (even a
// no-op translate(0,0)) which creates a new containing block for
// `position: fixed` descendants — nesting inside it would trap our
// full-viewport takeover and the video overlay inside that block's box
// instead of the real viewport. Appending straight to <body> avoids that.
export function buildApp(): HTMLElement {
  document.body.style.overflow = "hidden";

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div id="agus-root" class="agus-scope">
      <div class="page-wrapper">
        <section class="text-section">
          <div class="text-column">
            <article class="blurb">
              <h2>Subtitles</h2>
              <h3>Agus Wijaya</h3>
              <pre>
A video plays on loop.
A system of subtitles
describes, anticipates
and misreads what is
happening. They produce
meaning rather than
clarify. It becomes
unclear what is being
described, or who
is speaking.
              </pre>
            </article>
            <nav class="settings-menu-inline" id="settings-inline" aria-label="Settings"></nav>
          </div>
        </section>
        <div class="play-section">
          <h2 class="play-button">Play</h2>
        </div>
      </div>
      <div class="video-container">
        <button class="close-button" aria-label="Close video">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 1L15 15" stroke="currentColor" stroke-width="2" />
            <path d="M15 1L1 15" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
        <div class="video-wrapper">
          <div id="vimeo-player"></div>
          <div class="video-click-target"></div>
        </div>
        <audio id="audio-description" preload="none"></audio>
      </div>
      <button
        class="burger-button"
        id="burger-button"
        aria-label="Open settings"
        aria-expanded="false"
      >
        &#9776;
      </button>
      <nav
        class="settings-menu-floating"
        id="settings-floating"
        aria-label="Settings"
        hidden
      ></nav>
      <div class="settings-picker" id="settings-picker" hidden>
        <button class="picker-close" id="picker-close" aria-label="Close">
          &larr; Back
        </button>
        <div class="picker-track" id="picker-track" role="listbox">
          <div class="picker-track-inner" id="picker-track-inner"></div>
        </div>
      </div>
    </div>
    `,
  );

  // Scoped queries (root.querySelector, not document.querySelector) are used
  // throughout the other modules specifically so they can't accidentally
  // match a same-named element elsewhere on a host page — e.g. Runway's own
  // site nav also has buttons with class="close-button".
  const root = document.getElementById("agus-root")!;
  setupHostClickPassthrough(root);
  return root;
}

// #agus-root is a full-viewport, position:fixed layer, so it can end up
// sitting on top of host-page elements underneath it (e.g. the "click
// outside to close" handling for the host's work-info drawer) — a click on
// one of our own empty wrapper elements never reaches whatever's really
// there. None of these four have a click handler of their own (only
// specific leaf elements like .play-button and the nav menus do), so a
// click landing directly on one of them is forwarded to whatever's really
// underneath. This is done in JS rather than via `pointer-events: none` on
// #agus-root, because pointer-events also gates wheel/touch hit-testing —
// that would silently break the scrolling #agus-root's own
// overflow-y:auto exists for.
const PASSTHROUGH_SELECTOR = "#agus-root, .page-wrapper, .text-section, .play-section";

function setupHostClickPassthrough(root: HTMLElement) {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.matches?.(PASSTHROUGH_SELECTOR)) return;

    root.style.visibility = "hidden";
    const under = document.elementFromPoint(e.clientX, e.clientY);
    root.style.visibility = "";

    under?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: e.clientX,
        clientY: e.clientY,
      }),
    );
  });
}
