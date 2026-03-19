/* ── Subscriptions ─────────────────────────────────────────────────────────── */

JaperYT.Subscriptions = (function () {
  var channels = [];
  var nextPageToken = null;

  /**
   * Fetch the user's subscriptions (one page at a time).
   * @param {string} [pageToken]
   * @returns {Promise<{items: Array, nextPageToken: string|null}>}
   */
  function load(pageToken) {
    var params = {
      part:       'snippet',
      mine:       true,
      maxResults: JaperYT.CONFIG.MAX_RESULTS,
      order:      'alphabetical',
    };
    if (pageToken) params.pageToken = pageToken;

    return JaperYT.API.request('/subscriptions', params)
      .then(function (data) {
        var items = (data.items || []).map(function (item) {
          var s = item.snippet;
          return {
            channelId: s.resourceId.channelId,
            title:     s.title,
            thumb:     s.thumbnails.default.url,
          };
        });
        channels = channels.concat(items);
        nextPageToken = data.nextPageToken || null;
        return { items: items, nextPageToken: nextPageToken };
      });
  }

  /**
   * Fetch recent uploads for a given channel.
   * @param {string} channelId
   * @returns {Promise<Array>}
   */
  function getVideos(channelId) {
    return JaperYT.API.request('/search', {
      part:       'snippet',
      channelId:  channelId,
      order:      'date',
      type:       'video',
      maxResults: JaperYT.CONFIG.MAX_RESULTS,
    }).then(function (data) {
      return (data.items || []).map(function (item) {
        var s = item.snippet;
        return {
          videoId:     item.id.videoId,
          title:       s.title,
          channel:     s.channelTitle,
          thumb:       s.thumbnails.medium.url,
          publishedAt: s.publishedAt,
        };
      });
    });
  }

  /**
   * Fetch the user's subscription activity feed (latest videos across all
   * subscriptions).  Uses the Activities endpoint.
   * @returns {Promise<Array>}
   */
  function getFeed() {
    return JaperYT.API.request('/activities', {
      part:       'snippet,contentDetails',
      mine:       true,
      maxResults: JaperYT.CONFIG.MAX_RESULTS,
    }).then(function (data) {
      return (data.items || [])
        .filter(function (item) { return item.snippet.type === 'upload'; })
        .map(function (item) {
          var s = item.snippet;
          var videoId = item.contentDetails.upload
            ? item.contentDetails.upload.videoId
            : '';
          return {
            videoId:     videoId,
            title:       s.title,
            channel:     s.channelTitle,
            thumb:       s.thumbnails.medium
                           ? s.thumbnails.medium.url
                           : s.thumbnails.default.url,
            publishedAt: s.publishedAt,
          };
        });
    });
  }

  function getChannels()       { return channels; }
  function getNextPageToken()  { return nextPageToken; }

  return {
    load:             load,
    getVideos:        getVideos,
    getFeed:          getFeed,
    getChannels:      getChannels,
    getNextPageToken: getNextPageToken,
  };
})();
