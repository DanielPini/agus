import { type Language, languages } from "./captions-types.js";

export type FontFamily = "Helvetica" | "Georgia" | "Courier New" | "Times New Roman";
export type FontColour = "white" | "black" | "red" | "cyan" | "yellow";
export type BoxColour = "black" | "white" | "transparent" | "red";
export type AudioDescription = "off" | "on";

export type Settings = {
  fontFamily: FontFamily;
  fontColour: FontColour;
  boxColour: BoxColour;
  language: Language;
  audioDescription: AudioDescription;
};

export const defaultSettings: Settings = {
  fontFamily: "Helvetica",
  fontColour: "white",
  boxColour: "black",
  language: "english",
  audioDescription: "off",
};

export const options: { [K in keyof Settings]: Settings[K][] } = {
  fontFamily: ["Helvetica", "Georgia", "Courier New", "Times New Roman"],
  fontColour: ["white", "black", "red", "cyan", "yellow"],
  boxColour: ["black", "white", "transparent", "red"],
  language: languages,
  audioDescription: ["off", "on"],
};

export const languageLabels: Record<Language, string> = {
  english: "English",
  french: "Français",
  german: "Deutsch",
  indonesian: "Bahasa Indonesia",
};

const languageCodes: Record<Language, string> = {
  english: "en",
  french: "fr",
  german: "de",
  indonesian: "id",
};

export const audioDescriptionLabels: Record<AudioDescription, string> = {
  off: "Off",
  on: "On",
};

export function labelFor<K extends keyof Settings>(
  key: K,
  value: Settings[K],
): string {
  if (key === "language") return languageLabels[value as Language];
  if (key === "audioDescription")
    return audioDescriptionLabels[value as AudioDescription];
  return String(value);
}

let settings: Settings = { ...defaultSettings };
const listeners: Array<(s: Settings) => void> = [];

export function getSettings(): Settings {
  return settings;
}

export function onSettingsChange(fn: (s: Settings) => void) {
  listeners.push(fn);
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  if (settings[key] === value) return;
  settings = { ...settings, [key]: value };
  applySettings();
}

export function resetKeys(keys: (keyof Settings)[]) {
  settings = { ...settings };
  keys.forEach((key) => {
    (settings as any)[key] = defaultSettings[key];
  });
  applySettings();
}

export function resetSettings() {
  settings = { ...defaultSettings };
  applySettings();
}

function quoteIfNeeded(fontFamily: FontFamily): string {
  return fontFamily.includes(" ") ? `"${fontFamily}"` : fontFamily;
}

function applySettings() {
  // captions.css declares --caption-* on #agus-root (.agus-scope) itself, not
  // :root — a stylesheet rule on a closer ancestor always wins over a value
  // set further up via documentElement.style, so these have to be set on the
  // same element captions.css declares them on, or they're silently ignored.
  // #agus-root doesn't exist yet on the very first call (module load, before
  // dom.ts has built anything) — falls back to documentElement.style then,
  // which is harmless since it just matches the CSS's own defaults.
  const scopeRoot = document.getElementById("agus-root") ?? document.documentElement;
  scopeRoot.style.setProperty(
    "--caption-font-family",
    `${quoteIfNeeded(settings.fontFamily)}, sans-serif`,
  );
  scopeRoot.style.setProperty("--caption-colour", settings.fontColour);
  scopeRoot.style.setProperty("--caption-box-colour", settings.boxColour);

  document.documentElement.setAttribute("lang", languageCodes[settings.language]);
  document.documentElement.setAttribute(
    "data-audio-description",
    settings.audioDescription,
  );
  listeners.forEach((fn) => fn(settings));
}

applySettings();
