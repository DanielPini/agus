import type { State } from "./pointer-tracker.js";

export type Language = "english" | "french" | "german" | "indonesian";

export const languages: Language[] = ["english", "french", "german", "indonesian"];

export type CaptionText = Record<Language, string>;

export type CustomCaption = {
  id: number;
  timestamps?: string;
  text: CaptionText;
  condition: (state: State) => boolean;
  duration: number;
};

export type Caption = {
  id: number;
  timestamps?: string;
  text: CaptionText;
  timeStart: number;
  duration: number;
};
