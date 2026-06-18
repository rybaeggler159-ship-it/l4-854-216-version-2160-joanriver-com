(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector(".menu-toggle");
        if (!button) {
            return;
        }

        button.addEventListener("click", function () {
            var isOpen = document.body.classList.toggle("is-menu-open");
            button.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var previous = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");

        if (!slides.length) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        start();
    }

    function getSearchTermFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get("search") || params.get("keyword") || "";
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll(".global-search-form");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='search']");
                var value = input ? input.value.trim() : "";

                if (!value) {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".inline-search"));
        var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
        var emptyState = document.querySelector("[data-empty-state]");
        var urlTerm = getSearchTermFromUrl();

        if (!cards.length) {
            return;
        }

        if (urlTerm && searchInputs.length) {
            searchInputs[0].value = urlTerm;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(searchInputs.map(function (input) {
                return input.value;
            }).join(" "));

            var activeFilters = {};
            selects.forEach(function (select) {
                if (select.value) {
                    activeFilters[select.getAttribute("data-filter")] = select.value;
                }
            });

            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var filterMatch = Object.keys(activeFilters).every(function (key) {
                    return card.getAttribute("data-" + key) === activeFilters[key];
                });
                var visible = keywordMatch && filterMatch;

                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", applyFilters);
        });

        selects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });

        applyFilters();
    }

    function setupPlayer() {
        var buttons = document.querySelectorAll("[data-video-target]");

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var id = button.getAttribute("data-video-target");
                var video = document.getElementById(id);
                var source = button.getAttribute("data-video-src") || (video && video.getAttribute("data-src"));
                var message = document.querySelector("[data-player-message]");

                if (!video || !source) {
                    if (message) {
                        message.textContent = "当前播放器未找到可用播放源。";
                    }
                    return;
                }

                button.classList.add("is-hidden");

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            if (message) {
                                message.textContent = "点击视频播放键即可继续播放。";
                            }
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                            if (message) {
                                message.textContent = "播放源暂时无法加载，请稍后重试。";
                            }
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.play().catch(function () {
                        if (message) {
                            message.textContent = "点击视频播放键即可继续播放。";
                        }
                    });
                } else {
                    video.src = source;
                    video.play().catch(function () {
                        if (message) {
                            message.textContent = "当前浏览器无法直接播放 HLS 视频流。";
                        }
                    });
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupSearchForms();
        setupFilters();
        setupPlayer();
    });
}());
