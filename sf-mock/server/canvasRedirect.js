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

module.exports = { buildCanvasRedirectUrl, extractParameters };
