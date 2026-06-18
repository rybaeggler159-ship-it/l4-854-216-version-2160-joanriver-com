(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function normalize(text) {
    return String(text || '').toLowerCase();
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>\"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function movieCard(movie) {
    var title = escapeHtml(movie.title);
    var url = encodeURI(movie.url || '#');
    var cover = encodeURI(movie.cover || '');
    var year = escapeHtml(movie.year);
    var genre = escapeHtml(movie.genre);

    return [
      '<a class="movie-card" href="' + url + '">',
      '  <div class="poster-wrap">',
      '    <img src="' + cover + '" alt="' + title + '" loading="lazy">',
      '    <div class="poster-fallback">' + title + '</div>',
      '    <div class="poster-shade"><span class="play-chip">▶ 查看详情</span></div>',
      '  </div>',
      '  <div class="card-body">',
      '    <h2 class="card-title">' + title + '</h2>',
      '    <div class="card-meta"><span>' + year + '</span><span>' + genre + '</span></div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function render() {
    var input = document.querySelector('[data-search-input]');
    var summary = document.querySelector('[data-search-summary]');
    var results = document.querySelector('[data-search-results]');
    var query = getQuery();

    if (input) {
      input.value = query;
    }

    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var words = normalize(query).split(/\s+/).filter(Boolean);
    var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      if (!words.length) {
        return true;
      }
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' '));
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    if (summary) {
      if (query) {
        summary.textContent = '“' + query + '” 共匹配 ' + matched.length + ' 部影片，以下展示前 120 部。';
      } else {
        summary.textContent = '输入片名、地区、类型、年份或标签，即可筛选影片。当前展示精选影片。';
      }
    }

    results.innerHTML = matched.map(movieCard).join('');

    results.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
        image.setAttribute('aria-hidden', 'true');
      }, { once: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
