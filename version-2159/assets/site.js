(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initHeader() {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-menu-toggle]");
    if (!header) {
      return;
    }

    const setScrolled = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    };

    setScrolled();
    window.addEventListener("scroll", setScrolled, { passive: true });

    if (toggle) {
      toggle.addEventListener("click", function () {
        header.classList.toggle("menu-open");
      });
    }
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const rails = Array.from(hero.querySelectorAll("[data-hero-rail]"));
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
      rails.forEach(function (rail, itemIndex) {
        rail.classList.toggle("active", itemIndex === current);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    rails.forEach(function (rail, index) {
      rail.addEventListener("mouseenter", function () {
        show(index);
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    const roots = Array.from(document.querySelectorAll("[data-filter-root]"));
    if (!roots.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const queryValue = (params.get("q") || "").trim();

    roots.forEach(function (root) {
      const input = root.querySelector("[data-filter-input]");
      const typeSelect = root.querySelector("[data-type-filter]");
      const regionSelect = root.querySelector("[data-region-filter]");
      const yearSelect = root.querySelector("[data-year-filter]");
      const container = root.parentElement.querySelector("[data-card-container]") || document.querySelector("[data-card-container]");
      const empty = root.querySelector("[data-empty-state]");

      if (input && queryValue) {
        input.value = queryValue;
      }

      const cards = container ? Array.from(container.querySelectorAll("[data-movie-card]")) : [];

      const apply = function () {
        const q = input ? input.value.trim().toLowerCase() : "";
        const type = typeSelect ? typeSelect.value : "";
        const region = regionSelect ? regionSelect.value : "";
        const year = yearSelect ? yearSelect.value : "";
        let visible = 0;

        cards.forEach(function (card) {
          const matchesQuery = !q || (card.dataset.search || "").includes(q);
          const matchesType = !type || card.dataset.type === type;
          const matchesRegion = !region || card.dataset.region === region;
          const matchesYear = !year || card.dataset.year === year;
          const shouldShow = matchesQuery && matchesType && matchesRegion && matchesYear;
          card.classList.toggle("is-hidden", !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      };

      [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function initPlayer() {
    const shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }

    const video = shell.querySelector("video");
    const overlay = shell.querySelector(".player-overlay");
    if (!video || !overlay) {
      return;
    }

    const source = video.getAttribute("data-src");
    let attached = false;
    let hlsInstance = null;

    const attach = function () {
      if (attached || !source) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = source;
    };

    const play = function () {
      overlay.classList.add("is-hidden");
      attach();
      video.play().catch(function () {
        if (!hlsInstance) {
          overlay.classList.remove("is-hidden");
        }
      });
    };

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initFilters();
    initPlayer();
  });
})();
