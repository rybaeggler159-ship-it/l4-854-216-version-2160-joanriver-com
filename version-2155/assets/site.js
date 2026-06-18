(function() {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      const open = mobileMenu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let index = 0;
    let timer = null;

    const show = function(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const start = function() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5000);
    };

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  const filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    const input = filterRoot.querySelector('[data-filter-text]');
    const selects = Array.from(filterRoot.querySelectorAll('[data-filter-select]'));
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const empty = document.querySelector('[data-empty-state]');

    const apply = function() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const values = selects.map(function(select) {
        return {
          key: select.getAttribute('data-filter-select'),
          value: select.value
        };
      });
      let visibleCount = 0;

      cards.forEach(function(card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        const selectMatched = values.every(function(item) {
          return !item.value || card.getAttribute('data-' + item.key) === item.value;
        });
        const matched = keywordMatched && selectMatched;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.style.display = visibleCount ? 'none' : 'block';
      }
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    selects.forEach(function(select) {
      select.addEventListener('change', apply);
    });

    apply();
  }

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.SEARCH_ITEMS) {
    const input = searchPage.querySelector('[data-site-search]');
    const results = searchPage.querySelector('[data-search-results]');

    const render = function() {
      const keyword = input.value.trim().toLowerCase();
      const source = window.SEARCH_ITEMS.filter(function(item) {
        if (!keyword) {
          return item.hot;
        }
        return item.text.toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 96);

      results.innerHTML = source.map(function(item) {
        return [
          '<a class="movie-card glass" href="' + item.url + '">',
          '<div class="poster">',
          '<img src="' + item.cover + '" alt="' + item.alt + '">',
          '<span class="year-badge">' + item.year + '</span>',
          '<span class="type-badge">' + item.type + '</span>',
          '</div>',
          '<div class="movie-body">',
          '<h3>' + item.title + '</h3>',
          '<p>' + item.oneLine + '</p>',
          '<div class="meta"><span>' + item.region + '</span><span>' + item.category + '</span></div>',
          '</div>',
          '</a>'
        ].join('');
      }).join('');
    };

    input.addEventListener('input', render);
    render();
  }
})();
