require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const { buildCanvasRedirectUrl } = require("./canvasRedirect");
const { renderSignInPage } = require("./auth/shared");
const webServerFlow = require("./auth/webServerFlow");
const userAgentFlow = require("./auth/userAgentFlow");
const signedRequestFlow = require("./auth/signedRequest");
const db = require("./db");

const app = express();

// Heroku terminates TLS at its router and forwards plain HTTP to the dyno
// (requests here always look like http, see tls=false in Heroku logs).
// Without this, Express doesn't trust the X-Forwarded-Proto header, so
// req.secure is always false -- which means express-session silently
// refuses to set our `secure: true` session cookie at all, breaking the
// OAuth code_verifier round trip in production.
app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// POC: session used only to remember "this browser completed the Salesforce
// OAuth popup" for the /oauth flows below. MemoryStore is fine for a POC;
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

// POC: Canvas OAuth (Get) access method. Salesforce loads this URL with a
// plain GET, carrying the custom parameters (panel/exhibitor/event/company)
// as query params instead of a signed_request. Until the browser has
// completed one of the two OAuth flows below, we can't trust the request
// at all, so we serve a sign-in page instead of any panel data.
app.get("/canvas", (req, res) => {
  if (process.env.SKIP_AUTH === "true" || req.session.authorized) {
    return res.redirect(buildCanvasRedirectUrl(req.query));
  }
  res.send(renderSignInPage(req.query));
});

// Each flow's routes (authorize/callback, plus user-agent's extra
// mark-authorized step) live in their own file under server/auth/ -- see
// those files for the code-level difference between the two flows.
app.use("/oauth/web-server", webServerFlow);
app.use("/oauth/user-agent", userAgentFlow);

// Legacy signed_request (POST) authentication -- see server/auth/signedRequest.js
// for the code-level detail. Kept in place while the OAuth flows above are
// being tested; the Canvas app's Access Method setting decides which one
// Salesforce actually calls, so this stays dormant once that's flipped to
// OAuth (Get).
app.use("/canvas", signedRequestFlow);

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
