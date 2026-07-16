require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const { verifySignedRequest } = require("./verifySignedRequest");
const db = require("./db");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// POC: session used only to remember "this browser completed the Salesforce
// OAuth popup" for the /oauth flow below. MemoryStore is fine for a POC;
// swap for a real store (Redis, etc.) before this carries production load.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "explori-oauth-poc-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // SameSite=None is only valid (browsers keep it) when paired with
      // Secure, which requires HTTPS -- true for the real Salesforce iframe
      // case (Heroku), not for local http://localhost testing.
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 60 * 1000,
    },
  })
);

// Real Salesforce signed_request payloads nest custom parameters under
// context.environment.parameters. Our own mock context (SKIP_AUTH=true,
// and the local test generator script) uses a simpler top-level shape
// (environment.parameters) since it doesn't replicate the full Salesforce
// payload. Support both so real org traffic and local test fixtures work.
function extractParameters(context) {
  return (
    context?.context?.environment?.parameters ||
    context?.environment?.parameters ||
    {}
  );
}

// Builds the SPA redirect for Canvas iframe mode from the custom parameters
// set via Apex (panel, exhibitor, event, company). Defaults to the
// Portfolio Pulse panel when no panel parameter is provided.
//
// EXPERIMENT: Lead-known panel uses a path-based URL (/lead/:company)
// instead of the query-param scheme, to test whether URL-based routing
// reads/logs better than query params before deciding to migrate the
// other panel types too. Account/Opportunity/Portfolio Pulse are
// untouched and still use the query-param scheme.
function buildCanvasRedirectUrl(parameters = {}) {
  const panel = parameters.panel || "portfolio-pulse";

  if (panel === "lead-known" && parameters.company) {
    return `/lead/${encodeURIComponent(parameters.company)}`;
  }

  const params = new URLSearchParams({ mode: "iframe", panel });
  if (parameters.exhibitor) params.set("exhibitor", parameters.exhibitor);
  if (parameters.event) params.set("event", parameters.event);
  if (parameters.company) params.set("company", parameters.company);
  return `/?${params.toString()}`;
}

// POC: Canvas OAuth (Get) access method. Salesforce loads this URL with a
// plain GET, carrying the custom parameters (panel/exhibitor/event/company)
// as query params instead of a signed_request. Until the browser has
// completed the OAuth popup handshake, we can't trust the request at all,
// so we serve a sign-in page instead of any panel data.
const SF_LOGIN_URL = (process.env.SF_LOGIN_URL || "https://login.salesforce.com").replace(/\/+$/, "");
const SF_OAUTH_CLIENT_ID = process.env.SF_OAUTH_CLIENT_ID;
const SF_OAUTH_CLIENT_SECRET = process.env.SF_OAUTH_CLIENT_SECRET;

// PKCE: this org's External Client App requires a code_challenge on the
// authorize request (rejects with "missing required code_challenge"
// otherwise). code_verifier is stashed in the session between the
// /oauth/authorize redirect and the /oauth/callback token exchange --
// the popup and the parent page share the same session cookie since
// they're the same browser on the same origin.
const crypto = require("crypto");

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

function deriveCodeChallenge(verifier) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// Must exactly match a Callback URL registered on the Connected App.
// Explicit via env rather than derived from req.protocol/req.get("host") --
// when testing through the Vite dev proxy (5173 -> 3000), the Host header
// Express sees isn't reliably the one Salesforce needs to redirect back to.
function oauthRedirectUri(req) {
  return (
    process.env.SF_OAUTH_REDIRECT_URI ||
    `${req.protocol}://${req.get("host")}/oauth/callback`
  );
}

// The original panel/company/etc. params have to survive the round trip
// through Salesforce's login popup, so we carry them in `state`.
function encodeState(parameters) {
  return Buffer.from(JSON.stringify(parameters)).toString("base64url");
}

