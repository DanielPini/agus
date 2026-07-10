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
function enableArrowNav(list, orientation, onEscape) {
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    list.addEventListener("keydown", (e) => {
        const buttons = Array.from(list.querySelectorAll(":scope > button"));
        const idx = buttons.indexOf(document.activeElement);
        if (e.key === prevKey && idx > -1) {
            e.preventDefault();
            buttons[(idx - 1 + buttons.length) % buttons.length].focus();
        }
        else if (e.key === nextKey && idx > -1) {
            e.preventDefault();
            buttons[(idx + 1) % buttons.length].focus();
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
    render();
    if (opts.focusOnBuild) {
        (_a = (container.querySelector(".capsule"))) === null || _a === void 0 ? void 0 : _a.focus();
    }
}
// ---------- Shared bottom picker ----------
const picker = document.querySelector("#settings-picker");
const pickerTrack = document.querySelector("#picker-track");
const pickerClose = document.querySelector("#picker-close");
let activePickerKey = null;
let pickerReturnFocus = null;
function closePicker() {
    if (picker.hidden)
        return;
    picker.hidden = true;
    pickerTrack.replaceChildren();
    pickerTrack.removeEventListener("scroll", onPickerScroll);
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
    const items = Array.from(pickerTrack.querySelectorAll(".picker-item"));
    const idx = items.indexOf(item);
    const next = items[idx + dir];
    if (next) {
        next.focus();
        next.scrollIntoView({ inline: "center", block: "nearest" });
        if (activePickerKey) {
            setSetting(activePickerKey, next.dataset.value);
        }
    }
}
function openPicker(key, onClose) {
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
        pickerTrack.append(item);
    });
    pickerTrack.addEventListener("scroll", onPickerScroll);
    requestAnimationFrame(() => {
        var _a;
        scrollToValue(getSettings()[key]);
        requestAnimationFrame(updateActiveItem);
        (_a = pickerTrack
            .querySelector(`[data-value="${CSS.escape(String(getSettings()[key]))}"]`)) === null || _a === void 0 ? void 0 : _a.focus();
    });
}
function onPickerScroll() {
    requestAnimationFrame(() => {
        const active = updateActiveItem();
        if (active && activePickerKey) {
            setSetting(activePickerKey, active.dataset.value);
        }
    });
}
function updateActiveItem() {
    const containerRect = pickerTrack.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    let closest = null;
    let closestDist = Infinity;
    const items = pickerTrack.querySelectorAll(".picker-item");
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
function scrollToValue(value) {
    pickerTrack.querySelectorAll(".picker-item").forEach((item) => {
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
const inlineSettings = document.querySelector("#settings-inline");
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
    }
    else {
        closeFloatingMenu();
    }
});
document.addEventListener("click", (e) => {
    if (floatingMenu.hidden)
        return;
    // Use composedPath, not e.target: a capsule click re-renders the menu
    // and detaches the clicked button before this listener runs, which
    // would make a `.contains(target)` check see it as an outside click.
    const path = e.composedPath();
    if (path.includes(floatingMenu) ||
        path.includes(burgerButton) ||
        path.includes(picker)) {
        return;
    }
    closeFloatingMenu();
});
console.log("Got to the end of the file");
