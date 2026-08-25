// A horizontal strip whose overflow is CSS `visible` (nothing is clipped) —
// "scrolling" is instead a `transform: translateX()` on an inner track,
// driven by pointer drag (mouse + touch, unified via the Pointer Events API)
// and by wheel input. `viewport` is the stable, untransformed element used
// as the reference frame for centering math; `track` is the element that
// actually moves and holds the items.
export function makeDraggableTrack(
  viewport: HTMLElement,
  track: HTMLElement,
  onChange?: () => void,
) {
  let offset = 0;
  let dragging = false; // pointer is down, watching for movement
  let engaged = false; // movement passed the threshold — an actual drag
  let startClientX = 0;
  let startOffset = 0;
  const DRAG_THRESHOLD = 5;

  // "none", not "pan-y" — pan-y explicitly tells the browser it's free to
  // start a native vertical scroll on this element without waiting for our
  // own pointer handling, so any touch-drag with even a slight vertical
  // component fires both at once: our horizontal drag and a page scroll.
  // "none" hands the whole gesture (and pinch-zoom) to our pointer events
  // instead, so nothing else can fire while the user is dragging here.
  viewport.style.touchAction = "none";
  viewport.style.cursor = "grab";

  // The allowed range is exactly "however far centers the first item" to
  // "however far centers the last item" — not an approximation via slack
  // plus a padding allowance (that double-counted: the old slack-based
  // range was already sized differently for a track wider vs. narrower
  // than its viewport, so adding a flat allowance on top overshot badly
  // for a narrow track like a 2-item "off"/"on" row, dragging it right off
  // the screen, while undershooting for others). Computing the exact
  // centering offset for both edges directly — the same math centerOn()
  // already uses — is correct for any track width with no separate cases,
  // and it's never looser than it needs to be.
  function clampOffset(px: number): number {
    const firstItem = track.firstElementChild as HTMLElement | null;
    const lastItem = track.lastElementChild as HTMLElement | null;
    if (!firstItem || !lastItem) return px;

    const viewportRect = viewport.getBoundingClientRect();
    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    const firstRect = firstItem.getBoundingClientRect();
    const lastRect = lastItem.getBoundingClientRect();

    const max = offset + (viewportCenter - (firstRect.left + firstRect.width / 2));
    const min = offset + (viewportCenter - (lastRect.left + lastRect.width / 2));

    return Math.max(min, Math.min(max, px));
  }

  function setOffset(px: number, silent = false) {
    offset = clampOffset(px);
    track.style.transform = `translateX(${offset}px)`;
    if (!silent) onChange?.();
  }

  function resetOffset() {
    offset = 0;
    track.style.transform = "";
  }

  // Silent: the caller already knows which item was chosen (click, keyboard,
  // or the initial open) — re-running onChange's "closest item to center"
  // geometry check here would fight that known value. clampOffset can stop
  // an edge item (e.g. the first one) from ever reaching true center, so the
  // geometry check would then land on its neighbour instead and overwrite
  // the correct selection. onChange stays wired to setOffset's own drag/wheel
  // calls, where geometry genuinely is the only source of truth.
  function centerOn(item: HTMLElement) {
    const viewportRect = viewport.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    const itemCenter = itemRect.left + itemRect.width / 2;
    setOffset(offset + (viewportCenter - itemCenter), true);
  }

  // Pointer capture is deferred until real movement is detected. Capturing
  // immediately on pointerdown retargets ALL subsequent pointer/click events
  // to the capturing element (per the Pointer Events spec) — which silently
  // broke every plain click/tap, not just drags, since the underlying
  // button never received its own pointerup/click.
  viewport.addEventListener("pointerdown", (e: PointerEvent) => {
    dragging = true;
    engaged = false;
    startClientX = e.clientX;
    startOffset = offset;
  });

  viewport.addEventListener("pointermove", (e: PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - startClientX;
    if (!engaged) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      engaged = true;
      viewport.setPointerCapture(e.pointerId);
      viewport.style.cursor = "grabbing";
    }
    setOffset(startOffset + delta);
  });

  function endDrag(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    viewport.style.cursor = "grab";
    if (engaged) {
      engaged = false;
      viewport.releasePointerCapture(e.pointerId);
      // A real drag happened — swallow the synthetic click that would
      // otherwise fire on release and accidentally select/activate
      // whatever capsule the pointer happens to be over.
      const swallow = (ce: MouseEvent) => {
        ce.stopPropagation();
        ce.preventDefault();
      };
      viewport.addEventListener("click", swallow, {
        capture: true,
        once: true,
      });
    }
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", (e: PointerEvent) => {
    if (dragging && !engaged) dragging = false;
    else if (dragging) endDrag(e);
  });

  viewport.addEventListener(
    "wheel",
    (e: WheelEvent) => {
      e.preventDefault();
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      setOffset(offset - delta);
    },
    { passive: false },
  );

  return { setOffset, getOffset: () => offset, centerOn, resetOffset };
}
