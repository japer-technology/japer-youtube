/* ── UI Helpers ────────────────────────────────────────────────────────────── */

JaperYT.UI = (function () {
  var isViewingChannel = false;

  /**
   * Show a toast notification at the bottom of the screen.
   */
  function toast(msg) {
    var container = document.getElementById('toast-container');
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function () { el.remove(); }, 3500);
  }

  /**
   * Render a list of subscription channels in the sidebar.
   */
  function renderSubscriptions(channels) {
    var list = document.getElementById('subscriptions-list');
    channels.forEach(function (ch) {
      var el = document.createElement('div');
      el.className = 'subscription-item';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.dataset.channelId = ch.channelId;
      el.innerHTML =
        '<img class="subscription-item__thumb" alt="" src="' + escapeAttr(ch.thumb) + '">' +
        '<span class="subscription-item__name">' + escapeHTML(ch.title) + '</span>';
      el.addEventListener('click', function () {
        selectChannel(ch);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectChannel(ch); }
      });
      list.appendChild(el);
    });
  }

  /**
   * When a channel is clicked in the sidebar, load its videos.
   */
  function selectChannel(ch) {
    document.querySelectorAll('.subscription-item.active')
      .forEach(function (el) { el.classList.remove('active'); });
    var el = document.querySelector('[data-channel-id="' + CSS.escape(ch.channelId) + '"]');
    if (el) el.classList.add('active');

    isViewingChannel = true;
    updateBackButton();
    setFeedTitle(ch.title);
    showSpinner();

    JaperYT.Subscriptions.getVideos(ch.channelId)
      .then(function (videos) {
        renderVideoGrid(videos);
      })
      .catch(function (err) {
        console.error(err);
        toast('Failed to load videos');
        showEmpty('Failed to load videos.');
      });
  }

  /**
   * Return to the subscription activity feed.
   */
  function backToFeed() {
    isViewingChannel = false;
    updateBackButton();
    document.querySelectorAll('.subscription-item.active')
      .forEach(function (el) { el.classList.remove('active'); });
    setFeedTitle('Subscription Feed');
    showSpinner();

    JaperYT.Subscriptions.getFeed()
      .then(function (videos) {
        renderVideoGrid(videos);
      })
      .catch(function (err) {
        console.error(err);
        toast('Could not load your feed');
        showEmpty('Could not load your feed.');
      });
  }

  function updateBackButton() {
    var btn = document.getElementById('back-to-feed');
    btn.classList.toggle('visible', isViewingChannel);
  }

  /**
   * Render a grid of video cards.
   */
  function renderVideoGrid(videos) {
    var grid = document.getElementById('video-grid');
    grid.innerHTML = '';

    if (!videos.length) {
      showEmpty('No videos found.');
      return;
    }

    videos.forEach(function (v) {
      var card = document.createElement('div');
      card.className = 'video-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', v.title);
      card.innerHTML =
        '<div class="video-card__thumb"><img alt="" src="' + escapeAttr(v.thumb) + '"></div>' +
        '<div class="video-card__info">' +
          '<div class="video-card__meta">' +
            '<div class="video-card__title">' + escapeHTML(v.title) + '</div>' +
            '<div class="video-card__subtitle">' + escapeHTML(v.channel) +
              ' &middot; ' + timeSince(v.publishedAt) + '</div>' +
          '</div>' +
        '</div>';
      card.addEventListener('click', function () {
        JaperYT.Player.open(v);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); JaperYT.Player.open(v); }
      });
      grid.appendChild(card);
    });
  }

  function setFeedTitle(title) {
    document.getElementById('feed-title').textContent = title;
  }

  function showSpinner() {
    var grid = document.getElementById('video-grid');
    grid.innerHTML = '<div class="spinner" role="status" aria-label="Loading"></div>';
  }

  function showEmpty(msg) {
    var grid = document.getElementById('video-grid');
    grid.innerHTML = '<div class="empty-state">' + escapeHTML(msg) + '</div>';
  }

  /**
   * Toggle UI between logged-in and logged-out states.
   */
  function setLoggedIn(loggedIn) {
    document.getElementById('login-overlay').style.display = loggedIn ? 'none' : 'flex';
    document.getElementById('app-body').style.display      = loggedIn ? 'flex' : 'none';
    document.getElementById('btn-login').style.display     = loggedIn ? 'none' : '';
    document.getElementById('user-area').style.display     = loggedIn ? 'flex' : 'none';

    if (loggedIn) {
      var profile = JaperYT.Auth.getProfile();
      if (profile) {
        document.getElementById('user-avatar').src = profile.photo;
      }
    }
  }

  // ── Utilities ──

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function timeSince(dateStr) {
    var seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    var intervals = [
      { label: 'year',   s: 31536000 },
      { label: 'month',  s: 2592000 },
      { label: 'week',   s: 604800 },
      { label: 'day',    s: 86400 },
      { label: 'hour',   s: 3600 },
      { label: 'minute', s: 60 },
    ];
    for (var i = 0; i < intervals.length; i++) {
      var count = Math.floor(seconds / intervals[i].s);
      if (count >= 1) return count + ' ' + intervals[i].label + (count > 1 ? 's' : '') + ' ago';
    }
    return 'just now';
  }

  return {
    renderSubscriptions: renderSubscriptions,
    renderVideoGrid:     renderVideoGrid,
    setLoggedIn:         setLoggedIn,
    setFeedTitle:        setFeedTitle,
    showSpinner:         showSpinner,
    showEmpty:           showEmpty,
    backToFeed:          backToFeed,
    toast:               toast,
  };
})();
