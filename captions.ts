export type CustomCaption = {
  id: number;
  timestamps?: string;
  text: string;
  condition: (state: State) => boolean;
  duration: number;
};

export type State = {
  directionX: "right" | "left" | "none";
  directionY: "down" | "up" | "none";
  position: { x: number; y: number };
  speed: number;
};

export type Caption = {
  id: number;
  timestamps?: string;
  text: string;
  timeStart: number;
  duration: number;
};

export const captions: Caption[] = [
  {
    id: 1,
    timestamps: "00:00:45 — 00:03:24",
    text: "This was not intended to be remembered",
    timeStart: (45 / 60) * 100,
    duration: 1200,
  },
  {
    id: 2,
    timestamps: "00:04:05 — 00:05:38",
    text: "They’ve given this various names.",
    timeStart: 4 * 1000 + (5 / 60) * 100,
    duration: 600,
  },
  {
    id: 3,
    timestamps: "00:07:02 — 00:07:38",
    text: "You are looking for clarity.",
    timeStart: 7 * 1000 + (2 / 60) * 100,
    duration: 400,
  },
  {
    id: 4,
    timestamps: "00:07:39 — 00:07:55",
    text: "This may not be important.",
    timeStart: 7 * 1000 + (39 / 60) * 100,
    duration: 1200,
  },
  {
    id: 5,
    timestamps: "00:07:56 — 00:09:01",
    text: "You are moving too fast.",
    timeStart: 7 * 1000 + (56 / 60) * 100,
    duration: 1200,
  },
  {
    id: 6,
    timestamps: "00:09:53 — 00:11:49",
    text: "Stillness is often mistaken for depth.",
    timeStart: 9 * 1000 + (53 / 60) * 100,
    duration: 1200,
  },
  {
    id: 7,
    timestamps: "00:15:07 — 00:16:00",
    text: "This has already occured.",
    timeStart: 15 * 1000 + (7 / 60) * 100,
    duration: 1200,
  },
  {
    id: 8,
    timestamps: "00:19:00 — 00:20:59",
    text: "00:19-00.21 (time dilates)",
    timeStart: 19 * 1000,
    duration: 1200,
  },
  {
    id: 9,
    timestamps: "00:23:29 — 00:25:03",
    text: "[something changes off-screen]",
    timeStart: 23 * 1000 + (29 / 60) * 100,
    duration: 1200,
  },
  {
    id: 10,
    timestamps: "00:26:14 — 00:28:44",
    text: '"Are you talking to yourself?"',
    timeStart: 26 * 1000 + (14 / 60) * 100,
    duration: 1200,
  },
  {
    id: 11,
    timestamps: "00:31:00 — 00:31:15",
    text: "ths sctn hs bn rdc",
    timeStart: 31 * 1000,
    duration: 1200,
  },
  {
    id: 12,
    timestamps: "00:34:15 — 00:36:53",
    text: "what were we?",
    timeStart: 34 * 1000 + (15 / 60) * 100,
    duration: 1200,
  },
  {
    id: 13,
    timestamps: "00:40:00 — 00:41:51",
    text: "Some shot lingers too long.",
    timeStart: 40 * 1000,
    duration: 1200,
  },
  {
    id: 14,
    timestamps: "00:43:20 — 00:45:59",
    text: "You are waiting for something to happen.",
    timeStart: 43 * 1000 + (20 / 60) * 100,
    duration: 1200,
  },
  {
    id: 15,
    timestamps: "00:50:57 — 00:53:59",
    text: "A portrait video rotated landscape.",
    timeStart: 50 * 1000 + (57 / 60) * 100,
    duration: 1200,
  },
  {
    id: 16,
    timestamps: "00:55:53 — 00:56:29",
    text: "IMG_2392.MOV is playing.",
    timeStart: 55 * 1000 + (53 / 60) * 100,
    duration: 1200,
  },
  {
    id: 17,
    timestamps: "00:56:30 — 00:58:19",
    text: "IMG_4656.MOV is playing.",
    timeStart: 56 * 1000 + (30 / 60) * 100,
    duration: 1200,
  },
  {
    id: 18,
    timestamps: "01:07:43 — 01:08:40",
    text: "This was demolished in 2021.",
    timeStart: 1 * 60 * 1000 + 7 * 1000 + (43 / 60) * 100,
    duration: 1200,
  },
  {
    id: 19,
    timestamps: "01:17:35 — 01:18:59",
    text: "Are you still willing?",
    timeStart: 1 * 60 * 1000 + 17 * 1000 + (35 / 60) * 100,
    duration: 1200,
  },
  {
    id: 20,
    timestamps: "01:22:44 — 01:24:19",
    text: "This was about 5,500km from here.",
    timeStart: 1 * 60 * 1000 + 22 * 1000 + (44 / 60) * 100,
    duration: 1200,
  },
  {
    id: 21,
    timestamps: "01:24:20 — 01:26:20",
    text: "Prayer for all beings.",
    timeStart: 1 * 60 * 1000 + 24 * 1000 + (20 / 60) * 100,
    duration: 1200,
  },
  {
    id: 22,
    timestamps: "01:29:10 — 01:30:34",
    text: "[silence continues]",
    timeStart: 1 * 60 * 1000 + 29 * 1000 + (10 / 60) * 100,
    duration: 1200,
  },
  {
    id: 23,
    timestamps: "01:37:47 — 01:38:42",
    text: "Year of the ocean...",
    timeStart: 1 * 60 * 1000 + 37 * 1000 + (47 / 60) * 100,
    duration: 1200,
  },
  {
    id: 24,
    timestamps: "01:38:43 — 01:40:27",
    text: "I remember there was a hill behind.",
    timeStart: 1 * 60 * 1000 + 38 * 1000 + (43 / 60) * 100,
    duration: 1200,
  },
  {
    id: 25,
    timestamps: "01:46:41 — 01:48:27",
    text: "[seen]",
    timeStart: 1 * 60 * 1000 + 46 * 1000 + (41 / 60) * 100,
    duration: 1200,
  },
];

