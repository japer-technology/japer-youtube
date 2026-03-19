/* ── App Bootstrap ─────────────────────────────────────────────────────────── */

JaperYT.App = (function () {
  var userMenu;

  function start() {
    userMenu = document.getElementById('user-menu');

    JaperYT.Player.init();
    JaperYT.UI.setLoggedIn(false);

    document.getElementById('btn-login')
      .addEventListener('click', function () { JaperYT.Auth.signIn(); });

    document.getElementById('btn-login-hero')
      .addEventListener('click', function () { JaperYT.Auth.signIn(); });

    document.getElementById('btn-signout')
      .addEventListener('click', function () { JaperYT.Auth.signOut(); });

    document.getElementById('back-to-feed')
      .addEventListener('click', function () { JaperYT.UI.backToFeed(); });

    // Toggle user menu
    document.getElementById('user-avatar')
      .addEventListener('click', function (e) {
        e.stopPropagation();
        userMenu.classList.toggle('open');
      });

    // Close user menu on outside click or Escape
    document.addEventListener('click', function () {
      userMenu.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') userMenu.classList.remove('open');
    });

    // Initialise auth — the callback fires when login state changes
    JaperYT.Auth.init(onAuthChange);
  }

  function onAuthChange(loggedIn) {
    JaperYT.UI.setLoggedIn(loggedIn);
    if (loggedIn) {
      loadSubscriptionsFeed();
    }
  }

  function loadSubscriptionsFeed() {
    JaperYT.UI.setFeedTitle('Subscription Feed');
    JaperYT.UI.showSpinner();

    // Load sidebar subscriptions
    JaperYT.Subscriptions.load()
      .then(function (result) {
        JaperYT.UI.renderSubscriptions(result.items);
        loadMoreSubscriptions(result.nextPageToken);
      })
      .catch(function (err) {
        console.error('[subs]', err);
        JaperYT.UI.toast('Failed to load subscriptions');
      });

    // Load activity feed
    JaperYT.Subscriptions.getFeed()
      .then(function (videos) {
        JaperYT.UI.renderVideoGrid(videos);
      })
      .catch(function (err) {
        console.error('[feed]', err);
        JaperYT.UI.toast('Could not load your feed');
        JaperYT.UI.showEmpty('Could not load your feed.');
      });
  }

  /**
   * Recursively load remaining subscription pages so the full list appears
   * in the sidebar.
   */
  function loadMoreSubscriptions(pageToken) {
    if (!pageToken) return;
    JaperYT.Subscriptions.load(pageToken)
      .then(function (result) {
        JaperYT.UI.renderSubscriptions(result.items);
        loadMoreSubscriptions(result.nextPageToken);
      });
  }

  return { start: start };
})();

/* ── Kick off when GIS library finishes loading ───────────────────────────── */
window.onGISLoaded = function () {
  JaperYT.App.start();
};

/* Fallback: if GIS fails to load, still render the login screen */
window.addEventListener('load', function () {
  setTimeout(function () {
    if (typeof google === 'undefined' || !google.accounts) {
      JaperYT.UI.toast('Google sign-in library failed to load. Check your connection or ad-blocker.');
    }
  }, 5000);
});
