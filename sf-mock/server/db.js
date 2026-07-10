const { neon } = require("@neondatabase/serverless");

// Lazy-init so the connection string is only required once a query actually runs.
let sql;
function getDb() {
  if (!sql) sql = neon(process.env.DATABASE_URL);
  return sql;
}

// Actual schema:
//   portfolio_pulse(id, as_of, total, actions jsonb)
//   portfolio_pulse_rows(id, pulse_id, event_id, risk, at_risk, flagged, note, sort_order)
//   exhibitors(id, name, industry, sector)
//   events(id, name, year, risk, at_risk, flagged, note)
//   scores(id, exhibitor_id, event_id, nps, satisfaction, risk, benchmark_diff, benchmark_note)
//   nps_trend(id, exhibitor_id, event_id, year, value)
//   ai_summaries(id, exhibitor_id, event_id, tone, text)
//   recommendations(id, exhibitor_id, event_id, text)
//   opportunities(id, exhibitor_id, event_id, renewal_value, said_about_show,
//                  sector_avg_note, recommendation)
//   lead_intel(id, company, match_confidence, last_show, nps_line,
//              said_at_show jsonb, opening_angle)

// Summarizes a year/value trend into a short note, since nps_trend no longer
// carries a precomputed trend_note column.
function deriveTrendNote(trendRows) {
  if (trendRows.length < 2) return "";
  const first = trendRows[0].value;
  const last = trendRows[trendRows.length - 1].value;
  const span = trendRows.length - 1;
  const years = `${span} year${span === 1 ? "" : "s"}`;
  if (last < first) return `Declining ${years}: down from ${first} to ${last}`;
  if (last > first) return `Improving ${years}: up from ${first} to ${last}`;
  return `Stable over ${trendRows.length} years`;
}

async function getPortfolioPulse() {
  const db = getDb();

  const [pulse] = await db`
    SELECT id, as_of, total, actions
    FROM portfolio_pulse
    ORDER BY as_of DESC
    LIMIT 1
  `;
  if (!pulse) return null;

  const rows = await db`
    SELECT e.name AS event, r.risk, r.at_risk, r.flagged, r.note
    FROM portfolio_pulse_rows r
    JOIN events e ON e.id = r.event_id
    WHERE r.pulse_id = ${pulse.id}
    ORDER BY r.sort_order ASC
  `;

  return {
    kind: "portfolio-pulse",
    asOf: pulse.as_of,
    rows: rows.map((r) => ({
      event: r.event,
      risk: r.risk,
      atRisk: r.at_risk,
      flagged: r.flagged,
      note: r.note,
    })),
    total: pulse.total,
    actions: pulse.actions ?? undefined,
  };
}

async function getAccountPanel(exhibitorName, eventName) {
  const db = getDb();

  const [exhibitor] = await db`
    SELECT id, name FROM exhibitors WHERE name = ${exhibitorName} LIMIT 1
  `;
  if (!exhibitor) return null;

  const [score] = await db`
    SELECT s.event_id, s.nps, s.satisfaction, s.risk, s.benchmark_note, e.name AS show
    FROM scores s
    JOIN events e ON e.id = s.event_id
    WHERE s.exhibitor_id = ${exhibitor.id}
      AND (${eventName ?? null}::text IS NULL OR e.name = ${eventName ?? null})
    ORDER BY e.year DESC
    LIMIT 1
  `;
  if (!score) return null;

  const showOptionRows = await db`
    SELECT DISTINCT e.name AS show
    FROM opportunities o
    JOIN events e ON e.id = o.event_id
    WHERE o.exhibitor_id = ${exhibitor.id}
  `;

  const trendRows = await db`
    SELECT year, value
    FROM nps_trend
    WHERE exhibitor_id = ${exhibitor.id}
    ORDER BY year ASC
  `;

  const aiSummaryRows = await db`
    SELECT tone, text
    FROM ai_summaries
    WHERE exhibitor_id = ${exhibitor.id} AND event_id = ${score.event_id}
    ORDER BY id ASC
  `;

  const [recommendation] = await db`
    SELECT text FROM recommendations
    WHERE exhibitor_id = ${exhibitor.id} AND event_id = ${score.event_id}
    LIMIT 1
  `;

  const showOptions = showOptionRows.map((r) => r.show);

  return {
    kind: "account",
    exhibitor: exhibitor.name,
    show: score.show,
    showOptions: showOptions.length ? showOptions : [score.show],
    signals: [
      { label: "NPS", value: String(score.nps) },
      { label: "Satisfaction", value: score.satisfaction },
      { label: "Risk", value: score.risk, tone: "risk", risk: score.risk },
    ],
    benchmarkNote: score.benchmark_note,
    trend: trendRows.map((t) => ({ year: String(t.year), value: t.value })),
    trendNote: deriveTrendNote(trendRows),
    aiSummary: aiSummaryRows.map((s) => ({ tone: s.tone, text: s.text })),
    recommendation: recommendation?.text ?? "",
  };
}

async function getOpportunityPanel(exhibitorName, eventName) {
  const db = getDb();

  const [exhibitor] = await db`
    SELECT id, name FROM exhibitors WHERE name = ${exhibitorName} LIMIT 1
  `;
  if (!exhibitor) return null;

  const [opp] = await db`
    SELECT o.event_id, o.renewal_value, o.said_about_show, o.sector_avg_note,
           o.recommendation, e.name AS show
    FROM opportunities o
    JOIN events e ON e.id = o.event_id
    WHERE o.exhibitor_id = ${exhibitor.id}
      AND (${eventName ?? null}::text IS NULL OR e.name = ${eventName ?? null})
    ORDER BY e.year DESC
    LIMIT 1
  `;
  if (!opp) return null;

  const [score] = await db`
    SELECT nps, risk, benchmark_note
    FROM scores
    WHERE exhibitor_id = ${exhibitor.id} AND event_id = ${opp.event_id}
    LIMIT 1
  `;

  const editionRows = await db`
    SELECT year, value
    FROM nps_trend
    WHERE exhibitor_id = ${exhibitor.id}
    ORDER BY year ASC
  `;

  return {
    kind: "opportunity",
    exhibitor: exhibitor.name,
    show: opp.show,
    renewalValue: opp.renewal_value,
    signals: [
      { label: "NPS", value: String(score?.nps ?? "") },
      { label: "Benchmark", value: score?.benchmark_note ?? "" },
      { label: "Risk", value: score?.risk ?? "", tone: "risk", risk: score?.risk },
    ],
    saidAboutShow: opp.said_about_show ?? "",
    sectorAvgNote: opp.sector_avg_note ?? "",
    editionHistory: editionRows.map((t) => ({ year: String(t.year), value: t.value })),
    recommendation: opp.recommendation ?? "",
  };
}

async function getLeadKnownPanel(company) {
  const db = getDb();

  const [lead] = await db`
    SELECT company, match_confidence, last_show, nps_line, said_at_show, opening_angle
    FROM lead_intel
    WHERE company = ${company}
    LIMIT 1
  `;
  if (!lead) return null;

  return {
    kind: "lead-known",
    company: lead.company,
    matchConfidence: lead.match_confidence,
    lastShow: lead.last_show,
    npsLine: lead.nps_line,
    saidAtShow: lead.said_at_show ?? [],
    openingAngle: lead.opening_angle,
  };
}

module.exports = {
  getDb,
  getPortfolioPulse,
  getAccountPanel,
  getOpportunityPanel,
  getLeadKnownPanel,
};
