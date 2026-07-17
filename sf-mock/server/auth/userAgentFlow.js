// OAuth User-Agent flow (implicit grant, no backend secret required).
//
// Salesforce hands the real access token back directly in the redirect's
// URL fragment (#access_token=...), which browsers never transmit to any
// server. So there's no code to exchange and no Client Secret involved --
// client-side JS reads the fragment and forwards the token to our server
// purely so we can record the session as authorized (bookkeeping only,
// Salesforce already validated the login).
const express = require("express");
const { SF_LOGIN_URL, SF_OAUTH_CLIENT_ID, decodeState, buildCanvasRedirectUrl } = require("./shared");

const router = express.Router();

// Must exactly match a Callback URL registered on the External Client App.
function redirectUri(req) {
  return (
    process.env.SF_OAUTH_USER_AGENT_REDIRECT_URI ||
    `${req.protocol}://${req.get("host")}/oauth/user-agent/callback`
  );
}

function renderFragmentHandlerPage() {
  return `<!DOCTYPE html>
<html><body style="font-family: monospace; padding: 1rem; word-break: break-all;">
<p id="status">Completing sign-in...</p>
<script>
  var params = new URLSearchParams(window.location.hash.slice(1));
  var accessToken = params.get("access_token");
  var state = params.get("state");
  var error = params.get("error");

  if (window.opener) {
    window.opener.postMessage(
      {
        source: "explori-oauth",
        status: accessToken ? "success" : "error",
        accessToken: accessToken,
        state: state,
      },
      "*"
    );
  }

  if (accessToken) {
    window.close();
  } else {
    document.getElementById("status").textContent =
      "error: " + (error || "no access_token in redirect fragment");
  }
</script>
</body></html>`;
}

// Mounted at /oauth/user-agent/authorize
router.get("/authorize", (req, res) => {
  const authorizeUrl = new URL(`${SF_LOGIN_URL}/services/oauth2/authorize`);
  authorizeUrl.searchParams.set("response_type", "token");
  authorizeUrl.searchParams.set("client_id", SF_OAUTH_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri(req));
  authorizeUrl.searchParams.set("state", req.query.state || "");
  res.redirect(authorizeUrl.toString());
});

// Mounted at /oauth/user-agent/callback -- always hit with an empty query
// string (the token is in the fragment, invisible to the server), so this
// just serves the client-side fragment reader.
router.get("/callback", (req, res) => {
  res.send(renderFragmentHandlerPage());
});

// Mounted at /oauth/user-agent/mark-authorized
router.post("/mark-authorized", (req, res) => {
  const { accessToken, state } = req.body || {};
  if (!accessToken) {
    return res.status(400).json({ error: "missing accessToken" });
  }

  req.session.authorized = true;
  req.session.accessToken = accessToken;

  const parameters = state ? decodeState(state) : {};
  req.session.save(() => res.json({ redirectUrl: buildCanvasRedirectUrl(parameters) }));
});

module.exports = router;
