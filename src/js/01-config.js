/* ── Configuration ─────────────────────────────────────────────────────────── */
var JaperYT = window.JaperYT || {};

/**
 * IMPORTANT: Replace the CLIENT_ID below with your own Google Cloud
 * OAuth 2.0 Client ID.  Steps:
 *   1. Go to https://console.cloud.google.com/apis/credentials
 *   2. Create an OAuth 2.0 Client ID (Web application)
 *   3. Add your origin to "Authorized JavaScript origins"
 *   4. Enable the YouTube Data API v3 for the project
 */
JaperYT.CONFIG = {
  CLIENT_ID:    'YOUR_CLIENT_ID.apps.googleusercontent.com',
  SCOPES:       'https://www.googleapis.com/auth/youtube.readonly',
  DISCOVERY_DOC:'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
  API_BASE:     'https://www.googleapis.com/youtube/v3',
  MAX_RESULTS:  25,
};
