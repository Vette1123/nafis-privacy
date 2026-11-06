// Resolve the language BEFORE first paint. The whole document flips direction, so deciding
// after paint moved the header across the viewport: a visible LTR to RTL flash and a layout
// shift on every Arabic visit. ONE storage key for the whole site, install page included, so a
// choice made on any page holds on every other.
//
// Two kinds of page: most carry both languages and flip in place; the install page is one URL
// per language (go, go-ar), names the other in <html data-alt>, and is swapped for it instead.
(function () {
  var root = document.documentElement;
  var served = root.lang === "ar" ? "ar" : "en";
  var alt = root.getAttribute("data-alt");
  function stored() {
    try {
      // go-lang: the install page's own key until 6 Nov 2026, read so an old choice still counts.
      return localStorage.getItem("nafis-privacy-lang") || localStorage.getItem("go-lang");
    } catch (e) {
      return null; // private browsing can block storage
    }
  }
  // A deep link to a section anchor wins over the stored choice, so a shared section link
  // always lands on the section it names.
  function pick() {
    if (/^#ar-/.test(location.hash)) return "ar";
    if (/^#en-/.test(location.hash)) return "en";
    var saved = stored();
    if (saved === "ar" || saved === "en") return saved;
    // A crawler reads the page in the language it is served in: the bank pages earn their
    // impressions in Arabic, and Googlebot's en-US would otherwise hide that copy.
    if (/bot|crawl|spider|slurp/i.test(navigator.userAgent || "")) return served;
    // Someone who opened the Arabic install URL asked for Arabic, whatever their phone's locale.
    if (alt && served === "ar") return "ar";
    return (navigator.language || "en").toLowerCase().indexOf("ar") === 0 ? "ar" : "en";
  }
  var lang = pick();
  if (alt && lang !== served) {
    // Nothing paints in the wrong language on the way out.
    root.style.visibility = "hidden";
    location.replace(alt + location.search + location.hash);
    return;
  }
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
  root.classList.add("lang-" + lang);
})();
