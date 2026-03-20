/* ── Session Save / Load ───────────────────────────────────────────────────── */

JaperYT.Session = (function () {
  var FILE_VERSION = 1;

  /**
   * Build a session object from current in-memory state.
   * @returns {object}
   */
  function toJSON() {
    return {
      version:  FILE_VERSION,
      keys:     JaperYT.KeyExchange.getKeys(),
      channels: JaperYT.Subscriptions.getChannels(),
    };
  }

  /**
   * Save current session to a .json file via browser download.
   */
  function save() {
    var data = toJSON();
    if (!data.keys) {
      JaperYT.UI.toast('No active session to save.');
      return;
    }
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href     = url;
    a.download = 'japer-session.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    JaperYT.UI.toast('Session saved.');
  }

  /**
   * Read a session file chosen by the user and return parsed data.
   * @param {File} file
   * @returns {Promise<object>}
   */
  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data.keys || !data.keys.youtube || !data.keys.openai) {
            reject(new Error('File does not contain valid API keys.'));
            return;
          }
          resolve(data);
        } catch (e) {
          reject(new Error('Invalid session file.'));
        }
      };
      reader.onerror = function () { reject(new Error('Could not read file.')); };
      reader.readAsText(file);
    });
  }

  /**
   * Apply a parsed session to the app (set keys, restore channels).
   * @param {object} data — parsed session JSON
   */
  function apply(data) {
    JaperYT.KeyExchange.setKeys(data.keys);
    if (data.channels && data.channels.length) {
      JaperYT.UI.renderSubscriptions(data.channels);
    }
  }

  return {
    save:     save,
    readFile: readFile,
    apply:    apply,
  };
})();
