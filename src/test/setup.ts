// jsdom has no canvas. Returning null makes text measurement use its
// deterministic fallback instead of logging "not implemented" errors.
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
}
