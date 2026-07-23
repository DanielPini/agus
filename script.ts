import { buildApp } from "./dom.js";
import { initVideoPlayer } from "./video.js";
import { initCaptionsPlayer } from "./captions-player.js";
import { initSettingsPicker } from "./settings-picker.js";
import { initSettingsMenus } from "./settings-menu.js";

// The host page only needs to contain <div id="agus-app"></div> — it's used
// purely as a signal that this block exists on the page. All actual markup
// is built by buildApp() and appended to <body> directly (see dom.ts for
// why), so the anchor itself is hidden once we've confirmed it's there.
const MOUNT_ID = "agus-app";

function init() {
  const anchor = document.getElementById(MOUNT_ID);
  if (!anchor) {
    throw new Error(`Missing mount point: <div id="${MOUNT_ID}"></div>`);
  }
  anchor.style.display = "none";

  const root = buildApp();
  initVideoPlayer(root);
  initCaptionsPlayer();
  initSettingsPicker(root);
  initSettingsMenus(root);
}

// Querying for elements requires the DOM to already be parsed. That's
// guaranteed by <script> placement in index.html, but not guaranteed by
// wherever a host CMS injects this bundle.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
