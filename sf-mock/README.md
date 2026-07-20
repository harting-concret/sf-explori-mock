# Explori in Salesforce: Wireframe Harness

Lightweight Vite + React harness that renders the persona wireframes from
`icp-journeys/` inside a Salesforce-looking shell. Built to iterate fast on
persona screens for the Explori AppExchange proposal.

## Run

```bash
cd sf-mocks
npm install
npm run dev      # http://localhost:5180
```

## What's reusable

| Piece | File | Purpose |
|---|---|---|
| SF Header / Footer | `src/salesforce/Header.tsx`, `Footer.tsx` | Global Salesforce chrome |
| Record Details | `src/salesforce/RecordDetails.tsx` | Highlights panel; renders any object via props |
| Record Page shell | `src/salesforce/RecordPage.tsx` | Tabs + slots the Explori panel into an "Explori Intelligence" tab |
| Home surface | `src/salesforce/HomePage.tsx` | Home page with embedded Explori panel |
| Report surface | `src/salesforce/ReportPage.tsx` | Full-width SF report / list view using Explori fields (`ReportPanel`) |
| Explori atoms | `src/explori/primitives.tsx` | SignalStrip, TrendBar, Recommendation, PanelHeader |
| Explori panels | `src/explori/panels/*` | One component per wireframe |
| Sidebar widget | `src/explori/SidebarWidget.tsx` | Trimmed per-persona variant for the right sidebar |
| Render frame | `src/explori/RenderFrame.tsx` | iframe vs native visual cue around any panel |

Account / Opportunity / Lead UX is selected by the scene's `chrome.objectType`
and `panel.kind`; the same `RecordPage` shell drives all three.

## Persona dropdown

The sidebar dropdown lists the five revenue-chain personas from
`sf-journeys.md` (CCO, Event Director, Sales Manager, Senior Account Manager,
Sales Rep). Selecting a persona filters its scenes. Personas with no mockups
yet show a `· soon` tag and an empty state.

Populated today, mapped from the `icp-journeys/` files:

| Persona | Scenes |
|---|---|
| CCO / VP Commercial | Portfolio Pulse (home), Revenue at Risk report, Event risk drill-down |
| Sales Manager | Pipeline list view, Risk Exceptions view, Account 1:1 coaching |
| Senior Account Manager | Account, Opportunity, Lead (known), Lead (sector), Home strip |

Event Director and Sales Rep are still `· soon`.

## Right sidebar (trimmed widgets)

Record and Home surfaces follow Salesforce's "Header and Right Sidebar"
Lightning template: a narrow (~300px) SMALL region on the right where SF itself
puts Activity, News, and compact related-list cards.

`SidebarWidget.tsx` renders a trimmed variant of each persona's panel there,
derived from the same scene data (no extra fixtures). It stays visible on every
record tab, so the intelligence never disappears when the user works the
Related or Details tab. Reports stay full width, matching real list views.

Build story, iteration 1 (Canvas iframe, client's preference):

- Explori serves a compact widget route from its own web app
  (`widgets.explori.com/...`), embedded via Canvas. Salesforce allows Canvas in
  any App Builder region, including the narrow sidebar: wrap `force:canvasApp`
  in a small Aura component (`flexipage:availableForRecordHome`) and drag it in.
- Constraints to carry into the proposal: the wrapper must be Aura (LWC does
  not support Canvas); each widget load is a signed-request POST counted
  against the org's Canvas call limit (5,000/day per full user license,
  org-wide); Explori's widget route must render responsively at ~280px; needs
  the same CSP `frame-ancestors` change as the main Canvas panel.
- The dashed border + `iframe · Canvas widget` badge encode this, consistent
  with the harness-wide iframe cue. Each widget header carries a ↗ popout
  (View more on explori.com) linking the trimmed view to the full report.

Iteration 2 option: rebuild as one width-aware native LWC
(`@api flexipageRegionWidth` returns SMALL / MEDIUM / LARGE per region), so the
same component serves the main tab and the sidebar with no Canvas round-trips.

## iframe vs native (render mode)

Every scene declares a `renderMode`:

