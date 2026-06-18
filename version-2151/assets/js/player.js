(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector('[data-hls-src]');
    var message = document.querySelector('[data-player-message]');
    var overlay = document.querySelector('[data-play-overlay]');
    var button = document.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-hls-src');

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function attachSource() {
      if (!source) {
        setMessage('当前影片源暂不可用。');
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源加载失败，请刷新页面重试。');
          }
        });
        return;
      }

      setMessage('当前浏览器无法直接播放此影片，请更换浏览器重试。');
    }

    attachSource();

    if (button) {
      button.addEventListener('click', function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            if (overlay) {
              overlay.classList.add('is-hidden');
            }
          }).catch(function () {
            setMessage('点击视频控制栏可继续播放。');
          });
        }
      });
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  });
})();
