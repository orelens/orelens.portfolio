(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var header = document.querySelector(".site-header");
  var heroMark = document.querySelector(".hero-mark");
  var steps = document.querySelector(".steps");
  var scrollToY = null;

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

  function splitWords(el) {
    if (!el || el.dataset.split === "1") return;
    var count = { n: 0 };
    function walk(node) {
      var children = Array.prototype.slice.call(node.childNodes);
      children.forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          var wrote = false;
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
              wrote = true;
              return;
            }
            var mask = document.createElement("span");
            mask.className = "word-mask";
            var word = document.createElement("span");
            word.className = "word";
            word.style.setProperty("--i", String(count.n));
            count.n += 1;
            word.textContent = part;
            mask.appendChild(word);
            frag.appendChild(mask);
            wrote = true;
          });
          if (wrote) child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.classList.contains("word") && !child.classList.contains("word-mask")) {
          walk(child);
        }
      });
    }
    walk(el);
    el.dataset.split = "1";
  }

  document.querySelectorAll(".words").forEach(splitWords);
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      document.querySelectorAll(".hero .words").forEach(function (el) {
        el.classList.add("is-in");
      });
    });
  });

  function headerOffset() {
    return header ? header.offsetHeight + 8 : 0;
  }

  function anchorY(hash) {
    if (!hash || hash === "#") return null;
    if (hash === "#top") return 0;
    var el = document.querySelector(hash);
    if (!el) return null;
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerOffset());
  }

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  if (!reduce && finePointer) {
    document.documentElement.classList.add("smooth-scroll");
    var current = window.scrollY;
    var target = current;
    var running = false;
    var programmatic = false;
    var lastTime = 0;

    function clamp(value) {
      return Math.max(0, Math.min(maxScroll(), value));
    }

    function frame(now) {
      var dt = lastTime ? Math.min(34, now - lastTime) : 16.7;
      lastTime = now;
      var ease = 1 - Math.pow(0.86, dt / 16.67);
      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.45) {
        current = target;
        running = false;
      }
      programmatic = true;
      window.scrollTo(0, current);
      programmatic = false;
      if (running) window.requestAnimationFrame(frame);
    }

    function kick() {
      target = clamp(target);
      if (!running) {
        running = true;
        lastTime = 0;
        window.requestAnimationFrame(frame);
      }
    }

    window.addEventListener("wheel", function (event) {
      if (event.ctrlKey || document.body.classList.contains("nav-open")) return;
      event.preventDefault();
      var dy = event.deltaY;
      if (event.deltaMode === 1) dy *= 16;
      if (event.deltaMode === 2) dy *= window.innerHeight;
      target = clamp(target + dy);
      kick();
    }, { passive: false });

    window.addEventListener("scroll", function () {
      if (programmatic) return;
      current = window.scrollY;
      target = current;
    }, { passive: true });

    window.addEventListener("keydown", function (event) {
      var tag = event.target && event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "VIDEO" || tag === "BUTTON") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var delta = 0;
      if (event.key === "ArrowDown") delta = 72;
      else if (event.key === "ArrowUp") delta = -72;
      else if (event.key === "PageDown") delta = window.innerHeight * 0.86;
      else if (event.key === "PageUp") delta = -window.innerHeight * 0.86;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = maxScroll();
      else if (event.key === " ") delta = event.shiftKey ? -window.innerHeight * 0.86 : window.innerHeight * 0.86;
      else return;
      event.preventDefault();
      if (delta) target = clamp(target + delta);
      kick();
    });

    scrollToY = function (y) {
      target = clamp(y);
      kick();
    };
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[href^='#']");
    if (!link) return;
    var y = anchorY(link.getAttribute("href"));
    if (y === null) return;
    event.preventDefault();
    if (scrollToY && !reduce) {
      scrollToY(y);
      if (history.replaceState) history.replaceState(null, "", link.getAttribute("href"));
      return;
    }
    var hash = link.getAttribute("href");
    if (hash === "#top") {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    } else {
      var el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  });

  function updateProcess() {
    if (!steps) return;
    var items = steps.querySelectorAll("li");
    if (!items.length) return;
    if (reduce) {
      items.forEach(function (li) {
        li.style.setProperty("--t", "1");
        li.style.setProperty("--seg", "1");
        li.classList.add("is-lit");
      });
      return;
    }
    var rect = steps.getBoundingClientRect();
    var view = window.innerHeight || 800;
    var headerH = header ? header.offsetHeight : 0;
    var section = document.getElementById("process");
    var sectionTop = section ? section.getBoundingClientRect().top : rect.top;
    var intro = Math.max(0, rect.top - sectionTop);
    // Finish as the Process anchor lands the heading under the header,
    // so the five steps are lit once that section is in reading position.
    var endTop = headerH + 8 + intro;
    var startTop = Math.max(endTop + 180, Math.min(view * 0.92, endTop + view * 0.62));
    var progress = (startTop - rect.top) / Math.max(1, startTop - endTop);
    progress = Math.max(0, Math.min(1, progress));
    items.forEach(function (li, index) {
      var from = index / items.length;
      var to = (index + 0.72) / items.length;
      var t = (progress - from) / Math.max(0.001, to - from);
      t = Math.max(0, Math.min(1, t));
      li.style.setProperty("--t", t.toFixed(3));
      li.classList.toggle("is-lit", t > 0.45);
      var segFrom = (index + 0.35) / items.length;
      var segTo = (index + 1.05) / items.length;
      var seg = (progress - segFrom) / Math.max(0.001, segTo - segFrom);
      li.style.setProperty("--seg", Math.max(0, Math.min(1, seg)).toFixed(3));
    });
  }

  if (steps && !reduce) steps.classList.add("motion");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (heroMark && !reduce) {
      var shift = Math.max(-24, Math.min(56, y * 0.1));
      heroMark.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
    }
    updateProcess();
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  var reveals = document.querySelectorAll(".reveal");

  function show(el) {
    el.classList.add("is-in");
  }

  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(show);
    document.querySelectorAll(".words").forEach(show);
    updateProcess();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { observer.observe(el); });
  }

  var sectionLinks = nav ? nav.querySelectorAll("a[href^='#']") : [];
  var sections = [];
  Array.prototype.forEach.call(sectionLinks, function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section) sections.push({ link: link, section: section });
  });

  if (sections.length && "IntersectionObserver" in window) {
    var current = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.filter(function (item) { return item.section === entry.target; })[0];
        if (!match || !entry.isIntersecting) return;
        sections.forEach(function (item) { item.link.removeAttribute("aria-current"); });
        match.link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-40% 0px -45% 0px", threshold: 0 });
    sections.forEach(function (item) { current.observe(item.section); });
  }

  var saveData = navigator.connection && navigator.connection.saveData;

  function attachSound(video, soundBtn, autoplay) {
    if (!video || !soundBtn) return;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    var autoTried = false;

    function syncSound() {
      soundBtn.hidden = !(video.muted && !video.paused && !video.ended);
    }

    function tryAutoplay() {
      if (!autoplay || autoTried || reduce || saveData) return;
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

    if (autoplay && !reduce && !saveData && "IntersectionObserver" in window) {
      var playObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) tryAutoplay();
        });
      }, { threshold: 0.45 });
      playObserver.observe(video);
    }
  }

  attachSound(document.getElementById("intro-video"), document.getElementById("sound-btn"), true);
  attachSound(document.getElementById("work-video"), document.getElementById("work-sound-btn"), false);

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  if (lightbox && lightboxImg) {
    document.querySelectorAll(".work-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var img = card.querySelector("img");
        if (!img) return;
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        if (lightbox.showModal) lightbox.showModal();
      });
    });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightboxClose) return;
      var rect = lightboxImg.getBoundingClientRect();
      var inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) lightbox.close();
    });
    if (lightboxClose) {
      lightboxClose.addEventListener("click", function () {
        lightbox.close();
      });
    }
    lightbox.addEventListener("close", function () {
      lightboxImg.removeAttribute("src");
    });
  }
})();
