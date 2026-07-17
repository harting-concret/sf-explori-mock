// OAuth Web Server flow (authorization code grant + PKCE).
//
// Salesforce hands back a one-time authorization code as a visible URL
// query param; we exchange it for the real access token in a private,
// server-to-server call using our Client Secret. The token never enters
// the browser at any point -- only the (otherwise useless) code does.
const express = require("express");
const crypto = require("crypto");
const {
  SF_LOGIN_URL,
  SF_OAUTH_CLIENT_ID,
  SF_OAUTH_CLIENT_SECRET,
  decodeState,
  renderCallbackResult,
  buildCanvasRedirectUrl,
} = require("./shared");

const router = express.Router();

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

function deriveCodeChallenge(verifier) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// Must exactly match a Callback URL registered on the External Client App.
// Explicit via env rather than derived from req.protocol/req.get("host") --
// behind Heroku's proxy / the Vite dev proxy, the Host header Express sees
// isn't reliably the one Salesforce needs to redirect back to.
function redirectUri(req) {
  return (
    process.env.SF_OAUTH_WEB_SERVER_REDIRECT_URI ||
    `${req.protocol}://${req.get("host")}/oauth/web-server/callback`
  );
}

// Mounted at /oauth/web-server/authorize
router.get("/authorize", (req, res) => {
  const codeVerifier = generateCodeVerifier();
  req.session.codeVerifier = codeVerifier;

  const authorizeUrl = new URL(`${SF_LOGIN_URL}/services/oauth2/authorize`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", SF_OAUTH_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri(req));
  authorizeUrl.searchParams.set("state", req.query.state || "");
  authorizeUrl.searchParams.set("code_challenge", deriveCodeChallenge(codeVerifier));
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  // req.session.codeVerifier must be persisted before the redirect fires.
  req.session.save(() => res.redirect(authorizeUrl.toString()));
});

// Mounted at /oauth/web-server/callback
router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const parameters = state ? decodeState(state) : {};

  if (error || !code) {
    const detail = `authorize denied/missing code: ${error || req.query.error_description || "no code param"}`;
    console.error("[oauth:web-server]", detail);
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
        redirect_uri: redirectUri(req),
        code_verifier: req.session.codeVerifier || "",
      }),
    });

    if (!tokenRes.ok) {
      const bodyText = await tokenRes.text();
      console.error("[oauth:web-server] token exchange failed:", bodyText);
      return res.send(renderCallbackResult("error", null, `token exchange failed: ${bodyText}`));
    }

    const token = await tokenRes.json();
    req.session.authorized = true;
    req.session.accessToken = token.access_token;

    res.send(renderCallbackResult("success", buildCanvasRedirectUrl(parameters)));
  } catch (err) {
    console.error("[oauth:web-server] callback error:", err);
    res.send(renderCallbackResult("error", null, `callback error: ${err.message}`));
  }
});

module.exports = router;
