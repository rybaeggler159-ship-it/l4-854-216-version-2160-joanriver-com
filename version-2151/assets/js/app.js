(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('[data-mobile-toggle]');

    if (header && toggle) {
      toggle.addEventListener('click', function () {
        header.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', header.classList.contains('is-open') ? 'true' : 'false');
      });
    }

    document.querySelectorAll('form[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var keyword = input ? input.value.trim() : '';
        if (keyword) {
          window.location.href = 'search.html?q=' + encodeURIComponent(keyword);
        } else {
          window.location.href = 'search.html';
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
        dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
      });
    }

    function startHeroTimer() {
      if (timer || slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stopHeroTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        stopHeroTimer();
        startHeroTimer();
      });
    });

    showSlide(0);
    startHeroTimer();

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
        image.setAttribute('aria-hidden', 'true');
      }, { once: true });
    });
  });
})();
