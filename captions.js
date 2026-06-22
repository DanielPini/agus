export const captions = [
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
export const customCaptions = [
    {
        id: 5,
        text: "You're moving too fast",
        condition: (state) => state.speed > 6,
        duration: 1000,
    },
    {
        id: 6,
        text: "Wait, don't leave",
        condition: (state) => state.position.y < 100 && state.directionY === "up",
        duration: 1000,
    },
];
