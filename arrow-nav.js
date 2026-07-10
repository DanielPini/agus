export function enableArrowNav(list, orientation, onEscape, onMove) {
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    list.addEventListener("keydown", (e) => {
        const buttons = Array.from(list.querySelectorAll(":scope > button"));
        const idx = buttons.indexOf(document.activeElement);
        if (e.key === prevKey && idx > -1) {
            e.preventDefault();
            const next = buttons[(idx - 1 + buttons.length) % buttons.length];
            next.focus();
            onMove
                ? onMove(next)
                : next.scrollIntoView({ inline: "nearest", block: "nearest" });
        }
        else if (e.key === nextKey && idx > -1) {
            e.preventDefault();
            const next = buttons[(idx + 1) % buttons.length];
            next.focus();
            onMove
                ? onMove(next)
                : next.scrollIntoView({ inline: "nearest", block: "nearest" });
        }
        else if (e.key === "Escape") {
            e.preventDefault();
            onEscape();
        }
    });
}
