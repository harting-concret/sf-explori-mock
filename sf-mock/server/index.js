require("dotenv").config();

const path = require("path");
const express = require("express");
const { verifySignedRequest } = require("./verifySignedRequest");
const db = require("./db");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Builds the SPA redirect for Canvas iframe mode from the custom parameters
// set via Apex (panel, exhibitor, event, company). Defaults to the
// Portfolio Pulse panel when no panel parameter is provided.
function buildCanvasRedirectUrl(parameters = {}) {
  const panel = parameters.panel || "portfolio-pulse";
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

    // TEMP DIAGNOSTIC LOGGING — remove once the Invalid signed_request issue
    // from real Salesforce traffic is root-caused. Confirms whether Salesforce
    // is sending base64url (-, _, no padding) vs standard base64 (+, /, =).
    console.log("[canvas] raw signed_request:", signedRequest);
    if (signedRequest) {
      const [sigPart, payloadPart] = signedRequest.split(".");
      console.log("[canvas] signature part:", sigPart);
      console.log("[canvas] payload part (first 100 chars):", payloadPart?.slice(0, 100));
      console.log(
        "[canvas] looks like base64url (has - or _ or missing padding):",
        /[-_]/.test(signedRequest) || !signedRequest.includes("=")
      );
    }

    if (!signedRequest) {
      return res.status(401).send("Missing signed_request");
    }
    context = verifySignedRequest(signedRequest, process.env.CANVAS_CONSUMER_SECRET);
    if (!context) {
      console.log("[canvas] verifySignedRequest returned null — signature mismatch or decode/parse failure");
      return res.status(401).send("Invalid signed_request");
    }
    console.log("[canvas] signed_request verified successfully");
  }

  req.canvasContext = context;

  const parameters = context?.environment?.parameters || {};
  res.redirect(buildCanvasRedirectUrl(parameters));
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
