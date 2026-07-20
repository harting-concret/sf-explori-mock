// Legacy Salesforce Canvas authentication method (Signed Request / POST
// access method). Salesforce POSTs a signed_request field on every load;
// we verify its HMAC signature against our Consumer Secret and, if valid,
// trust the payload completely -- no login screen, no OAuth token, no
// popup. Kept in place (untouched) while the OAuth flows are being tested
// -- the Canvas app's Access Method setting decides which one Salesforce
// actually calls, so this stays dormant once that's flipped to OAuth (Get).
const express = require("express");
const { verifySignedRequest } = require("../verifySignedRequest");
const { buildCanvasRedirectUrl, extractParameters } = require("../canvasRedirect");

const router = express.Router();

// Mounted at POST /canvas
router.post("/", (req, res) => {
  let context;

  // for the testing purpose only... skip authentication
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
  console.log("[canvas:signed-request] extracted parameters:", parameters);
  const redirectUrl = buildCanvasRedirectUrl(parameters);
  console.log("[canvas:signed-request] redirecting to:", redirectUrl);
  res.redirect(redirectUrl);
});

module.exports = router;