| Mode | Visual cue | Means |
|---|---|---|
| `iframe` | dashed purple border + `iframe · Canvas embed` badge | Explori's existing web UI embedded via Canvas. Needs the CSP header change. |
| `native` | solid, with a `⚡ Native Salesforce` badge | Built on the platform: LWC / Flow / config. |

`buildLabel` adds the precise build type (e.g. `Canvas embed`, `API + LWC`).
The legend in the sidebar explains the convention for client demos.

## Add a persona or screen

Append entries to `src/fixtures/scenes.ts`. Each scene declares its
`personaId`, `surface`, `renderMode`, optional `buildLabel`, the Salesforce
record chrome, and the Explori panel data. To light up a new persona, add
scenes tagged with its `personaId` (personas themselves are listed at the top
of `scenes.ts`). New record-type panels go in `src/explori/panels/` and get
wired in `src/explori/ExploriPanel.tsx`.

## Scope note

This is a clickable wireframe harness, not a Salesforce build. The Salesforce
skin is SLDS via CDN; the Explori panels are custom-styled to mirror how a
Canvas/LWC panel would carry Explori's own brand inside Salesforce.

---

# Salesforce Canvas Authentication

This section documents the three Salesforce Canvas authentication methods
implemented in this app's backend (`server/`): **Signed Request**, **OAuth
Web Server flow**, and **OAuth User-Agent flow**. All three were built as
part of a POC to compare approaches; the codebase supports all three
simultaneously, and which one actually runs depends entirely on Salesforce's
Canvas app configuration (the **Access Method** setting) plus, for OAuth,
which panel is being loaded.

## Table of Contents

