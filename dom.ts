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
              <pre style="font-family: Helvetica, sans-serif">
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
        <button class="close-button" aria-label="Close video">&times;</button>
        <div class="video-wrapper">
          <div id="vimeo-player"></div>
          <div class="video-click-target"></div>
        </div>
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
  return document.getElementById("agus-root")!;
}
