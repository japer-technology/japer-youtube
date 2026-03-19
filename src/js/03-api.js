/* ── YouTube Data API Helper ───────────────────────────────────────────────── */

JaperYT.API = (function () {
  /**
   * Make an authenticated GET request to the YouTube Data API v3.
   * @param {string} endpoint  e.g. '/subscriptions'
   * @param {object} params    query-string parameters
   * @returns {Promise<object>}
   */
  function request(endpoint, params) {
    var token = JaperYT.Auth.getToken();
    var url = new URL(JaperYT.CONFIG.API_BASE + endpoint);
    if (params) {
      Object.keys(params).forEach(function (k) {
        url.searchParams.set(k, params[k]);
      });
    }

    return fetch(url.toString(), {
      headers: { Authorization: 'Bearer ' + token },
    }).then(function (res) {
      if (!res.ok) throw new Error('API ' + res.status);
      return res.json();
    });
  }

  return { request: request };
})();
