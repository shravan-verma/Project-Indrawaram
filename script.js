/* The Indrawaram Cafe — interactions
   Vanilla JS only. No dependencies. */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky nav state ---------- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile drawer ---------- */
  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");

  burger.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  });

  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A" && links.classList.contains("is-open")) {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });

  /* ---------- menu tabs ---------- */
  var tabs = document.querySelectorAll(".menu__tab");
  var panels = document.querySelectorAll(".menu__panel");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      panels.forEach(function (p) { p.classList.remove("is-active"); });

      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var panel = document.querySelector('[data-panel="' + tab.dataset.tab + '"]');
      if (panel) panel.classList.add("is-active");
    });
  });

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var stagger = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = Math.min(stagger++ % 4, 3) * 90;
          entry.target.style.transitionDelay = delay + "ms";
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  var animateCount = function (el) {
    var target = parseInt(el.dataset.count, 10);
    if (prefersReduced) { el.textContent = target.toLocaleString("en-IN"); return; }
    var start = null;
    var duration = 1400;
    var step = function (ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-IN");
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- reviews: dots for mobile carousel ---------- */
  var track = document.getElementById("reviewsTrack");
  var dotsWrap = document.getElementById("reviewsDots");
  var cards = track ? track.querySelectorAll(".review") : [];

  if (track && dotsWrap && cards.length) {
    cards.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.setAttribute("aria-label", "Go to review " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () {
        cards[i].scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "nearest",
          inline: "center"
        });
      });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll("button");
    var syncDots = function () {
      var mid = track.scrollLeft + track.clientWidth / 2;
      var closest = 0;
      var minDist = Infinity;
      cards.forEach(function (card, i) {
        var center = card.offsetLeft + card.offsetWidth / 2;
        var dist = Math.abs(center - mid);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === closest); });
    };
    track.addEventListener("scroll", syncDots, { passive: true });
  }

  /* ---------- footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
