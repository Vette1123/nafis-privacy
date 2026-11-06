// The language pill, the same two buttons on every page. A two-language page flips in place;
// the install page (one URL per language, <html data-alt>) goes to its other URL. Either way the
// choice is stored under the one key every page's head script (lang-pick.js) reads.
(function () {
  var root = document.documentElement;
  var en = document.getElementById("btn-en");
  var ar = document.getElementById("btn-ar");
  if (!en || !ar) return;
  var alt = root.getAttribute("data-alt");

  function remember(lang) {
    try {
      localStorage.setItem("nafis-privacy-lang", lang);
      localStorage.removeItem("go-lang");
    } catch (e) {
      // Private browsing can block storage. The switch still works for this visit.
    }
  }

  function apply(lang) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.classList.toggle("lang-ar", lang === "ar");
    root.classList.toggle("lang-en", lang === "en");
    en.setAttribute("aria-pressed", String(lang === "en"));
    ar.setAttribute("aria-pressed", String(lang === "ar"));
    // A page served under one title (the bank pages: Arabic) names its other one here.
    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;
  }

  function choose(lang) {
    remember(lang);
    if (lang === root.lang) return;
    if (alt) {
      location.href = alt + location.search;
      return;
    }
    apply(lang);
    document.dispatchEvent(new Event("langchange"));
  }

  // The markup ships aria-pressed for English; catch it up to the head's pick.
  apply(root.lang === "ar" ? "ar" : "en");
  en.addEventListener("click", function () { choose("en"); });
  ar.addEventListener("click", function () { choose("ar"); });
})();
