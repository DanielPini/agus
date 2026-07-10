import {
  type State,
  type CustomCaption,
  customCaptions,
  captions,
  type Caption,
} from "./captions.js";
import {
  type Settings,
  options,
  labelFor,
  getSettings,
  setSetting,
  resetKeys,
  onSettingsChange,
} from "./settings.js";

let state: State = {
  directionX: "none",
  directionY: "none",
  position: { x: 0, y: 0 },
  speed: 0,
};

const videoWrapper = document.querySelector<HTMLDivElement>(".video-wrapper")!;
const video = document.querySelector<HTMLVideoElement>("video")!;
let currentId: number | null = null;
let currentCaption: Caption | CustomCaption | null = null;
let currentElement: HTMLDivElement | null = null;
let currentTimeout: ReturnType<typeof setTimeout> | null = null;
let isPaused = false;

function playCaption() {
  if (isPaused) return;
  const time = video.currentTime * 1000;

  const custom = customCaptions.find((c) => c.condition(state));
  if (custom && currentId !== custom.id) createCaption(custom);
  else if (!currentId) {
    const currentMatch = captions.find(
      (c) => c.timeStart < time && c.timeStart + c.duration > time,
    );
    if (currentMatch) {
      createCaption(currentMatch);
    }
  }

  requestAnimationFrame(playCaption);
}

playCaption();

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

onSettingsChange((s) => {
  if (currentElement && currentCaption) {
    currentElement.textContent = currentCaption.text[s.language];
  }
});

video.addEventListener("pause", () => {
  isPaused = true;
});
video.addEventListener("play", () => {
  isPaused = false;
  playCaption();
});

let lastX = 0;
let lastY = 0;
let lastTime = 0;
window.addEventListener("mousemove", (e: MouseEvent) => {
  const time = e.timeStamp;
  const currentX = e.x;
  const currentY = e.y;
  const dx = currentX - lastX;
  const dy = currentY - lastY;
  const dt = time - lastTime;
  const hyp = Math.sqrt(dx * dx + dy * dy);
  const speed = hyp / dt;

  lastX = currentX;
  lastY = currentY;
  lastTime = time;

  state = {
    directionX: dx > 0 ? "right" : dx < 0 ? "left" : "none",
    directionY: dy > 0 ? "down" : dy < 0 ? "up" : "none",
    position: { x: lastX, y: lastY },
    speed: speed,
  };
});

const videoContainer =
  document.querySelector<HTMLDivElement>(".video-container")!;
const playButton = document.querySelector<HTMLElement>(".play-button")!;
const closeButton = document.querySelector<HTMLButtonElement>(".close-button")!;
const burgerButton = document.querySelector<HTMLButtonElement>("#burger-button")!;
const floatingMenu = document.querySelector<HTMLDivElement>("#settings-floating")!;

function setVideoOpen(open: boolean) {
  videoContainer.classList.toggle("show", open);
  document.body.classList.toggle("video-open", open);
  if (!open) closeFloatingMenu();
}

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

// ---------- Settings: capsule menu (shared by inline sidebar + burger) ----------
// A single reusable component renders as two levels: a root of two capsules
// (Font / Options), and, once one is picked, a horizontal row of that
// branch's fields plus Reset and a close (✕) capsule. Picking a field opens
// the shared bottom picker. Inline and floating instances share settings
// state via getSettings/setSetting/onSettingsChange, so neither can drift
// from the other — only their own navigation level is kept separately.

type Branch = "font" | "options";

const branchLabel: Record<Branch, string> = { font: "Font", options: "Options" };

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

function enableArrowNav(
  list: HTMLElement,
  orientation: "horizontal" | "vertical",
  onEscape: () => void,
) {
  const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
  const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
  list.addEventListener("keydown", (e) => {
    const buttons = Array.from(
      list.querySelectorAll<HTMLButtonElement>(":scope > button"),
    );
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === prevKey && idx > -1) {
      e.preventDefault();
      buttons[(idx - 1 + buttons.length) % buttons.length].focus();
    } else if (e.key === nextKey && idx > -1) {
      e.preventDefault();
      buttons[(idx + 1) % buttons.length].focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onEscape();
    }
  });
}

// Both branch capsules (Font, Options) stay visible at all times, stacked
// vertically. Opening one expands it in place into a horizontal row of its
// fields + Reset + ✕, while the sibling branch remains visible as a plain
// capsule — clicking it switches which branch is expanded.

function createSettingsMenu(
  container: HTMLElement,
  opts: { focusOnBuild?: boolean; onRootEscape?: () => void } = {},
) {
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
      row.append(btn);
    });

    const resetBtn = makeCapsule("Reset");
    resetBtn.addEventListener("click", () => collapse(branch, true));
    row.append(resetBtn);

    const closeBtn = makeCapsule("✕", "Close");
    closeBtn.classList.add("capsule--close");
    closeBtn.addEventListener("click", () => collapse(branch, false));
    row.append(closeBtn);

    enableArrowNav(row, "horizontal", () => collapse(branch, false));
    return row;
  }

  function collapse(branch: Branch, reset: boolean) {
    closePicker();
    if (reset) resetKeys(branchLeaves[branch].map((l) => l.key));
    openBranch = null;
    render();
    requestAnimationFrame(() => {
      container.querySelector<HTMLElement>(`[data-branch="${branch}"]`)?.focus();
    });
  }

  render();
  if (opts.focusOnBuild) {
    (container.querySelector<HTMLElement>(".capsule"))?.focus();
  }
}

