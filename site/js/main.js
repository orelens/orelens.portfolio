(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var header = document.querySelector(".site-header");

  function setNav(open) {
    if (!navToggle || !nav) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setNav(false);
    });
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var reveals = document.querySelectorAll(".reveal");

  function showAll() {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (reduce || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { observer.observe(el); });
  }

  var sectionLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];
  var sections = [];
  sectionLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section) sections.push({ link: link, section: section });
  });

  if (sections.length && "IntersectionObserver" in window) {
    var current = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.filter(function (item) { return item.section === entry.target; })[0];
        if (!match) return;
        if (entry.isIntersecting) {
          sections.forEach(function (item) { item.link.removeAttribute("aria-current"); });
          match.link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-40% 0px -45% 0px", threshold: 0 });
    sections.forEach(function (item) { current.observe(item.section); });
  }

  var video = document.getElementById("intro-video");
  var soundBtn = document.getElementById("sound-btn");
  if (!video || !soundBtn) return;

  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  var saveData = navigator.connection && navigator.connection.saveData;
  var autoTried = false;

  function syncSound() {
    var show = video.muted && !video.paused && !video.ended;
    soundBtn.hidden = !show;
  }

  function tryAutoplay() {
    if (autoTried || reduce || saveData) return;
    autoTried = true;
    video.muted = true;
    var pending = video.play();
    if (pending && pending.then) {
      pending.then(syncSound).catch(function () {
        video.muted = false;
        syncSound();
      });
    } else {
      syncSound();
    }
  }

  soundBtn.addEventListener("click", function () {
    video.muted = false;
    video.volume = 1;
    var pending = video.play();
    if (pending && pending.catch) pending.catch(function () {});
    syncSound();
  });

  video.addEventListener("volumechange", syncSound);
  video.addEventListener("play", syncSound);
  video.addEventListener("pause", syncSound);
  video.addEventListener("ended", syncSound);

  if (!reduce && !saveData && "IntersectionObserver" in window) {
    var playObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) tryAutoplay();
      });
    }, { threshold: 0.45 });
    playObserver.observe(video);
  }
})();
