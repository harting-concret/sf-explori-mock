require("dotenv").config();

const path = require("path");
const express = require("express");
const { verifySignedRequest } = require("./verifySignedRequest");
const db = require("./db");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Salesforce Canvas posts here on load with a signed_request form field.
// Verify it, then hand off to the SPA with enough context in the URL to
// render the right Explori panel in iframe mode.
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

// Dev-only convenience: hit /canvas directly with query params instead of
// POSTing a signed_request, e.g.
// GET /canvas?panel=account&exhibitor=Siemens%20AG&event=London%20Build%202025
if (process.env.SKIP_AUTH === "true") {
  app.get("/canvas", (req, res) => {
    res.redirect(buildCanvasRedirectUrl(req.query));
  });
}

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
