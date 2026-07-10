export type State = {
  directionX: "right" | "left" | "none";
  directionY: "down" | "up" | "none";
  position: { x: number; y: number };
  speed: number;
};

const initialState: State = {
  directionX: "none",
  directionY: "none",
  position: { x: 0, y: 0 },
  speed: 0,
};

export function createPointerTracker(): { getState: () => State } {
  let state = initialState;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;

  window.addEventListener("mousemove", (e: MouseEvent) => {
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

  return { getState: () => state };
}