function decodeState(state) {
  try {
    return JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

function renderSignInPage(parameters) {
  const state = encodeState(parameters);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Sign in to Explori</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center;
    justify-content: center; height: 100vh; margin: 0; background: #f4f6f9; }
  .card { text-align: center; padding: 2rem; max-width: 320px; }
  button { padding: 0.7rem 1.4rem; font-size: 0.95rem; background: #0b5cab; color: #fff;
    border: none; border-radius: 6px; cursor: pointer; }
  button:hover { background: #094a8a; }
  .error { color: #b00020; margin-top: 1rem; display: none; font-size: 0.9rem; }
</style>
</head>
<body>
  <div class="card">
    <p>Sign in with Salesforce to view Explori Intelligence.</p>
    <button id="signin">Sign in with Salesforce</button>
    <p class="error" id="error">Sign-in failed or was cancelled. Please try again.</p>
  </div>
  <script>
    var state = ${JSON.stringify(state)};
    document.getElementById("signin").addEventListener("click", function () {
      document.getElementById("error").style.display = "none";
      window.open(
        "/oauth/authorize?state=" + encodeURIComponent(state),
        "explori-oauth",
        "width=500,height=650"
      );
    });
    window.addEventListener("message", function (event) {
      if (!event.data || event.data.source !== "explori-oauth") return;
      if (event.data.status === "success") {
        window.location.href = event.data.redirectUrl;
      } else {
        document.getElementById("error").style.display = "block";
      }
    });
  </script>
</body>
</html>`;
}

// DEBUG (temporary, POC troubleshooting): shows the raw status/detail instead
// of auto-closing immediately, so failures are visible in the popup itself
// rather than only inferred from Heroku logs. Revert to auto-close once the
// flow is confirmed working end to end.
function renderCallbackResult(status, redirectUrl, detail) {
  return `<!DOCTYPE html>
<html><body style="font-family: monospace; padding: 1rem; word-break: break-all;">
<p>status: ${JSON.stringify(status)}</p>
<p>detail: ${JSON.stringify(detail || "(none)")}</p>
<button id="closebtn">Close</button>
<script>
  if (window.opener) {
    window.opener.postMessage(
      { source: "explori-oauth", status: ${JSON.stringify(status)}, redirectUrl: ${JSON.stringify(redirectUrl || "")} },
      "*"
    );
  }
  document.getElementById("closebtn").addEventListener("click", function () {
    window.close();
  });
</script>
</body></html>`;
}

// Real Canvas entry point under the OAuth access method.
app.get("/canvas", (req, res) => {
  if (process.env.SKIP_AUTH === "true" || req.session.authorized) {
    return res.redirect(buildCanvasRedirectUrl(req.query));
  }
  res.send(renderSignInPage(req.query));
});

app.get("/oauth/authorize", (req, res) => {
  const codeVerifier = generateCodeVerifier();
  req.session.codeVerifier = codeVerifier;

  const authorizeUrl = new URL(`${SF_LOGIN_URL}/services/oauth2/authorize`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", SF_OAUTH_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", oauthRedirectUri(req));
  authorizeUrl.searchParams.set("state", req.query.state || "");
  authorizeUrl.searchParams.set("code_challenge", deriveCodeChallenge(codeVerifier));
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  // req.session.codeVerifier must be persisted before the redirect fires.
  req.session.save(() => res.redirect(authorizeUrl.toString()));
});

app.get("/oauth/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const parameters = state ? decodeState(state) : {};

  if (error || !code) {
    const detail = `authorize denied/missing code: ${error || req.query.error_description || "no code param"}`;
    console.error("[oauth]", detail);
    return res.send(renderCallbackResult("error", null, detail));
  }

  try {
    const tokenRes = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: SF_OAUTH_CLIENT_ID,
        client_secret: SF_OAUTH_CLIENT_SECRET,
        redirect_uri: oauthRedirectUri(req),
        code_verifier: req.session.codeVerifier || "",
      }),
    });

    if (!tokenRes.ok) {
      const bodyText = await tokenRes.text();
      console.error("[oauth] token exchange failed:", bodyText);
      return res.send(renderCallbackResult("error", null, `token exchange failed: ${bodyText}`));
    }

    const token = await tokenRes.json();
    req.session.authorized = true;
    req.session.accessToken = token.access_token;

    res.send(renderCallbackResult("success", buildCanvasRedirectUrl(parameters)));
  } catch (err) {
    console.error("[oauth] callback error:", err);
    res.send(renderCallbackResult("error", null, `callback error: ${err.message}`));
  }
});

// Legacy Salesforce Canvas posts here on load with a signed_request form field.
// Verify it, then hand off to the SPA with enough context in the URL to
// render the right Explori panel in iframe mode.
//
// Kept in place (untouched) while the OAuth flow above is being tested --
// the Canvas app's Access Method setting decides which one Salesforce
// actually calls, so this stays dormant once that's flipped to OAuth (Get).
app.post("/canvas", (req, res) => {
  let context;

  if (process.env.SKIP_AUTH === "true") {
    context = {
      environment: {
        parameters: { panel: "portfolio-pulse" },
        record: { Id: "001000000000000", Name: "Mock Account" },
      },
      client: { instanceId: "mock" },
    };
  } else {
    const signedRequest = req.body.signed_request;

    if (!signedRequest) {
      return res.status(401).send("Missing signed_request");
    }
    context = verifySignedRequest(signedRequest, process.env.CANVAS_CONSUMER_SECRET);
    if (!context) {
      return res.status(401).send("Invalid signed_request");
    }
  }

  req.canvasContext = context;

  const parameters = extractParameters(context);
  console.log("[canvas] extracted parameters:", parameters);
  const redirectUrl = buildCanvasRedirectUrl(parameters);
  console.log("[canvas] redirecting to:", redirectUrl);
  res.redirect(redirectUrl);
});

app.get("/api/portfolio-pulse", async (req, res) => {
  try {
    const data = await db.getPortfolioPulse();
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/account", async (req, res) => {
  try {
    const { exhibitor, event } = req.query;
    const data = await db.getAccountPanel(exhibitor, event);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/opportunity", async (req, res) => {
  try {
    const { exhibitor, event } = req.query;
    const data = await db.getOpportunityPanel(exhibitor, event);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/lead-known", async (req, res) => {
  try {
    const { company } = req.query;
    const data = await db.getLeadKnownPanel(company);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(distPath, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
