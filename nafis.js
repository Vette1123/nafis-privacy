// Both languages ship in the DOM so crawlers and reader modes see the full policy.
// The inline head script has already picked one and stamped the root element; this
// only wires the toggle and keeps the buttons' announced state in step.
(function () {
  var root = document.documentElement;
  var ar = document.getElementById("btn-ar");
  var en = document.getElementById("btn-en");
  if (!ar || !en) return;

  function apply(lang, remember) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.classList.toggle("lang-en", lang === "en");
    root.classList.toggle("lang-ar", lang === "ar");
    ar.setAttribute("aria-pressed", String(lang === "ar"));
    en.setAttribute("aria-pressed", String(lang === "en"));
    if (remember) {
      try {
        localStorage.setItem("nafis-privacy-lang", lang);
      } catch (e) {
        // Private browsing can block storage. The toggle still works for this visit.
      }
    }
  }

  // The markup ships aria-pressed for Arabic; catch it up to what the head script chose.
  apply(root.lang === "en" ? "en" : "ar", false);

  ar.addEventListener("click", function () {
    apply("ar", true);
  });
  en.addEventListener("click", function () {
    apply("en", true);
  });
})();
