import { type Settings, options, labelFor, getSettings, setSetting } from "./settings.js";
import { makeDraggableTrack } from "./draggable-track.js";

// Same visible-overflow + draggable-track approach as the branch rows, plus
// live "centered = selected" behaviour: every drag/wheel move re-evaluates
// which item is nearest the viewport's center and commits it via setSetting.

// Assigned inside initSettingsPicker(), not at module load time — these
// elements are created at runtime by dom.ts, so they don't exist yet when
// this module first evaluates.
let picker: HTMLDivElement;
let pickerTrack: HTMLDivElement;
let pickerTrackInner: HTMLDivElement;
let pickerClose: HTMLButtonElement;
let pickerDrag: ReturnType<typeof makeDraggableTrack>;

let activePickerKey: keyof Settings | null = null;
let pickerReturnFocus: (() => void) | null = null;

export function isInsidePicker(path: EventTarget[]): boolean {
  return path.includes(picker);
}

export function isPickerOpen(): boolean {
  return !picker.hidden;
}

export function closePicker() {
  if (picker.hidden) return;
  picker.hidden = true;
  pickerTrackInner.replaceChildren();
  pickerDrag.resetOffset();
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
    pickerTrackInner.querySelectorAll<HTMLElement>(".picker-item"),
  );
  const idx = items.indexOf(item);
  const next = items[idx + dir];
  if (next) {
    next.focus();
    pickerDrag.centerOn(next);
    if (activePickerKey) {
      setSetting(
        activePickerKey,
        next.dataset.value as Settings[typeof activePickerKey],
      );
    }
    updateActiveItem();
  }
}

export function openPicker(key: keyof Settings, onClose: () => void) {
  activePickerKey = key;
  pickerReturnFocus = onClose;
  picker.hidden = false;
  pickerTrackInner.replaceChildren();

  options[key].forEach((value) => {
    const item = document.createElement("div");
    item.className = "picker-item";
    item.textContent = labelFor(key, value);
    item.dataset.value = String(value);
    item.tabIndex = 0;
    item.setAttribute("role", "option");
    applyPreviewStyle(item, key, value);

    // Selecting a value previews it and keeps the picker open — the user
    // needs to see the result before deciding to dismiss it themselves
    // (click away or the close button). Only Escape closes it directly.
    item.addEventListener("click", () => {
      setSetting(key, value);
      pickerDrag.centerOn(item);
      item.focus();
      updateActiveItem();
    });
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSetting(key, value);
        pickerDrag.centerOn(item);
        updateActiveItem();
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

    pickerTrackInner.append(item);
  });

  requestAnimationFrame(() => {
    const currentItem = pickerTrackInner.querySelector<HTMLElement>(
      `[data-value="${CSS.escape(String(getSettings()[key]))}"]`,
    );
    if (currentItem) {
      pickerDrag.centerOn(currentItem);
      currentItem.focus();
    }
    updateActiveItem();
  });
}

// Geometry-only: which item is nearest the viewport's center right now.
// Used solely to infer a new value while the user is physically dragging or
// wheel-scrolling the track — during a drag there's no other signal for
// what they're choosing. Never use this to decide what's "active" for
// display; see updateActiveItem for why.
function findClosestToCenter(): HTMLElement | null {
  const viewportRect = pickerTrack.getBoundingClientRect();
  const centerX = viewportRect.left + viewportRect.width / 2;
  let closest: HTMLElement | null = null;
  let closestDist = Infinity;

  pickerTrackInner.querySelectorAll<HTMLElement>(".picker-item").forEach((item) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const dist = Math.abs(itemCenter - centerX);
    if (dist < closestDist) {
      closestDist = dist;
      closest = item;
    }
  });

  return closest;
}

// Marks whichever item matches the current setting value as active (bold,
// full opacity, scaled up) — driven by the setting itself, not by track
// geometry. clampOffset can stop an edge item (e.g. the first one) from
// ever reaching true center, and how close it gets depends on layout that
// varies by context (viewport width, whether web fonts have finished
// loading yet), so a "closest item to center" reading is never reliable
// enough to double as the active-item indicator.
function updateActiveItem(): HTMLElement | null {
  const currentValue = activePickerKey ? String(getSettings()[activePickerKey]) : null;
  let active: HTMLElement | null = null;

  pickerTrackInner.querySelectorAll<HTMLElement>(".picker-item").forEach((item) => {
    const isActive = item.dataset.value === currentValue;
    if (isActive) active = item;
    item.style.zIndex = "1000";
    item.style.opacity = isActive ? "1" : "0.5";
    item.style.fontWeight = isActive ? "700" : "400";
    item.style.transform = isActive ? "scale(1.15)" : "scale(1)";
  });

  return active;
}

export function initSettingsPicker(root: HTMLElement) {
  // Scoped to `root`, not `document` — see video.ts's initVideoPlayer for why.
  picker = root.querySelector<HTMLDivElement>("#settings-picker")!;
  pickerTrack = root.querySelector<HTMLDivElement>("#picker-track")!;
  pickerTrackInner = root.querySelector<HTMLDivElement>("#picker-track-inner")!;
  pickerClose = root.querySelector<HTMLButtonElement>("#picker-close")!;

  pickerDrag = makeDraggableTrack(pickerTrack, pickerTrackInner, () => {
    const closest = findClosestToCenter();
    if (closest && activePickerKey) {
      setSetting(
        activePickerKey,
        closest.dataset.value as Settings[typeof activePickerKey],
      );
    }
    updateActiveItem();
  });

  pickerClose.addEventListener("click", () => closePicker());
  picker.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePicker();
    }
  });
}
