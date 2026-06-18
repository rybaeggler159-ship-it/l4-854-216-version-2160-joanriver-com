(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = $('[data-mobile-toggle]');
    var menu = $('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    $all('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();

        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('data-search-url') || 'search.html';
        var url = query ? target + '?q=' + encodeURIComponent(query) : target;

        window.location.href = url;
      });
    });
  }

  function initHero() {
    var hero = $('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var thumbs = $all('.hero-thumb', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initImageFallbacks() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame, .category-bg, .hero-bg, .detail-backdrop, .ranking-cover, .category-cover-stack, .player-cover, .hero-thumb');

        if (frame) {
          frame.classList.add('poster-missing');
        }

        image.remove();
      }, { once: true });
    });
  }

  function uniqueSorted(values) {
    return values
      .filter(Boolean)
      .filter(function (value, index, array) {
        return array.indexOf(value) === index;
      })
      .sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-CN');
      });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initPageFilter() {
    var panel = $('[data-page-filter]');
    var list = $('[data-filter-list]');

    if (!panel || !list) {
      return;
    }

    var cards = $all('[data-title]', list);
    var keywordInput = $('[data-filter-keyword]', panel);
    var yearSelect = $('[data-filter-year]', panel);
    var genreSelect = $('[data-filter-genre]', panel);
    var resetButton = $('[data-filter-reset]', panel);
    var count = $('[data-filter-count]', panel);
    var empty = $('[data-empty-state]');

    fillSelect(yearSelect, uniqueSorted(cards.map(function (card) {
      return card.getAttribute('data-year');
    })));

    fillSelect(genreSelect, uniqueSorted(cards.reduce(function (items, card) {
      var genres = String(card.getAttribute('data-genre') || '').split(/[，,、/|]+/);
      return items.concat(genres.map(function (item) {
        return item.trim();
      }));
    }, [])));

    function apply() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardGenre = normalize(card.getAttribute('data-genre'));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (genre && cardGenre.indexOf(genre) === -1) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部内容';
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keywordInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }

        if (yearSelect) {
          yearSelect.value = '';
        }

        if (genreSelect) {
          genreSelect.value = '';
        }

        apply();
      });
    }

    apply();
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || '').split(/[，,、/|]+/).filter(Boolean).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag.trim()) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="detail/' + movie.id + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <div class="poster-frame">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '      <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '      <span class="poster-play">▶</span>',
      '    </div>',
      '  </a>',
      '  <div class="movie-info">',
      '    <h3><a href="detail/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '    <p class="movie-desc">' + escapeHtml(movie.one_line) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = $('[data-search-results]');
    var form = $('[data-search-page-form]');
    var status = $('[data-search-status]');

    if (!results || !form || !window.MOVIES) {
      return;
    }

    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function search(query) {
      var normalized = normalize(query);
      var matched = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.category,
          movie.one_line
        ].join(' '));

        return !normalized || haystack.indexOf(normalized) !== -1;
      });

      results.innerHTML = matched.slice(0, 300).map(cardTemplate).join('');
      initImageFallbacks();

      if (status) {
        if (normalized) {
          status.textContent = '关键词“' + query + '”共匹配 ' + matched.length + ' 部内容，当前展示前 ' + Math.min(300, matched.length) + ' 部。';
        } else {
          status.textContent = '请输入关键词搜索；未输入时展示前 300 部内容。';
        }
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value.trim() : '';
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', url);
      search(query);
    });

    search(initialQuery);
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('[data-play]');
      var source = shell.getAttribute('data-src');
      var hlsInstance = null;

      if (!video || !cover || !source) {
        return;
      }

      function play() {
        cover.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }

        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            video.controls = true;
          });
        }
      }

      cover.addEventListener('click', play, { once: true });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initImageFallbacks();
    initPageFilter();
    initSearchPage();
    initPlayers();
  });
})();
