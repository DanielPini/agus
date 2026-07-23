import { type Settings, resetKeys } from "./settings.js";
import { makeDraggableTrack } from "./draggable-track.js";
import { enableArrowNav } from "./arrow-nav.js";
import { openPicker, closePicker, isInsidePicker, isPickerOpen } from "./settings-picker.js";
import { onVideoClose } from "./video.js";

// A single reusable component renders as two levels: a root of two capsules
// (Font / Options), and, once one is picked, a horizontal row of that
// branch's fields plus Reset and a close (✕) capsule. Picking a field opens
// the shared bottom picker. Inline and floating instances share settings
// state via getSettings/setSetting/onSettingsChange, so neither can drift
// from the other — only their own navigation level is kept separately.

type Branch = "font" | "options";

const branchLabel: Record<Branch, string> = {
  font: "Font",
  options: "Options",
};

const branchLeaves: Record<Branch, { key: keyof Settings; label: string }[]> = {
  font: [
    { key: "fontFamily", label: "Family" },
    { key: "fontColour", label: "Colour" },
    { key: "boxColour", label: "Textbox" },
  ],
  options: [
    { key: "language", label: "Language" },
    { key: "audioDescription", label: "Audio Description" },
  ],
};

function makeCapsule(label: string, ariaLabel?: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "capsule";
  btn.textContent = label;
  if (ariaLabel) btn.setAttribute("aria-label", ariaLabel);
  return btn;
}

function createSettingsMenu(
  container: HTMLElement,
  opts: { focusOnBuild?: boolean; onRootEscape?: () => void } = {},
): { collapseToRoot: () => void } {
  let openBranch: Branch | null = null;

  function render() {
    container.replaceChildren();
    const list = document.createElement("div");
    list.className = "capsule-list capsule-list--vertical";
    list.setAttribute("role", "menu");
    list.setAttribute("aria-orientation", "vertical");

    (["font", "options"] as Branch[]).forEach((branch) => {
      if (openBranch === branch) {
        list.append(renderExpandedRow(branch));
      } else {
        const btn = makeCapsule(branchLabel[branch]);
        btn.dataset.branch = branch;
        btn.addEventListener("click", () => {
          if (openBranch !== null) closePicker();
          openBranch = branch;
          render();
          requestAnimationFrame(() => {
            container
              .querySelector<HTMLElement>(".capsule-list--horizontal .capsule")
              ?.focus();
          });
        });
        list.append(btn);
      }
    });

    container.append(list);
    enableArrowNav(list, "vertical", () => opts.onRootEscape?.());
  }

  function renderExpandedRow(branch: Branch): HTMLElement {
    const row = document.createElement("div");
    row.className = "capsule-list capsule-list--horizontal";
    row.setAttribute("role", "menu");
    row.setAttribute("aria-orientation", "horizontal");

    const track = document.createElement("div");
    track.className = "capsule-row-track";
    row.append(track);

    const drag = makeDraggableTrack(row, track);

    branchLeaves[branch].forEach((leaf) => {
      const btn = makeCapsule(leaf.label);
      btn.dataset.leaf = leaf.key;
      btn.addEventListener("click", () => {
        openPicker(leaf.key, () => {
          requestAnimationFrame(() => {
            container
              .querySelector<HTMLElement>(`[data-leaf="${leaf.key}"]`)
              ?.focus();
          });
        });
      });
      track.append(btn);
    });

    const resetBtn = makeCapsule("Reset");
    resetBtn.addEventListener("click", () => collapse(branch, true));
    track.append(resetBtn);

    const closeBtn = makeCapsule("✕", "Close");
    closeBtn.classList.add("capsule--close");
    closeBtn.addEventListener("click", () => collapse(branch, false));
    track.append(closeBtn);

    enableArrowNav(
      track,
      "horizontal",
      () => collapse(branch, false),
      (item) => drag.centerOn(item),
    );
    return row;
  }

  function collapse(branch: Branch, reset: boolean) {
    closePicker();
    if (reset) resetKeys(branchLeaves[branch].map((l) => l.key));
    openBranch = null;
    render();
    requestAnimationFrame(() => {
      container
        .querySelector<HTMLElement>(`[data-branch="${branch}"]`)
        ?.focus();
    });
  }

  function collapseToRoot() {
    if (openBranch === null && !isPickerOpen()) return;
    closePicker();
    openBranch = null;
    render();
  }

  render();
  if (opts.focusOnBuild) {
    container.querySelector<HTMLElement>(".capsule")?.focus();
  }

  return { collapseToRoot };
}

export function initSettingsMenus(root: HTMLElement) {
  // ---------- Inline instance (always visible in the page) ----------

  // Scoped to `root`, not `document` — see video.ts's initVideoPlayer for why.
  const inlineSettings = root.querySelector<HTMLDivElement>("#settings-inline")!;
  const inlineMenu = createSettingsMenu(inlineSettings);

  // ---------- Floating instance (burger, top-right, while video is open) ----------

  const burgerButton = root.querySelector<HTMLButtonElement>("#burger-button")!;
  const floatingMenu = root.querySelector<HTMLDivElement>("#settings-floating")!;

  function closeFloatingMenu() {
    floatingMenu.hidden = true;
    burgerButton.setAttribute("aria-expanded", "false");
    closePicker();
  }

  onVideoClose(closeFloatingMenu);

  burgerButton.addEventListener("click", () => {
    const willOpen = floatingMenu.hidden;
    if (willOpen) {
      floatingMenu.hidden = false;
      burgerButton.setAttribute("aria-expanded", "true");
      createSettingsMenu(floatingMenu, {
        focusOnBuild: true,
        onRootEscape: () => {
          closeFloatingMenu();
          burgerButton.focus();
        },
      });
    } else {
      closeFloatingMenu();
    }
  });

  // Clicking anywhere outside a menu (and outside the shared picker) collapses
  // its open sub-capsules back to the root two-capsule state. Use
  // composedPath, not e.target: a capsule click re-renders its menu and
  // detaches the clicked button from the DOM before this listener runs,
  // which would make a `.contains(target)` check wrongly see it as "outside".
  document.addEventListener("click", (e) => {
    const path = e.composedPath();
    const insidePicker = isInsidePicker(path);

    if (
      !path.includes(inlineSettings) &&
      !path.includes(floatingMenu) &&
      !insidePicker
    ) {
      inlineMenu.collapseToRoot();
    }

    if (
      !floatingMenu.hidden &&
      !path.includes(floatingMenu) &&
      !path.includes(burgerButton) &&
      !insidePicker
    ) {
      closeFloatingMenu();
    }
  });
}
