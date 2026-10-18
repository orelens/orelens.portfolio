(function () {
  "use strict";

  document.documentElement.classList.add("js");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".featured video").forEach(function (video) {
      video.removeAttribute("autoplay");
      video.pause();
    });
  }

  var CATEGORIES = {
    all: "All",
    social: "Social",
    ads: "Ads",
    posters: "Posters",
    thumbnails: "Thumbnails",
    branding: "Branding",
    reels: "Reels",
    "real-estate": "Real estate",
    "restaurant-cafe": "Restaurant/Cafe",
    hotel: "Hotel",
    salon: "Salon"
  };

  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setNav(open) {
    if (!navToggle || !nav) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
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

  var soon = document.getElementById("case-studies-soon");
  var studiesMount = document.getElementById("case-studies");
  var conceptsMount = document.getElementById("concept-work");
  var filters = document.getElementById("work-filters");
  var status = document.getElementById("work-status");
  var dialog = document.getElementById("work-dialog");
  var dialogBody = document.getElementById("work-dialog-body");
  var dataUrl = "data/projects.json";
  var activeFilter = "all";
  var catalog = { caseStudies: [], concepts: [] };

  function text(tag, className, value) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = value;
    return el;
  }

  function safeSrc(src) {
    if (typeof src !== "string") return "";
    var value = src.trim();
    var lower = value.toLowerCase();
    if (!value || lower.indexOf("javascript:") === 0 || lower.indexOf("data:") === 0) return "";
    return value;
  }

  function categoryLabel(id) {
    return CATEGORIES[id] || id;
  }

  function announce(message) {
    if (status) status.textContent = message;
  }

  function mediaElement(item) {
    var media = item.media || {};
    var src = safeSrc(media.src);
    if (!src) return null;
    if (media.type === "video") {
      var video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      if (media.poster) video.poster = safeSrc(media.poster);
      var source = document.createElement("source");
      source.src = src;
      source.type = media.mime || "video/mp4";
      video.appendChild(source);
      video.appendChild(text("p", null, item.title));
      return video;
    }
    var img = document.createElement("img");
    img.src = src;
    img.alt = media.alt || item.title;
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 1080;
    img.height = 1350;
    return img;
  }

  function openDialog(item) {
    if (!dialog || !dialogBody) return;
    dialogBody.replaceChildren();
    var media = mediaElement(item);
    if (media) {
      if (media.tagName === "IMG") media.loading = "eager";
      dialogBody.appendChild(media);
    }
    dialogBody.appendChild(text("h2", null, item.title));
    dialogBody.appendChild(text("p", "work-card-kicker", categoryLabel(item.category)));
    if (item.kind === "concept") {
      dialogBody.appendChild(text("p", "concept-pill concept-pill-static", item.label || "CONCEPT WORK – FICTIONAL BRAND"));
      if (item.fictionalBrand) {
        dialogBody.appendChild(text("p", null, "Fictional brand: " + item.fictionalBrand + ". Not a client project."));
      }
    } else if (item.client) {
      dialogBody.appendChild(text("p", null, item.client));
    }
    if (item.summary) dialogBody.appendChild(text("p", null, item.summary));
    if (item.credit) dialogBody.appendChild(text("p", "credit", item.credit));
    var close = dialog.querySelector(".dialog-close");
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      if (close) close.focus();
    }
  }

  function card(item) {
    var article = document.createElement("article");
    article.className = "work-card";
    article.dataset.category = item.category;

    var frame = document.createElement("div");
    frame.className = "work-media";
    var media = mediaElement(item);
    if (media && media.tagName === "IMG") {
      var view = document.createElement("button");
      view.type = "button";
      view.className = "work-view";
      view.appendChild(media);
      var name = item.kind === "concept" ? "View concept: " + item.title : "View project: " + item.title;
      view.setAttribute("aria-label", name);
      view.addEventListener("click", function () { openDialog(item); });
      frame.appendChild(view);
    } else if (media) {
      frame.appendChild(media);
    }

    if (item.kind === "concept") {
      frame.appendChild(text("p", "concept-pill", item.label || "CONCEPT WORK – NOT A CLIENT PROJECT"));
    }
    article.appendChild(frame);

    var body = document.createElement("div");
    body.className = "work-card-body";
    body.appendChild(text("p", "work-card-kicker", categoryLabel(item.category)));
    body.appendChild(text("h3", null, item.title));
    if (item.kind === "concept" && item.fictionalBrand) {
      body.appendChild(text("p", null, item.fictionalBrand + " · fictional brand, not a client project."));
    } else if (item.client) {
      body.appendChild(text("p", null, item.client));
    }
    if (item.summary) body.appendChild(text("p", null, item.summary));
    if (item.credit) body.appendChild(text("p", "credit", item.credit));
    article.appendChild(body);
    return article;
  }

  function matches(item) {
    return activeFilter === "all" || item.category === activeFilter;
  }

  function renderGroup(mount, items, headingText) {
    if (!mount) return 0;
    mount.replaceChildren();
    var visible = items.filter(matches);
    if (!visible.length) {
      mount.hidden = true;
      return 0;
    }
    mount.hidden = false;
    mount.appendChild(text("h3", "work-group-title", headingText));
    var grid = document.createElement("div");
    grid.className = "work-grid";
    visible.forEach(function (item) { grid.appendChild(card(item)); });
    mount.appendChild(grid);
    return visible.length;
  }

  function render() {
    var studyCount = renderGroup(studiesMount, catalog.caseStudies, "Case studies");
    var conceptCount = renderGroup(conceptsMount, catalog.concepts, "Concept work");
    if (soon) soon.hidden = catalog.caseStudies.length > 0;
    var empty = document.getElementById("work-empty");
    if (empty) empty.hidden = studyCount + conceptCount > 0;
    var bits = [];
    if (studyCount) bits.push(studyCount + (studyCount === 1 ? " case study" : " case studies"));
    if (conceptCount) bits.push(conceptCount + (conceptCount === 1 ? " concept piece" : " concept pieces"));
    announce(bits.length ? "Showing " + bits.join(" and ") + "." : "Nothing in this category yet.");
  }

  function valid(item) {
    return item && item.title && item.category && item.media && safeSrc(item.media.src);
  }

  function setFilter(id) {
    activeFilter = CATEGORIES[id] ? id : "all";
    if (!filters) return;
    filters.querySelectorAll("button").forEach(function (button) {
      var on = button.dataset.filter === activeFilter;
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    render();
  }

  if (filters) {
    filters.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-filter]");
      if (!button) return;
      setFilter(button.dataset.filter);
    });
  }

  if (dialog) {
    var closer = dialog.querySelector(".dialog-close");
    if (closer) closer.addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  fetch(dataUrl)
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load " + dataUrl);
      return response.json();
    })
    .then(function (data) {
      catalog.caseStudies = (data.caseStudies || []).filter(valid);
      catalog.concepts = (data.concepts || []).filter(valid);
      render();
    })
    .catch(function () {
      var note = document.getElementById("work-error");
      if (note) note.hidden = false;
      announce("The work list could not be loaded.");
    });
})();
