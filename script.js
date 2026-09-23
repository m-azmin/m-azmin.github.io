/* Azmin Yusmizan portfolio: shared script for index.html and privacy.html */
(function () {
  "use strict";

  /* ---------- Language switching ---------- */

  var SUPPORTED = ["en", "fr", "ms", "es"];
  var LABELS = { en: "EN", fr: "FR", ms: "MS", es: "ES" };
  var STORAGE_KEY = "lang";
  var cache = {};

  var langBtn = document.getElementById("langBtn");
  var langMenu = document.getElementById("langMenu");
  var currentLang = document.getElementById("currentLang");

  // English lives in the HTML; remember it so switching back needs no request.
  var i18nEls = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  var originals = i18nEls.map(function (el) {
    return el.innerHTML;
  });

  function readStored() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function writeStored(code) {
    try {
      if (code === "en") {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, code);
      }
    } catch (e) {
      /* storage unavailable: the choice simply won't persist */
    }
  }

  function applyDictionary(dict) {
    i18nEls.forEach(function (el, i) {
      var key = el.getAttribute("data-i18n");
      var value = dict ? dict[key] : null;
      el.innerHTML = typeof value === "string" ? value : originals[i];
    });
  }

  function markCurrent(code) {
    document.documentElement.lang = code;
    if (currentLang) currentLang.textContent = LABELS[code];
    if (langMenu) {
      langMenu.querySelectorAll("button[data-lang]").forEach(function (b) {
        if (b.getAttribute("data-lang") === code) {
          b.setAttribute("aria-current", "true");
        } else {
          b.removeAttribute("aria-current");
        }
      });
    }
  }

  function loadDictionary(code) {
    if (cache[code]) return Promise.resolve(cache[code]);
    return fetch("lang/" + code + ".json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (dict) {
        cache[code] = dict;
        return dict;
      });
  }

  function setLanguage(code) {
    if (SUPPORTED.indexOf(code) === -1) code = "en";
    if (code === "en") {
      applyDictionary(null);
      markCurrent("en");
      writeStored("en");
      return;
    }
    loadDictionary(code)
      .then(function (dict) {
        applyDictionary(dict);
        markCurrent(code);
        writeStored(code);
      })
      .catch(function (err) {
        console.warn("Could not load the " + code + " translation:", err);
      });
  }

  function closeLangMenu() {
    if (!langMenu || !langBtn) return;
    langMenu.hidden = true;
    langBtn.setAttribute("aria-expanded", "false");
  }

  if (langBtn && langMenu) {
    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = langMenu.hidden;
      langMenu.hidden = !open;
      langBtn.setAttribute("aria-expanded", String(open));
      if (open) {
        var first = langMenu.querySelector("button[aria-current]") || langMenu.querySelector("button");
        if (first) first.focus();
      }
    });

    langMenu.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-lang]");
      if (!btn) return;
      setLanguage(btn.getAttribute("data-lang"));
      closeLangMenu();
      langBtn.focus();
    });

    document.addEventListener("click", function (e) {
      if (!langMenu.hidden && !langMenu.contains(e.target) && !langBtn.contains(e.target)) {
        closeLangMenu();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !langMenu.hidden) {
        closeLangMenu();
        langBtn.focus();
      }
    });
  }

  var stored = readStored();
  if (stored && stored !== "en") {
    setLanguage(stored);
  } else {
    markCurrent("en");
  }

  /* ---------- Mobile navigation ---------- */

  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function closeNav() {
    if (!navToggle || !navLinks) return;
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = !navLinks.classList.contains("is-open");
      navLinks.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) closeNav();
    });
  }

  /* ---------- Highlight the section in view ---------- */

  if (navLinks && "IntersectionObserver" in window) {
    var linkFor = {};
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (a) {
      linkFor[a.getAttribute("href").slice(1)] = a;
    });
    var sections = Object.keys(linkFor)
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkFor[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            Object.keys(linkFor).forEach(function (k) {
              linkFor[k].removeAttribute("aria-current");
            });
            link.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ---------- Project filters ---------- */

  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var projects = Array.prototype.slice.call(document.querySelectorAll(".project"));

  function categoriesOf(el) {
    return (el.getAttribute("data-category") || "").split(/\s+/).filter(Boolean);
  }

  filterBtns.forEach(function (btn) {
    var filter = btn.getAttribute("data-filter");
    var count = filter === "all"
      ? projects.length
      : projects.filter(function (p) {
          return categoriesOf(p).indexOf(filter) !== -1;
        }).length;
    var countEl = btn.querySelector(".count");
    if (countEl) countEl.textContent = count;

    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      projects.forEach(function (p) {
        p.hidden = !(filter === "all" || categoriesOf(p).indexOf(filter) !== -1);
      });
    });
  });

  /* ---------- Contact form (Formspree, with a no-JS fallback) ---------- */

  var form = document.getElementById("contactForm");

  if (form && window.fetch && window.FormData) {
    var status = form.querySelector(".form-status");
    var submit = form.querySelector('button[type="submit"]');

    var showStatus = function (state) {
      status.querySelectorAll("[data-state]").forEach(function (s) {
        s.hidden = s.getAttribute("data-state") !== state;
      });
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      showStatus("sending");
      submit.disabled = true;

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.reset();
          showStatus("ok");
        })
        .catch(function () {
          showStatus("error");
        })
        .then(function () {
          submit.disabled = false;
        });
    });
  }

  /* ---------- Footer year ---------- */

  var year = String(new Date().getFullYear());
  document.querySelectorAll(".year").forEach(function (el) {
    el.textContent = year;
  });
})();
