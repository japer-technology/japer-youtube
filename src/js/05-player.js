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
  }

  function open(video) {
    titleEl.textContent   = video.title;
    channelEl.textContent = video.channel || '';
    iframe.src = 'https://www.youtube-nocookie.com/embed/' +
      encodeURIComponent(video.videoId) + '?autoplay=1&rel=0';
    overlay.classList.add('open');
  }

  function close() {
    overlay.classList.remove('open');
    iframe.src = '';
  }

  return { init: init, open: open, close: close };
})();
