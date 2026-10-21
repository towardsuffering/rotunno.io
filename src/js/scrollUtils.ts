/**
 * * runs a scroll-driven `update` only while `el` is near the viewport, at most once per frame
 * @param el: the section whose position drives the effect
 * @param update: reads the section's position and applies the effect
 *
 * Off-screen sections cost nothing while scrolling, and the browser never has to lay out
 * the page twice in one frame for an effect nobody can see. When the section enters or leaves
 * the band, `update` runs once more so a fast flick still leaves it in its settled state.
 */
export function onScrollWhileNear(el: Element, update: () => void) {
  let near = false;
  let queued = false;
  const run = () => {
    queued = false;
    update();
  };
  const schedule = () => {
    if (!near || queued) return;
    queued = true;
    requestAnimationFrame(run);
  };

  new IntersectionObserver(
    ([entry]) => {
      near = entry.isIntersecting;
      requestAnimationFrame(update);
    },
    { rootMargin: "50% 0px" },
  ).observe(el);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}
