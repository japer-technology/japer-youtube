# japer-youtube

A single-file HTML/JS/CSS YouTube subscription viewer. Source is maintained in separate pieces under `src/` and assembled into one `dist/index.html` via `node build.js`.

## Prerequisites

- Node.js (for the build script — no npm dependencies required)
- A Google Cloud project with **YouTube Data API v3** enabled
- An **OAuth 2.0 Client ID** (Web application) from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

## Setup

1. Clone the repo
2. Edit `src/js/01-config.js` and replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your real client ID
3. Add your serving origin (e.g. `http://localhost:8080`) to the "Authorized JavaScript origins" in Google Cloud Console

## Build

```bash
node build.js            # one-shot build → dist/index.html
node build.js --watch    # rebuild on every file change
```

## Serve

```bash
npx http-server dist -p 8080 -o
# or any static server of your choice
```

## Project Structure

```
src/
  html/           HTML fragments assembled into the final page
    head.html         <head> content (meta, title, GIS script tag)
    body-header.html  app header with auth controls
    body-main.html    main content: login overlay, sidebar, video grid, player
    body-footer.html  footer placeholder
  css/            CSS files, sorted by filename prefix
    01-variables.css    custom properties (theme)
    02-reset.css        minimal reset
    03-layout.css       page layout
    04-header.css       header/nav bar
    05-auth.css         login button, user menu, login overlay
    06-subscriptions.css sidebar list, video cards, loading states
    07-player.css       full-screen video player overlay
    08-responsive.css   media queries
  js/             JS files, sorted by filename prefix
    01-config.js        API config (client ID, scopes)
    02-auth.js          Google Identity Services OAuth 2.0 flow
    03-api.js           YouTube Data API fetch wrapper
    04-subscriptions.js subscription & feed data loading
    05-player.js        embedded player open/close
    06-ui.js            DOM rendering helpers
    07-app.js           bootstrap & initialization
build.js          Node.js assembler script
dist/             build output (git-ignored)
```