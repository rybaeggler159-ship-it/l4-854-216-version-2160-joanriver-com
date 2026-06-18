(function () {
  document.querySelectorAll('.video-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    if (!video || !button) {
      return;
    }

    var sourceElement = video.querySelector('source');
    var source = sourceElement ? sourceElement.src : video.currentSrc;
    var ready = false;

    function attachSource() {
      if (ready || !source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        shell.hlsPlayer = hls;
      } else {
        video.src = source;
      }
      ready = true;
    }

    function start() {
      attachSource();
      shell.classList.add('is-playing');
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  });
})();
