/* ── App Bootstrap ─────────────────────────────────────────────────────────── */

JaperYT.App = (function () {
  var started = false;

  function start() {
    if (started) return;
    started = true;

    JaperYT.Player.init();
    showWelcome();

    // Disconnect button — return to welcome screen
    document.getElementById('btn-disconnect')
      .addEventListener('click', function () {
        JaperYT.KeyExchange.disconnect();
        showWelcome();
      });

    // Save session button
    document.getElementById('btn-save-session')
      .addEventListener('click', function () {
        JaperYT.Session.save();
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

    // ── Welcome screen handlers ──

    // "New Session" button → show API key form
    document.getElementById('btn-new-session')
      .addEventListener('click', function () {
        hideAllOverlays();
        document.getElementById('new-session-overlay').style.display = 'flex';
      });

    // "Open Saved Session" button → trigger file picker
    document.getElementById('btn-open-session')
      .addEventListener('click', function () {
        document.getElementById('session-file-input').click();
      });

    // File input change → load session file
    document.getElementById('session-file-input')
      .addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (!file) return;
        JaperYT.Session.readFile(file)
          .then(function (data) {
            JaperYT.Session.apply(data);
            onKeysReady();
            JaperYT.UI.toast('Session loaded from ' + file.name);
          })
          .catch(function (err) {
            JaperYT.UI.toast(err.message || 'Failed to load session.');
          });
        // Reset the input so the same file can be re-selected
        e.target.value = '';
      });

    // "Back" button on new session form
    document.getElementById('btn-back-to-welcome')
      .addEventListener('click', function () {
        hideAllOverlays();
        document.getElementById('welcome-overlay').style.display = 'flex';
      });

    // API keys form submit
    document.getElementById('api-keys-form')
      .addEventListener('submit', function (e) {
        e.preventDefault();
        var ytKey     = document.getElementById('input-yt-key').value.trim();
        var openaiKey = document.getElementById('input-openai-key').value.trim();
        if (!ytKey || !openaiKey) {
          JaperYT.UI.toast('Please enter both API keys.');
          return;
        }
        JaperYT.KeyExchange.setKeys({ youtube: ytKey, openai: openaiKey });
        onKeysReady();
      });
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

  function hideAllOverlays() {
    document.getElementById('welcome-overlay').style.display     = 'none';
    document.getElementById('new-session-overlay').style.display  = 'none';
    document.getElementById('pairing-overlay').style.display      = 'none';
    document.getElementById('app-body').style.display             = 'none';
  }

  function showWelcome() {
    hideAllOverlays();
    document.getElementById('welcome-overlay').style.display    = 'flex';
    document.getElementById('btn-disconnect').style.display     = 'none';
    document.getElementById('btn-save-session').style.display   = 'none';
  }

  function onKeysReady() {
    hideAllOverlays();
    document.getElementById('app-body').style.display          = 'flex';
    document.getElementById('btn-disconnect').style.display    = '';
    document.getElementById('btn-save-session').style.display  = '';
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
