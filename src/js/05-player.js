/* ── Player ────────────────────────────────────────────────────────────────── */

JaperYT.Player = (function () {
  var overlay;
  var iframe;
  var titleEl;
  var channelEl;

  function init() {
    overlay   = document.getElementById('player-overlay');
    iframe    = document.getElementById('player-iframe');
    titleEl   = document.getElementById('player-title');
    channelEl = document.getElementById('player-channel');

    document.getElementById('player-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        close();
      }
    });
  }

  function open(video) {
    titleEl.textContent   = video.title;
    channelEl.textContent = video.channel || '';
    iframe.src = 'https://www.youtube-nocookie.com/embed/' +
      encodeURIComponent(video.videoId) + '?autoplay=1&rel=0';
    overlay.classList.add('open');
    document.body.classList.add('player-open');
  }

  function close() {
    overlay.classList.remove('open');
    document.body.classList.remove('player-open');
    iframe.src = '';
  }

  return { init: init, open: open, close: close };
})();