export const captionsLoop2: Caption[] = [
  {
    id: 1,
    timestamps: "00:00:45 — 00:03:05",
    text: "This has already occured.",
    timeStart: (45 / 60) * 100,
    duration: 1200,
  },
  {
    id: 2,
    timestamps: "00:03:46 — 00:05:24",
    text: "You remembered it anyway",
    timeStart: 4 * 1000 + (5 / 60) * 100,
    duration: 600,
  },
  {
    id: 3,
    timestamps: "00:06:33 — 00:07:44",
    text: "You are still looking for clarity.",
    timeStart: 7 * 1000 + (2 / 60) * 100,
    duration: 400,
  },
  {
    id: 4,
    timestamps: "00:07:48 — 00:08:50",
    text: "This may not be important.",
    timeStart: 7 * 1000 + (39 / 60) * 100,
    duration: 1200,
  },
  {
    id: 5,
    timestamps: "00:09:53 — 00:11:49",
    text: "Stillness is often mistaken for depth.",
    timeStart: 7 * 1000 + (56 / 60) * 100,
    duration: 1200,
  },
  {
    id: 6,
    timestamps: "00:15:07 — 00:16:00",
    text: "xx px/s",
    timeStart: 9 * 1000 + (53 / 60) * 100,
    duration: 1200,
  },
  {
    id: 7,
    timestamps: "00:19:00 — 00:20:59",
    text: "(time dilates)",
    timeStart: 15 * 1000 + (7 / 60) * 100,
    duration: 1200,
  },
  {
    id: 8,
    timestamps: "00:23:29 — 00:25:03",
    text: "[something changes off-screen]",
    timeStart: 19 * 1000,
    duration: 1200,
  },
  {
    id: 9,
    timestamps: "00:26:14 — 00:28:44",
    text: '"Are you talking to yourself?"',
    timeStart: 23 * 1000 + (29 / 60) * 100,
    duration: 1200,
  },
  {
    id: 10,
    timestamps: "00:31:00 — 00:31:15",
    text: "ths sctn hs bn rdc",
    timeStart: 26 * 1000 + (14 / 60) * 100,
    duration: 1200,
  },
  {
    id: 13,
    timestamps: "00:34:15 — 00:36:53",
    text: "what were we?",
    timeStart: 34 * 1000 + (15 / 60) * 100,
    duration: 1200,
  },
  {
    id: 14,
    timestamps: "00:40:00 — 00:41:51",
    text: "Some shot lingers too long.",
    timeStart: 40 * 1000,
    duration: 1200,
  },
  {
    id: 15,
    timestamps: "00:43:20 — 00:45:19",
    text: "Something may have already happened.",
    timeStart: 43 * 1000 + (20 / 60) * 100,
    duration: 1200,
  },
  {
    id: 16,
    timestamps: "00:50:57 — 00:53:45",
    text: ">> time stamp",
    timeStart: 50 * 1000 + (57 / 60) * 100,
    duration: 1200,
  },
  {
    id: 17,
    timestamps: "00:55:53 — 00:56:29",
    text: "IMG_2392.MOV is playing.",
    timeStart: 55 * 1000 + (53 / 60) * 100,
    duration: 1200,
  },
  {
    id: 18,
    timestamps: "00:56:30 — 00:58:19",
    text: "IMG_4656.MOV is playing.",
    timeStart: 56 * 1000 + (30 / 60) * 100,
    duration: 1200,
  },
  {
    id: 19,
    timestamps: "01:07:43 — 01:08:40",
    text: "This was demolished in 2021.",
    timeStart: 1 * 60 * 1000 + 7 * 1000 + (43 / 60) * 100,
    duration: 1200,
  },
  {
    id: 20,
    timestamps: "01:17:35 — 01:18:59",
    text: "Are you still willing?",
    timeStart: 1 * 60 * 1000 + 17 * 1000 + (35 / 60) * 100,
    duration: 1200,
  },
  {
    id: 21,
    timestamps: "01:21:15 — 01:22:43",
    text: "How’s this relevant here?",
    timeStart: 1 * 60 * 1000 + 22 * 1000 + (44 / 60) * 100,
    duration: 1200,
  },
  {
    id: 22,
    timestamps: "01:24:20 — 01:26:20",
    text: "Prayer for all beings.",
    timeStart: 1 * 60 * 1000 + 24 * 1000 + (20 / 60) * 100,
    duration: 1200,
  },
  {
    id: 23,
    timestamps: "01:29:10 — 01:30:34",
    text: "[silence continues]",
    timeStart: 1 * 60 * 1000 + 29 * 1000 + (10 / 60) * 100,
    duration: 1200,
  },
  {
    id: 24,
    timestamps: "01:37:47 — 01:38:42",
    text: "Year of the ocean...",
    timeStart: 1 * 60 * 1000 + 37 * 1000 + (47 / 60) * 100,
    duration: 1200,
  },
  {
    id: 25,
    timestamps: "01:38:43 — 01:40:27",
    text: ">> activity",
    timeStart: 1 * 60 * 1000 + 38 * 1000 + (43 / 60) * 100,
    duration: 1200,
  },
  {
    id: 26,
    timestamps: "01:45:38 — 01:48:27",
    text: "You have already seen this.",
    timeStart: 1 * 60 * 1000 + 46 * 1000 + (41 / 60) * 100,
    duration: 1200,
  },
];

export const customCaptions: CustomCaption[] = [
  {
    id: 5,
    text: "You're moving too fast",
    condition: (state: State) => state.speed > 6,
    duration: 1000,
  },
  {
    id: 6,
    text: "Wait, don't leave",
    condition: (state: State) =>
      state.position.y < 100 && state.directionY === "up",
    duration: 1000,
  },
];
