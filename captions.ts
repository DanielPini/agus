export type CustomCaption = {
  id: number;
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
  text: string;
  timeStart: number;
  duration: number;
};

export const captions: Caption[] = [
  {
    id: 1,
    text: "Hello World",
    timeStart: 100,
    duration: 1200,
  },
  {
    id: 2,
    text: "This is me",
    timeStart: 1400,
    duration: 600,
  },
  {
    id: 3,
    text: "Life could be",
    timeStart: 2100,
    duration: 400,
  },
  {
    id: 4,
    text: "Fun for everyone",
    timeStart: 2600,
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