1. [Overview](#overview)
2. [Architecture at a Glance](#architecture-at-a-glance)
3. [Authentication Method 1: Signed Request](#authentication-method-1-signed-request)
4. [Authentication Method 2: OAuth Web Server Flow](#authentication-method-2-oauth-web-server-flow)
5. [Authentication Method 3: OAuth User-Agent Flow](#authentication-method-3-oauth-user-agent-flow)
6. [Panel → Auth Flow Mapping](#panel--auth-flow-mapping)
7. [File Map](#file-map)
8. [Switching Between Flows](#switching-between-flows)
9. [Environment Variables & Salesforce Configuration](#environment-variables--salesforce-configuration)
10. [Testing Guide](#testing-guide)
11. [Troubleshooting](#troubleshooting)
12. [Comparison Summary](#comparison-summary)

---

## Overview

Salesforce Canvas apps support two fundamentally different ways for
Salesforce to hand off trust to an embedded third-party app:

- **Signed Request** — Salesforce POSTs a cryptographically signed payload on
  every load; no user-facing login step, trust comes from a pre-shared
  secret.
- **OAuth (Get)** — Salesforce loads the Canvas URL with a plain GET; the app
  is responsible for taking the user through a real Salesforce OAuth login
  before showing any data. OAuth itself has two grant types this POC
  implements side by side:
  - **Web Server flow** — authorization code + PKCE, exchanged for a token
    entirely server-side. The access token never reaches the browser.
  - **User-Agent flow** — implicit grant; Salesforce hands the access token
    directly to the browser in a URL fragment. Simpler, no server-side
    secret involved, but the token is briefly exposed to the browser.

All three are implemented and were verified end-to-end against a real
Salesforce Developer Edition org (`concretio81-dev-ed`) and the deployed
Heroku app.

## Architecture at a Glance

```
Salesforce Canvas app (Access Method: Signed Request OR OAuth/Get)
        │
        ▼
   POST /canvas  ──────────────────────────────►  server/auth/signedRequest.js
   (Signed Request)                                 - verify HMAC signature
                                                      - extract parameters
                                                      - redirect to panel
        │
   GET /canvas  ───────────────────────────────►  index.js gate
   (OAuth/Get)                                       - already authorized? → redirect to panel
                                                      - else → renderSignInPage()
                                                            │
                                                            ▼
                                                   panel === "opportunity"?
                                                    ├─ yes → User-Agent flow
                                                    └─ no  → Web Server flow
                                                            │
                                    ┌───────────────────────┴────────────────────────┐
                                    ▼                                                ▼
                     server/auth/webServerFlow.js                     server/auth/userAgentFlow.js
                     /oauth/web-server/authorize                      /oauth/user-agent/authorize
                     /oauth/web-server/callback                       /oauth/user-agent/callback
                     (code + PKCE, server-side                        /oauth/user-agent/mark-authorized
                      token exchange)                                 (reads token from URL fragment,
                                                                        client-side, then POSTs it back)
                                    │                                                │
                                    └───────────────────┬────────────────────────────┘
                                                         ▼
                                          req.session.authorized = true
                                                         │
                                                         ▼
                                          buildCanvasRedirectUrl(parameters)
                                          → correct Explori panel renders with live data
```

## Authentication Method 1: Signed Request

**How it works:**

1. Salesforce builds a payload containing org/user context and any custom
   Canvas parameters (`panel`, `exhibitor`, `event`, `company`), signs it with
   HMAC-SHA256 using the Canvas app's Consumer Secret, and POSTs it to the
   Canvas App URL as a `signature.payload` string in the `signed_request`
   form field.
2. Our server recomputes the same HMAC signature using its own copy of the
   secret (`CANVAS_CONSUMER_SECRET`) and compares it to what Salesforce sent.
3. If they match, the payload is trusted completely and parameters are
   extracted from it. If they don't match, or the field is missing, the
   request is rejected with `401`.
4. The server redirects to the correct panel based on the extracted
   parameters. No login screen, no popup, no visible authentication step at
   all — it happens once, silently, per page load.

**Implementation:**

| Concern | Where |
|---|---|
| Entry point | `POST /canvas`, mounted in `server/index.js` via `app.use("/canvas", signedRequestFlow)` |
| Route handler | `server/auth/signedRequest.js` → `router.post("/", ...)` |
| Signature verification | `server/verifySignedRequest.js` → `verifySignedRequest(signedRequest, secret)` |
| Parameter extraction | `server/canvasRedirect.js` → `extractParameters(context)` (handles both real Salesforce's nested `context.environment.parameters` shape and this app's own simplified mock shape) |
| Session handling | None — this method is stateless; trust is re-verified on every single request, no session cookie involved |
| Callback flow | Not applicable — there's no redirect-based handshake, it's a single request/response |
| Panel rendering | `buildCanvasRedirectUrl(parameters)` in `server/canvasRedirect.js`, shared by all three auth methods |

## Authentication Method 2: OAuth Web Server Flow

**How it works:**

1. Salesforce GETs `/canvas` with custom parameters as query params (no
   `signed_request` at all under the OAuth access method).
2. If the browser doesn't already have `req.session.authorized === true`, the
   user sees a "Sign in with Salesforce" screen instead of any panel data.
3. Clicking sign-in opens a popup pointed at
   `/oauth/web-server/authorize`. The server generates a random secret
   (`code_verifier`), stores it in the session, sends Salesforce only a
   SHA-256 hash of it (`code_challenge`) — this is PKCE, required by this
   org's Salesforce configuration.
4. The popup is redirected to Salesforce's login page with
   `response_type=code`.
5. User logs in and approves access.
6. Salesforce redirects the popup back to
   `/oauth/web-server/callback?code=...&state=...` — the code is a visible
   URL query parameter here.
7. The server exchanges that code for a real access token via a **private,
   server-to-server** POST to Salesforce's token endpoint, presenting
   `client_id`, `client_secret`, and the original `code_verifier` (PKCE
   check).
8. Salesforce validates all of it and returns the access token — directly to
   the server, never to the browser.
9. The server sets `req.session.authorized = true`, the popup closes, and the
   parent page redirects to the correct panel.

**Implementation:**

| Concern | Where |
|---|---|
| Entry point | `GET /canvas` in `server/index.js` (shared with User-Agent flow — see [Panel → Auth Flow Mapping](#panel--auth-flow-mapping) for how the split happens) |
| Sign-in page | `renderSignInPage()` in `server/auth/shared.js` |
| PKCE helpers | `generateCodeVerifier()` / `deriveCodeChallenge()` in `server/auth/webServerFlow.js` |
| Authorize route | `GET /oauth/web-server/authorize` in `server/auth/webServerFlow.js` |
| Callback / token exchange | `GET /oauth/web-server/callback` in `server/auth/webServerFlow.js` |
| Session handling | `req.session.codeVerifier` (temporary, between authorize and callback), `req.session.authorized`, `req.session.accessToken` (set after successful exchange) |
| Panel rendering | `buildCanvasRedirectUrl(parameters)`, called with parameters decoded from the OAuth `state` param (which carries the original `panel`/`company`/etc. through Salesforce's login redirect) |

## Authentication Method 3: OAuth User-Agent Flow

**How it works:**

1. Same starting point as Web Server flow: `GET /canvas`, sign-in screen,
   popup opens.
2. The popup is redirected to `/oauth/user-agent/authorize`, which sends
   Salesforce `response_type=token` instead of `code`. No PKCE, no
   `client_secret` involved at all.
3. User logs in and approves access.
4. Salesforce redirects the popup back to `/oauth/user-agent/callback`, but
   with the access token embedded in the **URL fragment**
   (`#access_token=...&token_type=Bearer`), not a query parameter. Fragments
   are never transmitted to any server by browsers — this is the mechanism
   that keeps the token out of server logs in this flow.
5. Since the server literally cannot see the fragment, a small client-side
   script on the callback page reads it directly out of
   `window.location.hash`.
6. That script sends the token to the parent sign-in page via
   `postMessage`, which forwards it to the server via
   `POST /oauth/user-agent/mark-authorized` — purely so the server can record
   the session as authorized (no further verification needed; Salesforce
   already validated the login).
7. The popup closes and the panel loads.

**Implementation:**

| Concern | Where |
|---|---|
| Entry point | `GET /canvas` in `server/index.js` (shared with Web Server flow) |
| Authorize route | `GET /oauth/user-agent/authorize` in `server/auth/userAgentFlow.js` |
| Fragment reader page | `GET /oauth/user-agent/callback` → `renderFragmentHandlerPage()` in `server/auth/userAgentFlow.js` (pure client-side JS, no server-side token handling) |
| Session-marking endpoint | `POST /oauth/user-agent/mark-authorized` in `server/auth/userAgentFlow.js` |
| Session handling | No `codeVerifier` needed (no PKCE). `req.session.authorized` and `req.session.accessToken` are set directly from the token the browser handed over |
| Panel rendering | Same `buildCanvasRedirectUrl(parameters)`, parameters decoded from `state` |

## Panel → Auth Flow Mapping

When the Canvas app's Access Method is set to **OAuth (Get)**, which of the
two OAuth flows runs is decided automatically per panel — not by the user —
via `flowForPanel()` in `server/auth/shared.js`:

| Panel | Configured Flow | Notes |
|---|---|---|
| Account | OAuth Web Server flow | |
| Opportunity | OAuth User-Agent flow | |
| Lead | OAuth Web Server flow (default) | No specific assignment made yet; falls back to Web Server |
| Portfolio Pulse | OAuth Web Server flow (default) | Same fallback |

The sign-in page shows a single "Sign in with Salesforce" button (no manual
choice) plus a small "Using: Web Server flow" / "Using: User-Agent flow" line
underneath, so which flow is running is still visible for verification
purposes.

When the Canvas app's Access Method is set to **Signed Request** instead,
none of the above applies — every panel (Account, Opportunity, Lead,
Portfolio Pulse) is authenticated identically via signature verification,
with no flow concept and no login screen at all. See
[Switching Between Flows](#switching-between-flows).

## File Map

```
server/
  index.js                  App setup, session middleware, mounts all three
                             auth methods, panel API routes (/api/*)
  canvasRedirect.js          buildCanvasRedirectUrl() / extractParameters() --
                             shared by all three auth methods
  verifySignedRequest.js     HMAC-SHA256 signature verification (Signed Request only)
  auth/
    shared.js                OAuth-shared: SF_LOGIN_URL/CLIENT_ID/CLIENT_SECRET,
                              state encode/decode, sign-in page, flowForPanel(),
                              callback result renderer
    signedRequest.js          Signed Request (POST) handler, mounted at /canvas
    webServerFlow.js           OAuth Web Server flow: PKCE, /oauth/web-server/*
    userAgentFlow.js            OAuth User-Agent flow: /oauth/user-agent/*
```

## Switching Between Flows

**Signed Request vs OAuth (Get):** this is a single setting on the Canvas
app / External Client App in Salesforce Setup — **Access Method**. Flipping
it takes effect immediately for all panels sharing that Canvas app; no code
change or redeploy is needed, since both `POST /canvas` and `GET /canvas`
handlers are already live simultaneously in this codebase. Note that since
Account, Opportunity, and Lead currently all share one Canvas app, flipping
this setting affects all three panels at once — there's no way to have some
panels on Signed Request and others on OAuth from the same Canvas app. Doing
that would require registering a second, separate Canvas app in Salesforce
and assigning it specifically to the panel(s) that should use the other
method.

**Web Server vs User-Agent (within OAuth):** controlled purely by
`flowForPanel()` in `server/auth/shared.js`. Edit the panel → flow mapping
there and redeploy to change which flow a given panel uses:

```js
function flowForPanel(panel) {
  if (panel === "opportunity") return "user-agent";
  return "web-server";
}
```

For manual testing regardless of panel, either flow's authorize URL can be
hit directly:

```
GET /oauth/web-server/authorize?state=<base64url-encoded-JSON>
GET /oauth/user-agent/authorize?state=<base64url-encoded-JSON>
```

## Environment Variables & Salesforce Configuration

### Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `SKIP_AUTH` | all three methods | `"true"` bypasses all authentication for local dev — `/canvas` immediately redirects to Portfolio Pulse (or whatever panel query params are given) without verifying anything |
| `CANVAS_CONSUMER_SECRET` | Signed Request | Consumer Secret used to verify the `signed_request` HMAC signature |
| `SF_LOGIN_URL` | both OAuth flows | The org's login host, e.g. `https://concretio81-dev-ed.develop.my.salesforce.com`. Must be the org's actual My Domain, not the generic `https://login.salesforce.com`, once My Domain is enabled |
| `SF_OAUTH_CLIENT_ID` | both OAuth flows | Consumer Key of the External Client App |
| `SF_OAUTH_CLIENT_SECRET` | Web Server flow only | Consumer Secret, used in the server-side token exchange. Not used at all by User-Agent flow |
| `SF_OAUTH_WEB_SERVER_REDIRECT_URI` | Web Server flow | Must exactly match a Callback URL registered on the External Client App, e.g. `https://<host>/oauth/web-server/callback` |
| `SF_OAUTH_USER_AGENT_REDIRECT_URI` | User-Agent flow | Must exactly match a Callback URL registered on the External Client App, e.g. `https://<host>/oauth/user-agent/callback` |
| `SESSION_SECRET` | both OAuth flows | Signs the session cookie (`express-session`). Any random string; not shared with Salesforce |
| `NODE_ENV` | both OAuth flows | Must be `"production"` on Heroku — controls the session cookie's `sameSite`/`secure` policy (`none`/`true` in production for the cross-site iframe case, `lax`/`false` locally over plain HTTP) |
| `DATABASE_URL` | panel data, not auth | Neon Postgres connection string |
| `PORT` | server | HTTP port (Heroku sets this automatically) |

### Salesforce Connected App / External Client App settings

- **Access Method**: Signed Request (POST) or OAuth (Get) — see
  [Switching Between Flows](#switching-between-flows)
- **Canvas App URL**: `https://<host>/canvas` (same URL regardless of Access
  Method — Salesforce just varies GET vs POST)
- **OAuth Settings → Enable OAuth**: required for either OAuth flow
- **OAuth Scopes**: `full` is used in this POC; a production build should
  narrow this to just `id` (or `id` + `api` if the app ever calls Salesforce
  APIs back)
- **Callback URL** (all four needed to support both flows, plus local
  testing):
  ```
  https://<host>/oauth/web-server/callback
  https://<host>/oauth/user-agent/callback
  http://localhost:3000/oauth/web-server/callback
  http://localhost:3000/oauth/user-agent/callback
  ```
- **PKCE**: this org enforces `code_challenge` on the authorize request for
  the Web Server flow — already handled in code, no additional Salesforce
  setting needed beyond OAuth being enabled

### Heroku-specific requirement

`app.set("trust proxy", 1)` in `server/index.js` is required — Heroku
terminates TLS at its router and forwards plain HTTP to the dyno. Without
this, Express never believes the connection is secure, so the `secure: true`
session cookie is silently never set at all, breaking the OAuth flows in
production (a real bug hit and fixed during this POC).

## Testing Guide

### Testing Signed Request

1. In Salesforce, set the Canvas app's Access Method to **Signed Request
   (POST)**.
2. Ensure `CANVAS_CONSUMER_SECRET` matches the app's Consumer Secret.
3. Open any Account/Opportunity/Lead record with the Explori Canvas tab —
   the panel should load immediately with no login screen at all.
4. To test locally without a live org: set `SKIP_AUTH=true` and either POST
   directly to `/canvas` (any body) or use the dev convenience described in
   `server/auth/signedRequest.js` — it returns the Portfolio Pulse panel
   context automatically.

**Expected behavior:** instant panel load, no visible authentication step.

### Testing OAuth Web Server Flow

1. In Salesforce, set Access Method to **OAuth (Get)**.
2. Ensure the Callback URL list includes
   `.../oauth/web-server/callback` (both prod and localhost as needed).
3. Ensure `SF_LOGIN_URL`, `SF_OAUTH_CLIENT_ID`, `SF_OAUTH_CLIENT_SECRET`,
   `SF_OAUTH_WEB_SERVER_REDIRECT_URI` are all set correctly.
4. Open an **Account** record (or any panel, if you've changed
   `flowForPanel()`), with `SKIP_AUTH=false`.
5. Click "Sign in with Salesforce" — the popup should show "Using: Web
   Server flow".
6. Log in and approve access in the popup.
7. Popup should auto-close on success; the panel should load with real data.

**To verify it's actually Web Server flow running:** check the popup's
address bar right before it closes — it should show `?code=...` (a query
string), not a `#...` fragment. Or tail `heroku logs --tail` and confirm
`GET /oauth/web-server/callback?code=...` is logged with the code visible.

### Testing OAuth User-Agent Flow

1. Same Salesforce Access Method (**OAuth Get**) as Web Server flow — both
   flows run under this same setting.
2. Ensure the Callback URL list includes `.../oauth/user-agent/callback`.
3. Ensure `SF_OAUTH_USER_AGENT_REDIRECT_URI` is set (no `client_secret`
   needed for this flow).
4. Open an **Opportunity** record (or any panel currently mapped to
   User-Agent flow).
5. Click "Sign in with Salesforce" — should show "Using: User-Agent flow".
6. Log in and approve access.

**To verify it's actually User-Agent flow running:** the popup's address
bar should briefly show a `#access_token=...` fragment before closing. In
Heroku logs, `GET /oauth/user-agent/callback` should appear with **no query
string at all** (the token is in the fragment, invisible to the server) —
that's the definitive signal, since the fragment case is exactly what makes
that log line bare.

### Salesforce configuration changes required per flow

| Flow | Access Method | Callback URL needed | Client Secret needed |
|---|---|---|---|
| Signed Request | Signed Request (POST) | N/A | Yes (`CANVAS_CONSUMER_SECRET`) |
| OAuth Web Server | OAuth (Get) | `.../oauth/web-server/callback` | Yes (`SF_OAUTH_CLIENT_SECRET`) |
| OAuth User-Agent | OAuth (Get) | `.../oauth/user-agent/callback` | No |

### Expected behavior on successful authentication (all flows)

- The correct panel (Account / Opportunity / Lead / Portfolio Pulse) renders
  with **live data from the Neon database**, not fixture/mock data
  (fixture data is only used in the non-iframe wireframe harness UI, not in
  Canvas mode)
- Subsequent loads within the session (OAuth flows only) skip the sign-in
  screen entirely, since `req.session.authorized` is already `true`
- No errors in browser console or Heroku logs

### Common issues and troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Invalid signed_request` (401) | Consumer Secret mismatch, or `signed_request` field missing | Compare `CANVAS_CONSUMER_SECRET` against Salesforce's actual Consumer Secret; confirm Access Method is really Signed Request |
| Panels always default to Portfolio Pulse | Real Salesforce nests parameters under `context.environment.parameters`, not the top-level shape our mock uses | Already handled by `extractParameters()` supporting both shapes — if this recurs, check for a new payload shape |
| `error=invalid_client_id` | `SF_LOGIN_URL` pointed at generic `login.salesforce.com` instead of the org's My Domain | Use the org's actual domain, e.g. `https://concretio81-dev-ed.develop.my.salesforce.com` |
| `error=invalid_request&error_description=missing required code_challenge` | PKCE not being sent (Web Server flow only) | Confirm `code_challenge`/`code_challenge_method=S256` are present on the authorize request — already implemented in `webServerFlow.js` |
| `error=redirect_uri_mismatch` | The `redirect_uri` sent doesn't exactly match a registered Callback URL (trailing slash, http vs https, wrong path) | Diff the exact string against the Callback URL list in Salesforce, character for character |
| `invalid_grant: invalid code verifier` (local dev) | nodemon restarted mid-flow (common if the project folder is inside OneDrive, whose background sync can trigger the file watcher), wiping the in-memory session holding `code_verifier` | Run `node server/index.js` directly (no nodemon) while testing OAuth locally |
| `invalid_grant: invalid code verifier` (Heroku/production) | Express doesn't trust Heroku's proxy, so it never believes the connection is HTTPS, so the `secure: true` session cookie is never actually set | Ensure `app.set("trust proxy", 1)` is present in `server/index.js` |
| Sign-in popup shows nothing and closes immediately with no visible error | Likely reached `/oauth/*/callback` with `status: "error"` — the error detail is shown in the popup rather than auto-closing (see `renderCallbackResult()`) | Read the `detail` text shown in the popup, or check Heroku logs for `[oauth:web-server]`/`[oauth]` error lines |
| Session doesn't persist between requests / repeated sign-in prompts | Session cookie policy issue, or testing across a session-cookie-clearing action | Clear cookies for the app's domain to force a fresh unauthenticated test, or restart the Heroku dyno to wipe the in-memory session store entirely (`heroku restart -a explori`) |

## Comparison Summary

| | Signed Request | OAuth Web Server Flow | OAuth User-Agent Flow |
|---|---|---|---|
| User sees a login screen | No | Yes | Yes |
| Request method Salesforce uses | POST | GET, then popup-based OAuth | GET, then popup-based OAuth |
| `response_type` requested | N/A | `code` | `token` |
| PKCE | N/A | Yes | No |
| Uses Consumer/Client Secret | Yes (signature verification) | Yes (server-side token exchange) | No |
| Where the real credential first appears | Verified in-request; not a standalone bearer token | Server only — never reaches the browser | Browser — in the URL fragment and JS memory, before being forwarded to the server |
| How the result reaches our server | Directly, in the POST body | Authorization code, as a visible query param (`?code=...`) | Not directly — token lives in the fragment (`#access_token=...`), server never sees the callback request's fragment at all |
| Session/state used | None — stateless, re-verified per request | `express-session`: `codeVerifier` (temporary), `authorized`, `accessToken` | `express-session`: `authorized`, `accessToken` (no `codeVerifier`) |
| Relative security | Secure by shared-secret model; no user consent step, no token concept | Highest — token never exposed to the browser | Lower — token briefly exposed in browser memory/URL |
| Intended use case (per Salesforce) | Canvas's default, simplest integration | Apps with a secure backend server | Apps with no backend (desktop, mobile, pure client-side) |
| Currently configured for | (switchable per showcase — see [Switching Between Flows](#switching-between-flows)) | Account | Opportunity |

---

*This documentation reflects the state of the `auhentication-flow` branch. All
three methods were implemented as a POC and verified end-to-end against a
real Salesforce Developer Edition org and the deployed Heroku app
(`explori-3c837791e533.herokuapp.com`).*
