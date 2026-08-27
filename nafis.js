// Both languages ship in the DOM so crawlers and reader modes see the full policy.
// The toggle only flips visibility plus the document lang/dir.
(function () {
  var docs = { ar: document.getElementById("doc-ar"), en: document.getElementById("doc-en") };
  var btns = { ar: document.getElementById("btn-ar"), en: document.getElementById("btn-en") };
  var root = document.documentElement;

  function apply(lang, remember) {
    var other = lang === "ar" ? "en" : "ar";
    docs[lang].classList.remove("lang-hidden");
    docs[other].classList.add("lang-hidden");
    btns[lang].setAttribute("aria-pressed", "true");
    btns[other].setAttribute("aria-pressed", "false");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    if (remember) {
      try {
        localStorage.setItem("nafis-privacy-lang", lang);
      } catch (e) {
        // Private browsing can block storage. The toggle still works for this visit.
      }
    }
  }

  // A deep link to a section anchor wins over the stored choice, so a shared
  // section link always lands on the section it names.
  function langFromHash(hash) {
    if (/^#en-/.test(hash)) return "en";
    if (/^#ar-/.test(hash)) return "ar";
    return null;
  }

  function storedLang() {
    try {
      return localStorage.getItem("nafis-privacy-lang");
    } catch (e) {
      return null; // private browsing can block storage
    }
  }

  function browserLang() {
    var tag = (navigator.language || "ar").toLowerCase();
    return tag.indexOf("ar") === 0 ? "ar" : "en";
  }

  apply(langFromHash(location.hash) || storedLang() || browserLang(), false);

  btns.ar.addEventListener("click", function () {
    apply("ar", true);
  });
  btns.en.addEventListener("click", function () {
    apply("en", true);
  });
})();
