/* ── Google Identity Services (OAuth 2.0) ──────────────────────────────────── */

JaperYT.Auth = (function () {
  var tokenClient = null;
  var accessToken = null;
  var userProfile = null;
  var onAuthChange = null;

  /**
   * Initialise the GIS token client.  Called once the GIS library has loaded.
   */
  function init(callback) {
    onAuthChange = callback;

    /* global google */
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: JaperYT.CONFIG.CLIENT_ID,
      scope:     JaperYT.CONFIG.SCOPES,
      callback:  handleTokenResponse,
    });
  }

  /**
   * Prompt the user to sign in / consent.
   */
  function signIn() {
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  }

  /**
   * Revoke access and clear local state.
   */
  function signOut() {
    if (accessToken) {
      google.accounts.oauth2.revoke(accessToken);
    }
    accessToken = null;
    userProfile = null;
    if (onAuthChange) onAuthChange(false);
  }

  /**
   * Handle token response from GIS.
   */
  function handleTokenResponse(resp) {
    if (resp.error) {
      console.error('[Auth] token error', resp);
      JaperYT.UI.toast('Sign-in failed: ' + (resp.error_description || resp.error));
      return;
    }
    accessToken = resp.access_token;
    fetchProfile();
  }

  /**
   * Fetch the authenticated user's channel info for display.
   */
  function fetchProfile() {
    JaperYT.API.request('/channels', {
      part: 'snippet',
      mine: true,
    }).then(function (data) {
      if (data.items && data.items.length) {
        var ch = data.items[0].snippet;
        userProfile = {
          name:  ch.title,
          photo: ch.thumbnails.default.url,
        };
      }
      if (onAuthChange) onAuthChange(true);
    });
  }

  function getToken()   { return accessToken; }
  function getProfile() { return userProfile; }

  return {
    init:       init,
    signIn:     signIn,
    signOut:    signOut,
    getToken:   getToken,
    getProfile: getProfile,
  };
})();
