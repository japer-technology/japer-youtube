/* ── YouTube Data API Helper ───────────────────────────────────────────────── */

JaperYT.API = (function () {
  /**
   * Make a GET request to the YouTube Data API v3 using the API key
   * obtained via JAPER App key exchange.
   * @param {string} endpoint  e.g. '/search'
   * @param {object} params    query-string parameters
   * @returns {Promise<object>}
   */
  function request(endpoint, params) {
    var apiKey = JaperYT.KeyExchange.getKey('youtube');
    if (!apiKey) return Promise.reject(new Error('YouTube API key not available'));

    var url = new URL(JaperYT.CONFIG.YT_API_BASE + endpoint);
    url.searchParams.set('key', apiKey);
    if (params) {
      Object.keys(params).forEach(function (k) {
        url.searchParams.set(k, params[k]);
      });
    }

    return fetch(url.toString())
      .then(function (res) {
        if (!res.ok) throw new Error('API ' + res.status);
        return res.json();
      });
  }

  return { request: request };
})();
