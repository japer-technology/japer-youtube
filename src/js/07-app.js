/* ── App Bootstrap ─────────────────────────────────────────────────────────── */

JaperYT.App = (function () {
  var started = false;

  function start() {
    if (started) return;
    started = true;

    JaperYT.Player.init();
    JaperYT.UI.setPaired(false);

    // Disconnect button
    document.getElementById('btn-disconnect')
      .addEventListener('click', function () {
        JaperYT.KeyExchange.disconnect();
        JaperYT.UI.setPaired(false);
        beginPairing();
      });

    // Back to trending feed
    document.getElementById('back-to-feed')
      .addEventListener('click', function () { JaperYT.UI.backToFeed(); });

    // Search input
    var searchInput = document.getElementById('search-input');
    var searchBtn   = document.getElementById('search-btn');

    function doSearch() {
      var query = searchInput.value.trim();
      if (!query) return;
      JaperYT.UI.setFeedTitle('Search: ' + query);
      JaperYT.UI.showSpinner();
      JaperYT.Subscriptions.searchVideos(query)
        .then(function (videos) {
          JaperYT.UI.renderVideoGrid(videos);
        })
        .catch(function (err) {
          console.error('[search]', err);
          JaperYT.UI.toast('Search failed');
          JaperYT.UI.showEmpty('Search failed.');
        });
    }

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch();
    });

    // Add channel from sidebar
    var addChannelInput = document.getElementById('add-channel-input');
    var addChannelBtn   = document.getElementById('add-channel-btn');

    function doAddChannel() {
      var query = addChannelInput.value.trim();
      if (!query) return;
      addChannelBtn.disabled = true;
      JaperYT.Subscriptions.addChannel(query)
        .then(function (channel) {
          if (channel) {
            JaperYT.UI.renderSubscriptions(
              Array.from(document.querySelectorAll('.subscription-item')).length === 0
                ? [channel]
                : getExistingChannels().concat(channel)
            );
            addChannelInput.value = '';
            JaperYT.UI.toast('Added ' + channel.title);
          } else {
            JaperYT.UI.toast('Channel not found');
          }
        })
        .catch(function () { JaperYT.UI.toast('Could not add channel'); })
        .finally(function () { addChannelBtn.disabled = false; });
    }

    addChannelBtn.addEventListener('click', doAddChannel);
    addChannelInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doAddChannel();
    });

    beginPairing();
  }

  function getExistingChannels() {
    var items = document.querySelectorAll('.subscription-item');
    var channels = [];
    items.forEach(function (el) {
      channels.push({
        channelId: el.dataset.channelId,
        title: el.querySelector('.subscription-item__name').textContent,
        thumb: el.querySelector('.subscription-item__thumb').src
      });
    });
    return channels;
  }

  function beginPairing() {
    var canvas = document.getElementById('pairing-barcode');
    JaperYT.KeyExchange.start(canvas, onKeysReady);
  }

  function onKeysReady() {
    JaperYT.UI.setPaired(true);
    loadTrending();
  }

  function loadTrending() {
    JaperYT.UI.setFeedTitle('Trending');
    JaperYT.UI.showSpinner();

    JaperYT.Subscriptions.getTrending()
      .then(function (videos) {
        JaperYT.UI.renderVideoGrid(videos);
      })
      .catch(function (err) {
        console.error('[trending]', err);
        JaperYT.UI.toast('Could not load trending videos');
        JaperYT.UI.showEmpty('Could not load trending videos.');
      });
  }

  return { start: start };
})();

/* ── Start app once DOM is ready ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  JaperYT.App.start();
});
