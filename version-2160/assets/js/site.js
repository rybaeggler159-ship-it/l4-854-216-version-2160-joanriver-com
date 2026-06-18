(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initHeader() {
    var header = $("[data-header]");
    var toggle = $("[data-menu-toggle]");
    var menu = $("[data-mobile-menu]");

    function setHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("scrolled", window.scrollY > 20);
    }

    setHeader();
    window.addEventListener("scroll", setHeader, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  function initHero() {
    var root = $("[data-hero-carousel]");
    if (!root) {
      return;
    }

    var slides = $all(".hero-slide", root);
    var dots = $all("[data-hero-dot]", root);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      if (slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });

    start();
  }

  function initGlobalSearch() {
    var fields = $all("[data-global-search]");
    if (!fields.length || !window.MovieSearchIndex) {
      return;
    }

    fields.forEach(function (field) {
      var wrap = field.closest("[data-search-wrap]") || field.parentElement;
      var box = $("[data-search-results]", wrap);
      if (!box) {
        return;
      }

      function render() {
        var query = field.value.trim().toLowerCase();
        if (query.length < 1) {
          box.classList.remove("open");
          box.innerHTML = "";
          return;
        }

        var matches = window.MovieSearchIndex.filter(function (item) {
          return [item.title, item.year, item.region, item.type, item.genre, item.tags]
            .join(" ")
            .toLowerCase()
            .indexOf(query) !== -1;
        }).slice(0, 14);

        if (!matches.length) {
          box.classList.remove("open");
          box.innerHTML = "";
          return;
        }

        box.innerHTML = matches.map(function (item) {
          return '<a href="' + escapeHtml(item.url) + '">' +
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + ' 海报">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong>' +
            '<span>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span></span>' +
            '</a>';
        }).join("");
        box.classList.add("open");
      }

      field.addEventListener("input", render);
      document.addEventListener("click", function (event) {
        if (!wrap.contains(event.target)) {
          box.classList.remove("open");
        }
      });
    });
  }

  function initFilters() {
    var panels = $all("[data-filter-panel]");
    panels.forEach(function (panel) {
      var search = $("[data-filter-search]", panel);
      var year = $("[data-filter-year]", panel);
      var region = $("[data-filter-region]", panel);
      var type = $("[data-filter-type]", panel);
      var grid = $("[data-movie-grid]");
      var cards = grid ? $all(".movie-card", grid) : [];

      function apply() {
        var query = (search && search.value || "").trim().toLowerCase();
        var yearValue = year && year.value || "";
        var regionValue = region && region.value || "";
        var typeValue = type && type.value || "";

        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.region, card.dataset.type, card.dataset.year]
            .join(" ")
            .toLowerCase();
          var visible = true;

          if (query && text.indexOf(query) === -1) {
            visible = false;
          }
          if (yearValue && card.dataset.year !== yearValue) {
            visible = false;
          }
          if (regionValue && card.dataset.region !== regionValue) {
            visible = false;
          }
          if (typeValue && card.dataset.type !== typeValue) {
            visible = false;
          }

          card.classList.toggle("is-hidden", !visible);
        });
      }

      [search, year, region, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
    });
  }

  function bindPlayer(video, overlay, source) {
    var ready = false;
    var hlsInstance = null;

    function load() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.SitePlayer = {
    initPlayer: function (videoId, overlayId, source) {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      if (video && source) {
        bindPlayer(video, overlay, source);
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initHero();
    initGlobalSearch();
    initFilters();
  });
})();
