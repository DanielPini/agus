import { type Settings, options, labelFor, getSettings, setSetting } from "./settings.js";
import { makeDraggableTrack } from "./draggable-track.js";

// Same visible-overflow + draggable-track approach as the branch rows, plus
// live "centered = selected" behaviour: every drag/wheel move re-evaluates
// which item is nearest the viewport's center and commits it via setSetting.

const picker = document.querySelector<HTMLDivElement>("#settings-picker")!;
const pickerTrack = document.querySelector<HTMLDivElement>("#picker-track")!;
const pickerTrackInner = document.querySelector<HTMLDivElement>(
  "#picker-track-inner",
)!;
const pickerClose = document.querySelector<HTMLButtonElement>("#picker-close")!;

let activePickerKey: keyof Settings | null = null;
let pickerReturnFocus: (() => void) | null = null;

const pickerDrag = makeDraggableTrack(pickerTrack, pickerTrackInner, () => {
  const active = updateActiveItem();
  if (active && activePickerKey) {
    setSetting(
      activePickerKey,
      active.dataset.value as Settings[typeof activePickerKey],
    );
  }
});

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

function updateActiveItem(): HTMLElement | null {
  const viewportRect = pickerTrack.getBoundingClientRect();
  const centerX = viewportRect.left + viewportRect.width / 2;
  let closest: HTMLElement | null = null;
  let closestDist = Infinity;

  const items = pickerTrackInner.querySelectorAll<HTMLElement>(".picker-item");
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
    item.style.zIndex = "1000";
    item.style.opacity = active ? "1" : "0.5";
    item.style.fontWeight = active ? "700" : "400";
    item.style.transform = active ? "scale(1.15)" : "scale(1)";
  });

  return closest;
}

export function initSettingsPicker() {
  pickerClose.addEventListener("click", () => closePicker());
  picker.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePicker();
    }
  });
}
