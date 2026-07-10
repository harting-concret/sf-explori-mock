require("dotenv").config();

const path = require("path");
const express = require("express");
const { verifySignedRequest } = require("./verifySignedRequest");
const db = require("./db");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Salesforce Canvas posts here on load with a signed_request form field.
// Verify it, then hand off to the SPA with enough context in the URL to
// pick the right scene.
app.post("/canvas", (req, res) => {
  let context;

  if (process.env.SKIP_AUTH === "true") {
    context = {
      environment: {
        parameters: { sceneId: "sam-account" },
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

  const sceneId = context?.environment?.parameters?.sceneId || "sam-account";
  const params = new URLSearchParams({ scene: sceneId });

  const record = context?.environment?.record;
  if (record?.Id) params.set("recordId", record.Id);
  if (record?.Name) params.set("recordName", record.Name);

  res.redirect(`/?${params.toString()}`);
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
