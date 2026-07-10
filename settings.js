import { languages } from "./captions.js";
export const defaultSettings = {
    fontFamily: "Helvetica",
    fontColour: "white",
    boxColour: "black",
    language: "english",
    audioDescription: "off",
};
export const options = {
    fontFamily: ["Helvetica", "Georgia", "Courier New", "Times New Roman"],
    fontColour: ["white", "black", "red", "cyan", "yellow"],
    boxColour: ["black", "white", "transparent", "red"],
    language: languages,
    audioDescription: ["off", "on"],
};
export const languageLabels = {
    english: "English",
    french: "Français",
    german: "Deutsch",
    indonesian: "Bahasa Indonesia",
};
const languageCodes = {
    english: "en",
    french: "fr",
    german: "de",
    indonesian: "id",
};
export const audioDescriptionLabels = {
    off: "Off",
    on: "On",
};
export function labelFor(key, value) {
    if (key === "language")
        return languageLabels[value];
    if (key === "audioDescription")
        return audioDescriptionLabels[value];
    return String(value);
}
let settings = Object.assign({}, defaultSettings);
const listeners = [];
export function getSettings() {
    return settings;
}
export function onSettingsChange(fn) {
    listeners.push(fn);
}
export function setSetting(key, value) {
    if (settings[key] === value)
        return;
    settings = Object.assign(Object.assign({}, settings), { [key]: value });
    applySettings();
}
export function resetKeys(keys) {
    settings = Object.assign({}, settings);
    keys.forEach((key) => {
        settings[key] = defaultSettings[key];
    });
    applySettings();
}
export function resetSettings() {
    settings = Object.assign({}, defaultSettings);
    applySettings();
}
function quoteIfNeeded(fontFamily) {
    return fontFamily.includes(" ") ? `"${fontFamily}"` : fontFamily;
}
function applySettings() {
    const root = document.documentElement;
    root.style.setProperty("--caption-font-family", `${quoteIfNeeded(settings.fontFamily)}, sans-serif`);
    root.style.setProperty("--caption-colour", settings.fontColour);
    root.style.setProperty("--caption-box-colour", settings.boxColour);
    root.setAttribute("lang", languageCodes[settings.language]);
    root.setAttribute("data-audio-description", settings.audioDescription);
    listeners.forEach((fn) => fn(settings));
}
applySettings();