// ---------- Shared bottom picker ----------

const picker = document.querySelector<HTMLDivElement>("#settings-picker")!;
const pickerTrack = document.querySelector<HTMLDivElement>("#picker-track")!;
const pickerClose = document.querySelector<HTMLButtonElement>("#picker-close")!;

let activePickerKey: keyof Settings | null = null;
let pickerReturnFocus: (() => void) | null = null;

function closePicker() {
  if (picker.hidden) return;
  picker.hidden = true;
  pickerTrack.replaceChildren();
  pickerTrack.removeEventListener("scroll", onPickerScroll);
  activePickerKey = null;
  const returnFocus = pickerReturnFocus;
  pickerReturnFocus = null;
  returnFocus?.();
}

function applyPreviewStyle<K extends keyof Settings>(
  item: HTMLElement,
  key: K,
  value: Settings[K],
) {
  switch (key) {
    case "fontFamily":
      item.style.fontFamily = `${value}, sans-serif`;
      break;
    case "fontColour":
      item.style.color = value as string;
      item.style.textShadow = "0 0 3px black, 0 0 3px black";
      break;
    case "boxColour":
      item.style.background = value as string;
      item.style.color = value === "white" ? "black" : "white";
      item.style.padding = "6px 12px";
      item.style.borderRadius = "4px";
      break;
  }
}

function focusSibling(item: HTMLElement, dir: 1 | -1) {
  const items = Array.from(
    pickerTrack.querySelectorAll<HTMLElement>(".picker-item"),
  );
  const idx = items.indexOf(item);
  const next = items[idx + dir];
  if (next) {
    next.focus();
    next.scrollIntoView({ inline: "center", block: "nearest" });
    if (activePickerKey) {
      setSetting(
        activePickerKey,
        next.dataset.value as Settings[typeof activePickerKey],
      );
    }
  }
}

function openPicker(key: keyof Settings, onClose: () => void) {
  activePickerKey = key;
  pickerReturnFocus = onClose;
  picker.hidden = false;
  pickerTrack.replaceChildren();

  options[key].forEach((value) => {
    const item = document.createElement("div");
    item.className = "picker-item";
    item.textContent = labelFor(key, value);
    item.dataset.value = String(value);
    item.tabIndex = 0;
    item.setAttribute("role", "option");
    applyPreviewStyle(item, key, value);

    item.addEventListener("click", () => {
      setSetting(key, value);
      closePicker();
    });
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSetting(key, value);
        closePicker();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focusSibling(item, 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusSibling(item, -1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        closePicker();
      }
    });

    pickerTrack.append(item);
  });

  pickerTrack.addEventListener("scroll", onPickerScroll);

  requestAnimationFrame(() => {
    scrollToValue(getSettings()[key]);
    requestAnimationFrame(updateActiveItem);
    pickerTrack
      .querySelector<HTMLElement>(
        `[data-value="${CSS.escape(String(getSettings()[key]))}"]`,
      )
      ?.focus();
  });
}

function onPickerScroll() {
  requestAnimationFrame(() => {
    const active = updateActiveItem();
    if (active && activePickerKey) {
      setSetting(
        activePickerKey,
        active.dataset.value as Settings[typeof activePickerKey],
      );
    }
  });
}

function updateActiveItem(): HTMLElement | null {
  const containerRect = pickerTrack.getBoundingClientRect();
  const centerX = containerRect.left + containerRect.width / 2;
  let closest: HTMLElement | null = null;
  let closestDist = Infinity;

  const items = pickerTrack.querySelectorAll<HTMLElement>(".picker-item");
  items.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const dist = Math.abs(itemCenter - centerX);
    if (dist < closestDist) {
      closestDist = dist;
      closest = item;
    }
  });

  items.forEach((item) => {
    const active = item === closest;
    item.style.opacity = active ? "1" : "0.5";
    item.style.fontWeight = active ? "700" : "400";
    item.style.transform = active ? "scale(1.15)" : "scale(1)";
  });

  return closest;
}

function scrollToValue(value: unknown) {
  pickerTrack.querySelectorAll<HTMLElement>(".picker-item").forEach((item) => {
    if (item.dataset.value === String(value)) {
      item.scrollIntoView({ inline: "center", block: "nearest" });
    }
  });
}

pickerClose.addEventListener("click", () => closePicker());
picker.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.preventDefault();
    closePicker();
  }
});

// ---------- Inline instance (always visible in the page) ----------

const inlineSettings = document.querySelector<HTMLDivElement>("#settings-inline")!;
createSettingsMenu(inlineSettings);

// ---------- Floating instance (burger, top-right, while video is open) ----------

function closeFloatingMenu() {
  floatingMenu.hidden = true;
  burgerButton.setAttribute("aria-expanded", "false");
  closePicker();
}

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

document.addEventListener("click", (e) => {
  if (floatingMenu.hidden) return;
  // Use composedPath, not e.target: a capsule click re-renders the menu
  // and detaches the clicked button before this listener runs, which
  // would make a `.contains(target)` check see it as an outside click.
  const path = e.composedPath();
  if (
    path.includes(floatingMenu) ||
    path.includes(burgerButton) ||
    path.includes(picker)
  ) {
    return;
  }
  closeFloatingMenu();
});

console.log("Got to the end of the file");
