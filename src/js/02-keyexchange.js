/* ── Key Exchange via JAPER App (Aztec Barcode Pairing) ────────────────────── */

JaperYT.KeyExchange = (function () {
  var keys = null;        /* { youtube: '...', openai: '...' } */
  var sessionId = null;
  var pollTimer = null;
  var onKeysReady = null;

  /**
   * Generate a cryptographically random session ID (hex string).
   */
  function generateSessionId() {
    var arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }

  /**
   * Start the key exchange flow:
   *  1. Generate random session ID
   *  2. Register session with JAPER API
   *  3. Render Aztec barcode
   *  4. Poll for approved keys
   *
   * @param {function} callback — called with true when keys arrive
   */
  function start(callback) {
    onKeysReady = callback;
    sessionId = generateSessionId();

    registerSession()
      .then(function () {
        renderBarcode();
        startPolling();
      })
      .catch(function (err) {
        console.error('[KeyExchange] register failed', err);
        JaperYT.UI.toast('Could not reach JAPER API.');
      });
  }

  /**
   * Register this session with the JAPER API so the mobile app
   * can look it up after scanning the barcode.
   */
  function registerSession() {
    return fetch(JaperYT.CONFIG.JAPER_API_BASE + '/sessions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        sessionId:    sessionId,
        requiredKeys: JaperYT.CONFIG.REQUIRED_KEYS,
        appName:      'Japer YouTube',
      }),
    }).then(function (res) {
      if (!res.ok) throw new Error('register ' + res.status);
    });
  }

  /**
   * Render the session ID as an Aztec barcode using bwip-js.
   */
  function renderBarcode() {
    var canvas = document.getElementById('pairing-barcode');
    if (!canvas) return;

    /* global bwipjs */
    try {
      bwipjs.toCanvas(canvas, {
        bcid:       'azteccode',
        text:       sessionId,
        scale:      4,
        width:      40,
        height:     40,
        includetext: false,
      });
    } catch (e) {
      console.error('[KeyExchange] barcode render error', e);
      JaperYT.UI.toast('Could not generate barcode.');
    }
  }

  /**
   * Poll the JAPER API for approved keys.
   */
  function startPolling() {
    var started = Date.now();
    var statusEl = document.getElementById('pairing-status');

    pollTimer = setInterval(function () {
      if (Date.now() - started > JaperYT.CONFIG.POLL_TIMEOUT) {
        stopPolling();
        if (statusEl) statusEl.textContent = 'Session expired. Refresh to try again.';
        JaperYT.UI.toast('Pairing timed out.');
        return;
      }

      fetch(JaperYT.CONFIG.JAPER_API_BASE + '/sessions/' +
            encodeURIComponent(sessionId) + '/keys')
        .then(function (res) {
          if (res.status === 200) return res.json();
          return null;  /* 204 / 404 = not ready yet */
        })
        .then(function (data) {
          if (data && data.keys) {
            keys = data.keys;
            stopPolling();
            if (onKeysReady) onKeysReady(true);
          }
        })
        .catch(function () { /* network hiccup — keep polling */ });
    }, JaperYT.CONFIG.POLL_INTERVAL);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  /**
   * Disconnect — clear keys from memory.
   */
  function disconnect() {
    stopPolling();
    keys = null;
    sessionId = null;
    if (onKeysReady) onKeysReady(false);
  }

  function getKey(name)  { return keys ? keys[name] : null; }
  function isReady()     { return keys !== null; }
  function getSessionId(){ return sessionId; }

  return {
    start:        start,
    disconnect:   disconnect,
    getKey:       getKey,
    isReady:      isReady,
    getSessionId: getSessionId,
  };
})();
