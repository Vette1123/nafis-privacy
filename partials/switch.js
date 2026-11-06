// Light/dark switch, shared by every page. With no choice stored the page follows the
// system; a click stores the opposite of what is showing now. The choice is one
// localStorage key for the whole site, so it follows the reader from page to page.
// The button's label is in the page's current language and follows the language switch.
(function () {
  var root = document.documentElement;
  var sw = document.querySelector('.theme');
  if (!sw) return;
  var dark = function () { var t = root.getAttribute('data-theme'); return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
  var label = function () { sw.setAttribute('aria-label', sw.getAttribute('data-' + (dark() ? 'light' : 'dark') + '-' + (root.lang === 'ar' ? 'ar' : 'en'))); };
  label();
  document.addEventListener('langchange', label);
  sw.addEventListener('click', function () {
    var t = dark() ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('go-theme', t); } catch (e) {}
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.content = t === 'dark' ? '#0e0b07' : '#faf6ec'; });
    label();
  });
})();
