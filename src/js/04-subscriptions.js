/* ── Channels & Videos ─────────────────────────────────────────────────────── */

JaperYT.Subscriptions = (function () {
  var channels = [];

  /**
   * Look up a channel by handle, username, or ID and add it to the sidebar.
   * @param {string} query — channel name / handle to search for
   * @returns {Promise<object>} the resolved channel
   */
  function addChannel(query) {
    return JaperYT.API.request('/search', {
      part:       'snippet',
      q:          query,
      type:       'channel',
      maxResults: 1,
    }).then(function (data) {
      if (!data.items || !data.items.length) {
        throw new Error('Channel not found');
      }
      var s = data.items[0].snippet;
      var ch = {
        channelId: data.items[0].id.channelId,
        title:     s.title,
        thumb:     s.thumbnails.default.url,
      };
      if (!channels.some(function (c) { return c.channelId === ch.channelId; })) {
        channels.push(ch);
      }
      return ch;
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
   * Search YouTube for videos matching a query.
   * @param {string} query
   * @returns {Promise<Array>}
   */
  function searchVideos(query) {
    return JaperYT.API.request('/search', {
      part:       'snippet',
      q:          query,
      type:       'video',
      order:      'relevance',
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
   * Fetch trending / popular videos as a home feed.
   * @returns {Promise<Array>}
   */
  function getTrending() {
    return JaperYT.API.request('/videos', {
      part:       'snippet',
      chart:      'mostPopular',
      maxResults: JaperYT.CONFIG.MAX_RESULTS,
    }).then(function (data) {
      return (data.items || []).map(function (item) {
        var s = item.snippet;
        return {
          videoId:     item.id,
          title:       s.title,
          channel:     s.channelTitle,
          thumb:       s.thumbnails.medium.url,
          publishedAt: s.publishedAt,
        };
      });
    });
  }

  function getChannels() { return channels; }

  return {
    addChannel:   addChannel,
    getVideos:    getVideos,
    searchVideos: searchVideos,
    getTrending:  getTrending,
    getChannels:  getChannels,
  };
})();
