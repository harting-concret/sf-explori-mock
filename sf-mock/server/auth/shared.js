// Things both OAuth flows (web server + user agent) need in common: the
// org's login host / this app's OAuth client identity, the state encoding
// used to carry panel/company/etc. params through Salesforce's login popup,
// the sign-in page itself, and the shared success/error callback renderer.
const { buildCanvasRedirectUrl } = require("../canvasRedirect");

const SF_LOGIN_URL = (process.env.SF_LOGIN_URL || "https://login.salesforce.com").replace(/\/+$/, "");
const SF_OAUTH_CLIENT_ID = process.env.SF_OAUTH_CLIENT_ID;
const SF_OAUTH_CLIENT_SECRET = process.env.SF_OAUTH_CLIENT_SECRET;

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
    <button id="signin-webserver">Sign in (Web Server flow)</button>
    <div style="height: 0.5rem;"></div>
    <button id="signin-useragent">Sign in (User-Agent flow)</button>
    <p class="error" id="error">Sign-in failed or was cancelled. Please try again.</p>
  </div>
  <script>
    var state = ${JSON.stringify(state)};
    function openPopup(authorizeUrl) {
      document.getElementById("error").style.display = "none";
      window.open(authorizeUrl, "explori-oauth", "width=500,height=650");
    }
    document.getElementById("signin-webserver").addEventListener("click", function () {
      openPopup("/oauth/web-server/authorize?state=" + encodeURIComponent(state));
    });
    document.getElementById("signin-useragent").addEventListener("click", function () {
      openPopup("/oauth/user-agent/authorize?state=" + encodeURIComponent(state));
    });
    window.addEventListener("message", function (event) {
      if (!event.data || event.data.source !== "explori-oauth") return;

      if (event.data.status !== "success") {
        document.getElementById("error").style.display = "block";
        return;
      }

      if (event.data.accessToken) {
        // User-Agent flow: the token only ever existed in the popup's URL
        // fragment, which the server never saw. Hand it to the server now
        // so it can mark this session authorized the same way the Web
        // Server flow does after its own token exchange.
        fetch("/oauth/user-agent/mark-authorized", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: event.data.accessToken, state: event.data.state }),
        })
          .then(function (res) { return res.json(); })
          .then(function (body) { window.location.href = body.redirectUrl; })
          .catch(function () {
            document.getElementById("error").style.display = "block";
          });
      } else {
        window.location.href = event.data.redirectUrl;
      }
    });
  </script>
</body>
</html>`;
}

// Success closes the popup immediately (real intended UX). Errors stay
// visible with the raw detail instead of auto-closing -- still POC/testing
// phase across panel types, and this saves another round of log-tailing
// if a different panel/org config hits a new failure mode.
function renderCallbackResult(status, redirectUrl, detail) {
  if (status === "success") {
    return `<!DOCTYPE html>
<html><body>
<script>
  if (window.opener) {
    window.opener.postMessage(
      { source: "explori-oauth", status: "success", redirectUrl: ${JSON.stringify(redirectUrl || "")} },
      "*"
    );
  }
  window.close();
</script>
</body></html>`;
  }

  return `<!DOCTYPE html>
<html><body style="font-family: monospace; padding: 1rem; word-break: break-all;">
<p>status: "error"</p>
<p>detail: ${JSON.stringify(detail || "(none)")}</p>
<button id="closebtn">Close</button>
<script>
  if (window.opener) {
    window.opener.postMessage(
      { source: "explori-oauth", status: "error", redirectUrl: "" },
      "*"
    );
  }
  document.getElementById("closebtn").addEventListener("click", function () {
    window.close();
  });
</script>
</body></html>`;
}

module.exports = {
  SF_LOGIN_URL,
  SF_OAUTH_CLIENT_ID,
  SF_OAUTH_CLIENT_SECRET,
  encodeState,
  decodeState,
  renderSignInPage,
  renderCallbackResult,
  buildCanvasRedirectUrl,
};
