import { type Language, languages } from "./captions.js";

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
  const root = document.documentElement;
  root.style.setProperty(
    "--caption-font-family",
    `${quoteIfNeeded(settings.fontFamily)}, sans-serif`,
  );
  root.style.setProperty("--caption-colour", settings.fontColour);
  root.style.setProperty("--caption-box-colour", settings.boxColour);
  root.setAttribute("lang", languageCodes[settings.language]);
  root.setAttribute("data-audio-description", settings.audioDescription);
  listeners.forEach((fn) => fn(settings));
}

applySettings();
