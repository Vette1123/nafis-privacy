// The header stays one flick away without covering what is being read: it scrolls away with
// the page going down and slides back the moment the reader scrolls up. Two classes on <html>,
// all motion is CSS (theme.css):
//   top-stuck   scrolled past the top: the header takes its own background
//   top-hidden  going down, past the header: it is translated out of view
// --top-h holds the header's height, so pinned things (the policy's Contents) sit below it.
(function () {
  var root = document.documentElement;
  var top = document.querySelector('.top');
  if (!top) return;
  var NUDGE = 8; // px of travel before a direction counts: a trackpad's jitter never toggles it
  var last = scrollY;
  var hold = 0; // until then an in-page jump keeps the header away
  var queued = false;

  function measure() { root.style.setProperty('--top-h', top.offsetHeight + 'px'); }
  function hide(on) { root.classList.toggle('top-hidden', on); }

  function update() {
    queued = false;
    var y = Math.max(0, scrollY);
    root.classList.toggle('top-stuck', y > 0);
    if (y <= top.offsetHeight) { hide(false); last = y; return; }
    if (performance.now() < hold) { hide(true); last = y; return; }
    if (Math.abs(y - last) < NUDGE) return;
    // Never hide what holds keyboard focus.
    hide(y > last && !top.contains(document.activeElement));
    last = y;
  }

  addEventListener('scroll', function () {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  // A Contents link or a section anchor is a jump to read: the header stays out of the way,
  // even when the jump goes up the page.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && !top.contains(a)) hold = performance.now() + 1200;
  });
  top.addEventListener('focusin', function () { hide(false); });
  if (window.ResizeObserver) new ResizeObserver(measure).observe(top);
  measure();
  update();
})();
