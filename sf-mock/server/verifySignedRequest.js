const crypto = require("crypto");

// Verifies a Salesforce Canvas signed_request: "<base64 sig>.<base64 payload>".
// Returns the parsed payload object, or null if the signature doesn't match
// or the request is malformed.
function verifySignedRequest(signedRequest, consumerSecret) {
  try {
    const [encodedSig, encodedPayload] = signedRequest.split(".");
    if (!encodedSig || !encodedPayload) return null;

    const expectedSig = crypto
      .createHmac("sha256", consumerSecret)
      .update(encodedPayload)
      .digest("base64");

    const sigBuffer = Buffer.from(encodedSig);
    const expectedBuffer = Buffer.from(expectedSig);

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    return JSON.parse(Buffer.from(encodedPayload, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

module.exports = { verifySignedRequest };
