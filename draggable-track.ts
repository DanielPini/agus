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

  viewport.style.touchAction = "pan-y";
  viewport.style.cursor = "grab";

  function clampOffset(px: number): number {
    // When the track is wider than the viewport, this only allows negative
    // offsets (drag left to reveal more, min < 0, max 0) — the classic
    // "flush-left, scroll to see the rest" case. When the track is
    // *narrower* than the viewport (e.g. a short options list like
    // language), `viewport.clientWidth - track.offsetWidth` is positive, so
    // both bounds used to collapse to exactly 0 — locking the track in
    // place and making centerOn() a no-op regardless of which item it was
    // asked to center. Allowing a symmetric positive range here lets a
    // narrow track still be shifted right to bring any specific item to
    // the viewport's center.
    const slack = viewport.clientWidth - track.offsetWidth;
    const min = Math.min(0, slack);
    const max = Math.max(0, slack);
    return Math.max(min, Math.min(max, px));
  }

  function setOffset(px: number) {
    offset = clampOffset(px);
    track.style.transform = `translateX(${offset}px)`;
    onChange?.();
  }

  function resetOffset() {
    offset = 0;
    track.style.transform = "";
  }

  function centerOn(item: HTMLElement) {
    const viewportRect = viewport.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    const itemCenter = itemRect.left + itemRect.width / 2;
    setOffset(offset + (viewportCenter - itemCenter));
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
