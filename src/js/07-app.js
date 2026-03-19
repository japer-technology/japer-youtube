/* ── App Bootstrap ─────────────────────────────────────────────────────────── */

JaperYT.App = (function () {
  function start() {
    JaperYT.Player.init();
    JaperYT.UI.setLoggedIn(false);

    document.getElementById('btn-login')
      .addEventListener('click', function () { JaperYT.Auth.signIn(); });

    document.getElementById('btn-login-hero')
      .addEventListener('click', function () { JaperYT.Auth.signIn(); });

    document.getElementById('btn-signout')
      .addEventListener('click', function () { JaperYT.Auth.signOut(); });

    // Toggle user menu
    document.getElementById('user-avatar')
      .addEventListener('click', function () {
        document.getElementById('user-menu').classList.toggle('open');
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
      .catch(function (err) { console.error('[subs]', err); });

    // Load activity feed
    JaperYT.Subscriptions.getFeed()
      .then(function (videos) {
        JaperYT.UI.renderVideoGrid(videos);
      })
      .catch(function (err) {
        console.error('[feed]', err);
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
