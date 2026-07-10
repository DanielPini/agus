import { customCaptions, captions, } from "./captions.js";
import { options, labelFor, getSettings, setSetting, resetKeys, onSettingsChange, } from "./settings.js";
let state = {
    directionX: "none",
    directionY: "none",
    position: { x: 0, y: 0 },
    speed: 0,
};
const videoWrapper = document.querySelector(".video-wrapper");
const video = document.querySelector("video");
let currentId = null;
let currentCaption = null;
let currentElement = null;
let currentTimeout = null;
let isPaused = false;
function playCaption() {
    if (isPaused)
        return;
    const time = video.currentTime * 1000;
    const custom = customCaptions.find((c) => c.condition(state));
    if (custom && currentId !== custom.id)
        createCaption(custom);
    else if (!currentId) {
        const currentMatch = captions.find((c) => c.timeStart < time && c.timeStart + c.duration > time);
        if (currentMatch) {
            createCaption(currentMatch);
        }
    }
    requestAnimationFrame(playCaption);
}
playCaption();
function createCaption(caption) {
    const { id, text, duration } = caption;
    if (currentTimeout)
        clearTimeout(currentTimeout);
    if (currentElement)
        currentElement.remove();
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
window.addEventListener("mousemove", (e) => {
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
const videoContainer = document.querySelector(".video-container");
const playButton = document.querySelector(".play-button");
const closeButton = document.querySelector(".close-button");
const burgerButton = document.querySelector("#burger-button");
const floatingMenu = document.querySelector("#settings-floating");
function setVideoOpen(open) {
    videoContainer.classList.toggle("show", open);
    document.body.classList.toggle("video-open", open);
    if (!open)
        closeFloatingMenu();
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
    if (video.paused)
        video.play();
    else
        video.pause();
});
const branchLabel = { font: "Font", options: "Options" };
const branchLeaves = {
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
function makeCapsule(label, ariaLabel) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "capsule";
    btn.textContent = label;
    if (ariaLabel)
        btn.setAttribute("aria-label", ariaLabel);
    return btn;
}
// A horizontal strip whose overflow is CSS `visible` (nothing is clipped) —
// "scrolling" is instead a `transform: translateX()` on an inner track,
// driven by pointer drag (mouse + touch, unified via the Pointer Events API)
// and by wheel input. `viewport` is the stable, untransformed element used
// as the reference frame for centering math; `track` is the element that
// actually moves and holds the items.
function makeDraggableTrack(viewport, track, onChange) {
    let offset = 0;
    let dragging = false;
    let startClientX = 0;
    let startOffset = 0;
    let moved = 0;
    viewport.style.touchAction = "pan-y";
    viewport.style.cursor = "grab";
    function clampOffset(px) {
        const min = Math.min(0, viewport.clientWidth - track.offsetWidth);
        return Math.max(min, Math.min(0, px));
    }
    function setOffset(px) {
        offset = clampOffset(px);
        track.style.transform = `translateX(${offset}px)`;
        onChange === null || onChange === void 0 ? void 0 : onChange();
    }
    function resetOffset() {
        offset = 0;
        track.style.transform = "";
    }
    function centerOn(item) {
        const viewportRect = viewport.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const viewportCenter = viewportRect.left + viewportRect.width / 2;
        const itemCenter = itemRect.left + itemRect.width / 2;
        setOffset(offset + (viewportCenter - itemCenter));
    }
    viewport.addEventListener("pointerdown", (e) => {
        dragging = true;
        moved = 0;
        startClientX = e.clientX;
        startOffset = offset;
        viewport.setPointerCapture(e.pointerId);
        viewport.style.cursor = "grabbing";
    });
    viewport.addEventListener("pointermove", (e) => {
        if (!dragging)
            return;
        const delta = e.clientX - startClientX;
        moved = Math.max(moved, Math.abs(delta));
        setOffset(startOffset + delta);
    });
    function endDrag() {
        if (!dragging)
            return;
        dragging = false;
        viewport.style.cursor = "grab";
        if (moved > 5) {
            // A real drag happened — swallow the synthetic click that would
            // otherwise fire on release and accidentally select/activate
            // whatever capsule the pointer happens to be over.
            const swallow = (ce) => {
                ce.stopPropagation();
                ce.preventDefault();
            };
            viewport.addEventListener("click", swallow, { capture: true, once: true });
        }
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", () => {
        if (dragging)
            endDrag();
    });
    viewport.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        setOffset(offset - delta);
    }, { passive: false });
    return { setOffset, getOffset: () => offset, centerOn, resetOffset };
}
function enableArrowNav(list, orientation, onEscape, onMove) {
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    list.addEventListener("keydown", (e) => {
        const buttons = Array.from(list.querySelectorAll(":scope > button"));
        const idx = buttons.indexOf(document.activeElement);
        if (e.key === prevKey && idx > -1) {
            e.preventDefault();
            const next = buttons[(idx - 1 + buttons.length) % buttons.length];
            next.focus();
            onMove ? onMove(next) : next.scrollIntoView({ inline: "nearest", block: "nearest" });
        }
        else if (e.key === nextKey && idx > -1) {
            e.preventDefault();
            const next = buttons[(idx + 1) % buttons.length];
            next.focus();
            onMove ? onMove(next) : next.scrollIntoView({ inline: "nearest", block: "nearest" });
        }
        else if (e.key === "Escape") {
            e.preventDefault();
            onEscape();
        }
    });
}
// Both branch capsules (Font, Options) stay visible at all times, stacked
// vertically. Opening one expands it in place into a horizontal row of its
// fields + Reset + ✕, while the sibling branch remains visible as a plain
// capsule — clicking it switches which branch is expanded.
function createSettingsMenu(container, opts = {}) {
    var _a;
    let openBranch = null;
    function render() {
        container.replaceChildren();
        const list = document.createElement("div");
        list.className = "capsule-list capsule-list--vertical";
        list.setAttribute("role", "menu");
        list.setAttribute("aria-orientation", "vertical");
        ["font", "options"].forEach((branch) => {
            if (openBranch === branch) {
                list.append(renderExpandedRow(branch));
            }
            else {
                const btn = makeCapsule(branchLabel[branch]);
                btn.dataset.branch = branch;
                btn.addEventListener("click", () => {
                    if (openBranch !== null)
                        closePicker();
                    openBranch = branch;
                    render();
                    requestAnimationFrame(() => {
                        var _a;
                        (_a = container
                            .querySelector(".capsule-list--horizontal .capsule")) === null || _a === void 0 ? void 0 : _a.focus();
                    });
                });
                list.append(btn);
            }
        });
        container.append(list);
        enableArrowNav(list, "vertical", () => { var _a; return (_a = opts.onRootEscape) === null || _a === void 0 ? void 0 : _a.call(opts); });
    }
    function renderExpandedRow(branch) {
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
                        var _a;
                        (_a = container
                            .querySelector(`[data-leaf="${leaf.key}"]`)) === null || _a === void 0 ? void 0 : _a.focus();
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
        enableArrowNav(track, "horizontal", () => collapse(branch, false), (item) => drag.centerOn(item));
        return row;
    }
    function collapse(branch, reset) {
        closePicker();
        if (reset)
            resetKeys(branchLeaves[branch].map((l) => l.key));
        openBranch = null;
        render();
        requestAnimationFrame(() => {
            var _a;
            (_a = container.querySelector(`[data-branch="${branch}"]`)) === null || _a === void 0 ? void 0 : _a.focus();
        });
    }
    function collapseToRoot() {
        if (openBranch === null && picker.hidden)
            return;
        closePicker();
        openBranch = null;
        render();
    }
    render();
    if (opts.focusOnBuild) {
        (_a = (container.querySelector(".capsule"))) === null || _a === void 0 ? void 0 : _a.focus();
    }
    return { collapseToRoot };
}
// ---------- Shared bottom picker ----------
// Same visible-overflow + draggable-track approach as the branch rows, plus
// live "centered = selected" behaviour: every drag/wheel move re-evaluates
// which item is nearest the viewport's center and commits it via setSetting.
const picker = document.querySelector("#settings-picker");
const pickerTrack = document.querySelector("#picker-track");
const pickerTrackInner = document.querySelector("#picker-track-inner");
const pickerClose = document.querySelector("#picker-close");
let activePickerKey = null;
let pickerReturnFocus = null;
const pickerDrag = makeDraggableTrack(pickerTrack, pickerTrackInner, () => {
    const active = updateActiveItem();
    if (active && activePickerKey) {
        setSetting(activePickerKey, active.dataset.value);
    }
});
function closePicker() {
    if (picker.hidden)
        return;
    picker.hidden = true;
    pickerTrackInner.replaceChildren();
    pickerDrag.resetOffset();
    activePickerKey = null;
    const returnFocus = pickerReturnFocus;
    pickerReturnFocus = null;
    returnFocus === null || returnFocus === void 0 ? void 0 : returnFocus();
}
function applyPreviewStyle(item, key, value) {
    switch (key) {
        case "fontFamily":
            item.style.fontFamily = `${value}, sans-serif`;
            break;
        case "fontColour":
            item.style.color = value;
            item.style.textShadow = "0 0 3px black, 0 0 3px black";
            break;
        case "boxColour":
            item.style.background = value;
            item.style.color = value === "white" ? "black" : "white";
            item.style.padding = "6px 12px";
            item.style.borderRadius = "4px";
            break;
    }
}
function focusSibling(item, dir) {
    const items = Array.from(pickerTrackInner.querySelectorAll(".picker-item"));
    const idx = items.indexOf(item);
    const next = items[idx + dir];
    if (next) {
        next.focus();
        pickerDrag.centerOn(next);
        if (activePickerKey) {
            setSetting(activePickerKey, next.dataset.value);
        }
    }
}
function openPicker(key, onClose) {
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
            }
            else if (e.key === "ArrowRight") {
                e.preventDefault();
                focusSibling(item, 1);
            }
            else if (e.key === "ArrowLeft") {
                e.preventDefault();
                focusSibling(item, -1);
            }
            else if (e.key === "Escape") {
                e.preventDefault();
                closePicker();
            }
        });
        pickerTrackInner.append(item);
    });
    requestAnimationFrame(() => {
        const currentItem = pickerTrackInner.querySelector(`[data-value="${CSS.escape(String(getSettings()[key]))}"]`);
        if (currentItem) {
            pickerDrag.centerOn(currentItem);
            currentItem.focus();
        }
        updateActiveItem();
    });
}
function updateActiveItem() {
    const viewportRect = pickerTrack.getBoundingClientRect();
    const centerX = viewportRect.left + viewportRect.width / 2;
    let closest = null;
    let closestDist = Infinity;
    const items = pickerTrackInner.querySelectorAll(".picker-item");
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
pickerClose.addEventListener("click", () => closePicker());
picker.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        e.preventDefault();
        closePicker();
    }
});
// ---------- Inline instance (always visible in the page) ----------
const inlineSettings = document.querySelector("#settings-inline");
const inlineMenu = createSettingsMenu(inlineSettings);
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
    }
    else {
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
    const insidePicker = path.includes(picker);
    if (!path.includes(inlineSettings) && !insidePicker) {
        inlineMenu.collapseToRoot();
    }
    if (!floatingMenu.hidden &&
        !path.includes(floatingMenu) &&
        !path.includes(burgerButton) &&
        !insidePicker) {
        closeFloatingMenu();
    }
});
console.log("Got to the end of the file");
