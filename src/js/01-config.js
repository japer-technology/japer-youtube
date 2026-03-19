/* ── Configuration ─────────────────────────────────────────────────────────── */
var JaperYT = window.JaperYT || {};

JaperYT.CONFIG = {
  /* JAPER API — handles barcode key exchange */
  JAPER_API_BASE: 'https://api.japer.tech/v1',

  /* YouTube Data API v3 */
  YT_API_BASE:  'https://www.googleapis.com/youtube/v3',
  MAX_RESULTS:  25,

  /* Required API key names — these are shown to the user in JAPER App */
  REQUIRED_KEYS: ['youtube', 'openai'],

  /* Polling interval (ms) while waiting for JAPER App approval */
  POLL_INTERVAL: 2500,
  POLL_TIMEOUT:  300000,  /* 5 minutes before we abandon */
};
