import type { Persona, Scene } from "./types";

// The revenue-chain personas (sf-journeys.md). Listed explicitly so every role
// shows in the dropdown even before it has mockups. Add scenes below and tag
// them with the matching personaId to light a role up.
export const personas: Persona[] = [
  {
    id: "cco",
    label: "CCO / VP Commercial",
    blurb: "Owns portfolio revenue. Thinks in shows, not accounts. Wants a revenue-at-risk number before the Monday leadership call.",
  },
  {
    id: "event-director",
    label: "Event Director",
    blurb: "Accountable for one show or cluster. Rebooking rate is show health and reputation. Wants an Explori Score column on the account list.",
  },
  {
    id: "sales-manager",
    label: "Sales Manager",
    blurb: "Runs a team of reps; owns the forecast. Wants a Risk Exceptions view: healthy deal stage, red sentiment underneath.",
  },
  {
    id: "senior-am",
    label: "Senior Account Manager",
    blurb: "Manages the top 20-50 key accounts. The Account record is their workspace. The emotional core of the product.",
  },
  {
    id: "sales-rep",
    label: "Sales Rep / BDM",
    blurb: "Volume book, high call count, mobile-first. Needs a 3-second signal strip and an auto-created task, not a dashboard.",
  },
];

// All harness content lives here. Tag each scene with a personaId from above and
// a renderMode (iframe = Explori web UI via Canvas; native = LWC/Flow/config).
export const scenes: Scene[] = [
  // ----------------------------------------------------------------- Account
  {
    id: "sam-account",
    label: "Account record",
    personaId: "senior-am",
    surface: "record",
    renderMode: "iframe",
    buildLabel: "Canvas embed",
    blurb:
      "Opens the Account at 8am; the renewal brief is already there. 4-year satisfaction trend tells a structural story before any call.",
    chrome: {
      objectType: "Account",
      recordName: "Siemens AG",
      subtitle: "Key Account · Manufacturing",
      highlights: [
        { label: "Type", value: "Exhibitor, Key Account" },
        { label: "Account Owner", value: "You" },
        { label: "Open Opportunities", value: "1 · £180,000" },
        { label: "Explori Risk", value: "Amber" },
      ],
      detailFields: [
        { label: "Account Name", value: "Siemens AG" },
        { label: "Website", value: "siemens.com" },
        { label: "Industry", value: "Manufacturing" },
        { label: "Relationship since", value: "2018 (7 years)" },
        { label: "Explori Exhibitor ID", value: "exh_8841_siemens" },
        { label: "Account Owner", value: "You" },
      ],
    },
    panel: {
      kind: "account",
      exhibitor: "Siemens AG",
      show: "London Build 2025",
      showOptions: ["London Build 2025"],
      signals: [
        { label: "NPS", value: "54" },
        { label: "Satisfaction", value: "7.1/10" },
        { label: "Risk", value: "AMBER", tone: "risk", risk: "AMBER" },
      ],
      benchmarkNote: "vs sector: 9 pts below benchmark",
      trend: [
        { year: "2021", value: 78 },
        { year: "2022", value: 71 },
        { year: "2023", value: 68 },
        { year: "2024", value: 61 },
        { year: "2025", value: 54 },
      ],
      trendNote: "Declining 4 years: structural trend, not a one-year dip",
      aiSummary: [
        { tone: "negative", text: "Lead quality rated below average (cited 3x)" },
        { tone: "negative", text: "Hall C foot traffic below expectations" },
        { tone: "positive", text: "Positive: show organisation, networking quality" },
      ],
      recommendation:
        "Lead data package + floor plan discussion before any price conversation. Multi-year offer if committed.",
    },
  },

  // ------------------------------------------------------------- Opportunity
  {
    id: "sam-opportunity",
    label: "Opportunity record",
    personaId: "senior-am",
    surface: "record",
    renderMode: "iframe",
    buildLabel: "Canvas embed",
    blurb:
      "Intelligence is pre-filtered to the exact show this deal is about. AM is in renewal mode; the panel is in renewal mode; they match.",
    chrome: {
      objectType: "Opportunity",
      recordName: "Siemens - London Build 2026 Renewal",
      subtitle: "Renewal · Stage: Proposal",
      highlights: [
        { label: "Amount", value: "£180,000" },
        { label: "Close Date", value: "30 Sep 2026" },
        { label: "Stage", value: "Proposal" },
        { label: "Explori Risk", value: "Amber" },
      ],
      detailFields: [
        { label: "Opportunity Name", value: "Siemens - London Build 2026 Renewal" },
        { label: "Account Name", value: "Siemens AG" },
        { label: "Show", value: "London Build 2026" },
        { label: "Amount", value: "£180,000" },
        { label: "Stage", value: "Proposal" },
        { label: "Probability", value: "70% (forecast) · corrected by Explori signal" },
      ],
    },
    panel: {
      kind: "opportunity",
      exhibitor: "Siemens AG",
      show: "London Build 2025",
      renewalValue: "£180,000",
      signals: [
        { label: "NPS", value: "54" },
        { label: "Benchmark", value: "-9 pts" },
        { label: "Risk", value: "AMBER", tone: "risk", risk: "AMBER" },
      ],
      saidAboutShow:
        "Hall C foot traffic, lead quality, and stand visibility were the primary concerns raised for this show.",
      sectorAvgNote:
        "Sector avg for this show type: 63 NPS · this exhibitor sits 9 pts below.",
      editionHistory: [
        { year: "2023", value: 68 },
        { year: "2024", value: 61 },
        { year: "2025", value: 54 },
      ],
      recommendation:
        "Address floor plan before price. Early-bird offer viable if commitment within 90 days.",
    },
  },

  // -------------------------------------------------------- Lead (known co.)
  {
    id: "sam-lead-known",
    label: "Lead - known company",
    personaId: "senior-am",
    surface: "record",
    renderMode: "iframe",
    buildLabel: "Canvas embed",
    blurb:
      "A lapsed-exhibitor call opens with what went wrong at their last show elsewhere: Explori's moat visible at first contact.",
    chrome: {
      objectType: "Lead",
      recordName: "Jane Smith - Bosch GmbH",
      subtitle: "Marketing Director · Inbound enquiry",
      highlights: [
        { label: "Company", value: "Bosch GmbH" },
        { label: "Title", value: "Marketing Director" },
        { label: "Lead Status", value: "New" },
        { label: "Explori Match", value: "High" },
      ],
      detailFields: [
        { label: "Name", value: "Jane Smith" },
        { label: "Company", value: "Bosch GmbH" },
        { label: "Title", value: "Marketing Director" },
        { label: "Email", value: "j.smith@bosch.com" },
        { label: "Lead Source", value: "Website enquiry" },
        { label: "Explori Match Confidence", value: "High (domain match)" },
      ],
    },
    panel: {
      kind: "lead-known",
      company: "Bosch GmbH",
      matchConfidence: "HIGH",
      lastShow: "SPS 2024 (Nuremberg)",
      npsLine: "NPS at that show: 61 · Sector avg: 67",
      saidAtShow: [
        { tone: "negative", text: "Lead quality underdelivered, ROI tracking weak" },
        { tone: "positive", text: "Positive: brand visibility, networking" },
      ],
      openingAngle:
        "\"Companies in your sector tell us lead quality is the #1 measure of exhibition ROI. Their last show underdelivered on that. Here's what we do differently on lead data.\"",
    },
  },

  // ------------------------------------------------------- Lead (sector view)
  {
    id: "sam-lead-sector",
    label: "Lead - sector view",
    personaId: "senior-am",
    surface: "record",
    renderMode: "native",
    buildLabel: "API + LWC",
    blurb:
      "No prior history? A cold prospecting call still opens with sector intelligence, not a blank script.",
    chrome: {
      objectType: "Lead",
      recordName: "Dr. Alex Reed - Novara Bio",
      subtitle: "Head of Events · Conference contact",
      highlights: [
        { label: "Company", value: "Novara Bio" },
        { label: "Title", value: "Head of Events" },
        { label: "Lead Status", value: "New" },
        { label: "Explori Match", value: "No history" },
      ],
      detailFields: [
        { label: "Name", value: "Dr. Alex Reed" },
        { label: "Company", value: "Novara Bio" },
        { label: "Title", value: "Head of Events" },
        { label: "Email", value: "a.reed@novarabio.com" },
        { label: "Lead Source", value: "Conference contact" },
        { label: "Explori Match Confidence", value: "No exhibition history found" },
      ],
    },
    panel: {
      kind: "lead-sector",
      sector: "Pharma & Life Sciences",
      sectorNps: "Sector NPS avg: 68",
      topPriority: "Top priority: lead quality",
      cadenceNote: "Companies in this sector exhibit at 3 shows/yr avg",
      drivers: "Key satisfaction drivers: floor plan, data, brand",
      openingAngle:
        "\"Companies in your sector tell us leads are the #1 measure of ROI at exhibitions. What does that look like for you today?\"",
    },
  },

  // -------------------------------------------------------------- Home page
  {
    id: "sam-home",
    label: "Home page strip",
    personaId: "senior-am",
    surface: "home",
    renderMode: "native",
    buildLabel: "API + LWC",
    blurb:
      "A compact Explori panel on the page the AM already opens each morning: their 5 highest-risk accounts this renewal cycle.",
    panel: {
      kind: "home",
      cycle: "Q3 2026 renewal cycle",
      rows: [
        { account: "Siemens AG", show: "London Build 2025", nps: 54, risk: "AMBER", renewalValue: "£180,000" },
        { account: "Thyssen Group", show: "Infra Expo 2025", nps: 41, risk: "RED", renewalValue: "£260,000" },
        { account: "Vaillant Ltd", show: "London Build 2025", nps: 39, risk: "RED", renewalValue: "£95,000" },
        { account: "Knauf Insulation", show: "BuildTech 2025", nps: 58, risk: "AMBER", renewalValue: "£140,000" },
        { account: "Wienerberger", show: "Infra Expo 2025", nps: 62, risk: "AMBER", renewalValue: "£110,000" },
      ],
    },
  },

  // ============================================================ CCO / VP COMM
  {
    id: "cco-portfolio-pulse",
    label: "Portfolio Pulse (Home)",
    personaId: "cco",
    surface: "home",
    renderMode: "iframe",
    buildLabel: "Canvas embed",
    blurb:
      "The CCO opens Salesforce and immediately has a number for the Monday meeting: how much renewal revenue is actually at risk, by show.",
    panel: {
      kind: "portfolio-pulse",
      asOf: "Week of Jun 30",
      rows: [
        {
          event: "London Build 2026",
          risk: "RED",
          atRisk: "£2.1M at risk",
          flagged: "8 accts flagged",
          note: "Structural: foot traffic + lead quality themes across multiple exhibitors. NPS declining 3yr avg. Not a sales problem.",
        },
        {
          event: "Pharma World 2026",
          risk: "AMBER",
          atRisk: "£840k at risk",
          flagged: "4 accts flagged",
          note: "Execution: NPS stable sector-wide but 4 key accounts with no rep contact in 30+ days. Sentiment window closing.",
        },
        {
          event: "Tech Connect 2026",
          risk: "GREEN",
          atRisk: "On track",
          flagged: "All above avg NPS",
          note: "All exhibitors above sector benchmark NPS. No action needed this cycle.",
        },
        {
          event: "Energy Summit 2026",
          risk: "RED",
          atRisk: "£1.4M at risk",
          flagged: "6 accts flagged",
          note: "Structural: year 1 show, satisfaction below sector baseline. Product issue to raise with the Event Director.",
        },
        {
          event: "Logistics Forum 2026",
          risk: "AMBER",
          atRisk: "£410k at risk",
          flagged: "2 accts flagged",
          note: "2 accounts flagged; both manageable with a call this week.",
        },
      ],
      total:
        "TOTAL: £4.75M renewal revenue in below-benchmark accounts across 5 active shows this rebooking season.",
      actions: ["Full risk report ->", "Send to Sales Managers ->"],
    },
  },

  {
    id: "cco-revenue-at-risk",
    label: "Revenue at Risk report",
    personaId: "cco",
    surface: "report",
    renderMode: "native",
    buildLabel: "SF Config",
    blurb:
      "The leadership-meeting asset: a standard Salesforce report giving the sentiment-adjusted forecast the CFO is implicitly asking about.",
    panel: {
      kind: "report",
      title: "REVENUE AT RISK · London Build 2026 Renewals",
      columns: [
        { label: "Account" },
        { label: "NPS", align: "right" },
        { label: "vs Sector", align: "right" },
        { label: "Trend" },
        { label: "Renewal Value", align: "right" },
      ],
      rows: [
        {
          cells: [
            { value: "Siemens AG", strong: true },
            { value: "54" },
            { value: "-9pts" },
            { value: "Down 4yr" },
            { value: "£180,000" },
          ],
          note: "Foot traffic + lead quality. Mentioned competing shows.",
          link: "Open in Explori ->",
        },
        {
          cells: [
            { value: "Bosch GmbH", strong: true },
            { value: "48" },
            { value: "-15pts" },
            { value: "Down 2yr" },
            { value: "£95,000" },
          ],
          note: "ROI + lead data underdelivered. Worst score in this segment.",
          link: "Open in Explori ->",
        },
        {
          cells: [
            { value: "Danfoss A/S", strong: true },
            { value: "51" },
            { value: "-12pts" },
            { value: "Down 1yr" },
            { value: "£210,000" },
          ],
          note: "Stand placement + networking below expectations. First decline.",
          link: "Open in Explori ->",
        },
        {
          cells: [
            { value: "Atlas Copco", strong: true },
            { value: "57" },
            { value: "-6pts" },
            { value: "New flag" },
            { value: "£62,000" },
          ],
          note: "Hall B foot traffic. New flag; watch for pattern.",
          link: "Open in Explori ->",
        },
        {
          cells: [
            { value: "Honeywell Int", strong: true },
            { value: "56" },
            { value: "-7pts" },
            { value: "Down 2yr" },
            { value: "£145,000" },
          ],
          note: "Brand visibility concern. Sales execution issue, not product.",
          link: "Open in Explori ->",
        },
      ],
      summaries: [
        { label: "Show total at risk", value: "£692,000" },
        { label: "Pipeline forecast (stage-based)", value: "£3.2M" },
        { label: "Forecast adjusted for sentiment risk", value: "£2.51M", emphasis: true },
      ],
    },
  },

  {
    id: "cco-event-drilldown",
    label: "Event risk drill-down",
    personaId: "cco",
    surface: "report",
    renderMode: "native",
    buildLabel: "SF Config",
    blurb:
      "If a show is Red, the CCO clicks through to the exhibitor list sorted by Explori score. Escalation context in under a minute, no briefing needed.",
    panel: {
      kind: "report",
      title: "LONDON BUILD 2026 · Exhibitor Risk Detail",
      flaggedNote: "Sorted by Explori score (lowest first)",
      columns: [
        { label: "Account" },
        { label: "NPS", align: "right" },
        { label: "vs Sector", align: "right" },
        { label: "Renewal", align: "right" },
        { label: "Risk" },
      ],
      rows: [
        {
          cells: [
            { value: "Bosch GmbH", strong: true },
            { value: "48" },
            { value: "-15pts" },
            { value: "£95k" },
            { value: "", risk: "RED" },
          ],
          note: "ROI + lead data. Worst score in show. Priority escalation.",
          link: "Open in Explori ->",
        },
        {
          cells: [
            { value: "Siemens AG", strong: true },
            { value: "54" },
            { value: "-9pts" },
            { value: "£180k" },
            { value: "", risk: "RED" },
          ],
          note: "Foot traffic + lead quality. Mentioned alt shows 3 yrs.",
          link: "Open in Explori ->",
        },
        {
          cells: [
            { value: "Atlas Copco", strong: true },
            { value: "57" },
            { value: "-6pts" },
            { value: "£62k" },
            { value: "", risk: "RED" },
          ],
          note: "Hall B foot traffic. First-time flag; manageable early.",
          link: "Open in Explori ->",
        },
        {
          cells: [
            { value: "Danfoss A/S", strong: true },
            { value: "51" },
            { value: "-12pts" },
            { value: "£210k" },
            { value: "", risk: "RED" },
          ],
          note: "Stand placement + networking. First year of decline.",
          link: "Open in Explori ->",
        },
        {
          cells: [
            { value: "Schneider Elec", strong: true },
            { value: "61" },
            { value: "-2pts" },
            { value: "£220k" },
            { value: "", risk: "AMBER" },
          ],
          note: "Stand location. Stable trend; one conversation likely fixes it.",
          link: "Open in Explori ->",
        },
      ],
      footerNote: "Event Director: Sarah Mitchell · Sales Manager: Tom Osei",
      actions: ["Email Event Director", "Create escalation task ->", "View full report ->"],
    },
  },

  // ============================================================ SALES MANAGER
  {
    id: "sm-pipeline",
    label: "Pipeline list view",
    personaId: "sales-manager",
    surface: "report",
    renderMode: "native",
    buildLabel: "API + LWC",
    blurb:
      "The standard pipeline gains an Explori Risk column. A deal that looks healthy by stage reveals if the sentiment underneath is deteriorating.",
    panel: {
      kind: "report",
      title: "MY TEAM PIPELINE · London Build 2026 Renewals",
      columns: [
        { label: "Account" },
        { label: "Stage" },
        { label: "Value", align: "right" },
        { label: "Close" },
        { label: "Explori Risk" },
      ],
      rows: [
        {
          cells: [
            { value: "Siemens AG", strong: true },
            { value: "Proposal" },
            { value: "£180,000" },
            { value: "Aug 15" },
            { value: "NPS: 54", risk: "RED" },
          ],
          note: "Foot traffic + lead quality cited. Declining 4 yrs. Mentioned competing shows in 3 of 4 surveys. Act before price talk.",
          link: "Open full exhibitor report in Explori ->",
        },
        {
          cells: [
            { value: "Bosch GmbH", strong: true },
            { value: "Proposal" },
            { value: "£95,000" },
            { value: "Sep 01" },
            { value: "NPS: 48", risk: "RED" },
          ],
          note: "ROI tracking + lead data underdelivered. 2yr decline. -15pts vs sector avg; worst score in this show segment.",
          link: "Open full exhibitor report in Explori ->",
        },
        {
          cells: [
            { value: "Schneider Elec", strong: true },
            { value: "Negotiation" },
            { value: "£220,000" },
            { value: "Jul 30" },
            { value: "NPS: 61", risk: "AMBER" },
          ],
          note: "Stand location concern. Trend stable; manageable if addressed.",
          link: "Open full exhibitor report in Explori ->",
        },
        {
          cells: [
            { value: "ABB Ltd", strong: true },
            { value: "Closed Won" },
            { value: "£145,000" },
            { value: "—" },
            { value: "NPS: 74", risk: "GREEN" },
          ],
        },
        {
          cells: [
            { value: "Atlas Copco", strong: true },
            { value: "Qualify" },
            { value: "£62,000" },
            { value: "Oct 10" },
            { value: "NPS: 51", risk: "RED" },
          ],
          note: "First-time flag. Hall B foot traffic below expectations. Sector avg 67; 16pts below. Early intervention needed.",
          link: "Open full exhibitor report in Explori ->",
        },
      ],
    },
  },

  {
    id: "sm-risk-exceptions",
    label: "Risk Exceptions view",
    personaId: "sales-manager",
    surface: "report",
    renderMode: "native",
    buildLabel: "SF Config",
    blurb:
      "The single most valuable view of the week: Red sentiment sitting at Proposal stage or later. The deals that look healthy and are about to fall out.",
    panel: {
      kind: "report",
      title: "RISK EXCEPTIONS · Red Sentiment + Active Pipeline",
      flaggedNote: "3 accounts flagged this week",
      columns: [
        { label: "Account" },
        { label: "Owner" },
        { label: "Stage" },
        { label: "Value", align: "right" },
        { label: "NPS", align: "right" },
        { label: "Trend" },
      ],
      rows: [
        {
          cells: [
            { value: "Siemens AG", strong: true },
            { value: "J.Harper" },
            { value: "Proposal" },
            { value: "£180,000" },
            { value: "54" },
            { value: "Down 4 yrs" },
          ],
          note: "Foot traffic + lead quality. Alt show mentions in 3 surveys. Recommend: floor plan offer before price.",
          link: "Explori ->",
        },
        {
          cells: [
            { value: "Bosch GmbH", strong: true },
            { value: "M.Chen" },
            { value: "Proposal" },
            { value: "£95,000" },
            { value: "48" },
            { value: "Down 2 yrs" },
          ],
          note: "ROI + lead data underdelivered. -15pts vs sector. Recommend: data package conversation before renewal push.",
          link: "Explori ->",
        },
        {
          cells: [
            { value: "Atlas Copco", strong: true },
            { value: "J.Harper" },
            { value: "Qualify" },
            { value: "£62,000" },
            { value: "51" },
            { value: "First yr" },
          ],
          note: "Hall B foot traffic flagged. First-time issue; call before it becomes a pattern.",
          link: "Explori ->",
        },
      ],
      footerNote:
        "J.Harper owns 2 of 3. Last Siemens contact: 12 days ago. M.Chen last called Bosch 3 days ago, task created.",
      actions: ["Flag for Director Attention ->"],
    },
  },

  // ========================================================= AGENTFORCE AGENT
  // Scene: Account Manager asks the Agentforce agent to prep a renewal call.
  // The conversation lives in the docked Agentforce side panel (as in real
  // Lightning); Explori data arrives via live External Services actions from
  // the OpenAPI spec. No custom Explori fields on any object.
  {
    id: "agent-renewal-prep",
    label: "Agent: renewal prep",
    personaId: "senior-am",
    surface: "record",
    renderMode: "native",
    buildLabel: "Agentforce",
    blurb:
      "AM opens the Agentforce panel and types one sentence; the agent calls Get Exhibitor Risk + Get Edition History (External Services actions from Explori's OpenAPI spec) and returns a full brief. Two live calls, ~$0.20.",
    chrome: {
      objectType: "Account",
      recordName: "Siemens AG",
      subtitle: "Key Account · Manufacturing",
      highlights: [
        { label: "Type", value: "Exhibitor, Key Account" },
        { label: "Account Owner", value: "You" },
        { label: "Open Opportunities", value: "1 · £180,000" },
        { label: "Website", value: "siemens.com" },
      ],
      detailFields: [
        { label: "Account Name", value: "Siemens AG" },
        { label: "Industry", value: "Manufacturing" },
        { label: "Account Owner", value: "You" },
        { label: "Website", value: "siemens.com" },
        { label: "Relationship Since", value: "2018 (7 years)" },
        { label: "Last Activity", value: "3 days ago" },
      ],
    },
    panel: {
      kind: "agentforce-chat",
      topic: "Renewal Prep",
      messages: [
        {
          role: "user",
          text: "Prep me for my Siemens renewal call tomorrow.",
        },
        {
          role: "agent",
          actionTraces: [
            { name: "Get Exhibitor Risk", source: "live-api", cost: "~$0.10" },
            { name: "Get Edition History", source: "live-api", cost: "~$0.10" },
          ],
          text: "Here's your Siemens brief for London Build 2026.",
          items: [
            { text: "NPS 54 · Amber risk · -9pts vs sector benchmark", risk: "AMBER" },
            { text: "Declining 4 consecutive years (78 in 2021 → 54 in 2025). Not a one-year dip.", risk: "RED" },
            { text: "Mentioned a competing show in 3 of the last 4 surveys. Churn signal.", risk: "RED" },
            { text: "Cited issues: Hall C foot traffic, lead quality, stand visibility." },
            { text: "Positive: show organisation, networking quality." },
          ],
          block: {
            kind: "confirm",
            label: "Recommendation",
            detail: "Open with the floor plan before any price conversation. Lead data package offer. Multi-year early-bird viable if Siemens commits by Aug 15.",
          },
        },
      ],
      costSummary: "2 live action calls · ~$0.20 total",
    },
  },

  // Scene: AM logs that Siemens renewed. Agent confirms before writing back.
  // Write-back is one Log Outcome operation on Explori's API; nothing is
  // written to custom Salesforce objects or fields.
  {
    id: "agent-outcome-capture",
    label: "Agent: log outcome",
    personaId: "senior-am",
    surface: "record",
    renderMode: "native",
    buildLabel: "Agentforce",
    blurb:
      "One sentence closes the loop: rebooking status and deal value flow back to Explori's dataset via the Log Outcome API operation. 1 write call, no custom fields anywhere.",
    chrome: {
      objectType: "Account",
      recordName: "Siemens AG",
      subtitle: "Key Account · Manufacturing",
      highlights: [
        { label: "Type", value: "Exhibitor, Key Account" },
        { label: "Account Owner", value: "You" },
        { label: "Open Opportunities", value: "1 · £180,000" },
        { label: "Website", value: "siemens.com" },
      ],
      detailFields: [
        { label: "Account Name", value: "Siemens AG" },
        { label: "Industry", value: "Manufacturing" },
        { label: "Account Owner", value: "You" },
        { label: "Website", value: "siemens.com" },
        { label: "Relationship Since", value: "2018 (7 years)" },
        { label: "Last Activity", value: "Today" },
      ],
    },
    panel: {
      kind: "agentforce-chat",
      topic: "Outcome Capture",
      messages: [
        {
          role: "user",
          text: "Log that Siemens just confirmed renewal after we offered a new Hall A floor plan.",
        },
        {
          role: "agent",
          text: "I'll record this outcome. Please confirm before I write:",
          block: {
            kind: "confirm",
            label: "Confirm: Log Outcome",
            detail: "Deal: Siemens - London Build 2026 Renewal\nOutcome: Renewed\nDeciding factor: Hall A floor plan offer\nExplori play tag: floor_plan_offer",
          },
        },
        {
          role: "user",
          text: "Yes, proceed.",
        },
        {
          role: "agent",
          actionTraces: [
            { name: "Log Outcome (write-back)", source: "live-api", cost: "~$0.10" },
          ],
          text: "Done.",
          block: {
            kind: "write",
            label: "Written to Explori",
            detail: "Outcome logged: Siemens · London Build 2026 Renewal\nRebooking status + deal value sent to Explori dataset\nBenchmark updated: floor plan intervention → renewal confirmed",
          },
        },
      ],
      costSummary: "1 write call · ~$0.10 · Explori dataset enriched",
    },
  },

  // Scene: Sales Manager asks for Red-sentiment deals hiding in healthy pipeline.
  // The agent reads the rep's open deals from standard CRM context, then makes
  // ONE bulk live call to Explori for risk scores. No custom fields involved.
  {
    id: "agent-pipeline-risk",
    label: "Agent: pipeline risk",
    personaId: "sales-manager",
    surface: "report",
    renderMode: "native",
    buildLabel: "Agentforce",
    blurb:
      "The most valuable question of the week answered in one message: the agent reads open deals from standard CRM data, then one bulk Get Risk Scores call to Explori scores them all. ~$0.10, no custom fields.",
    panel: {
      kind: "agentforce-chat",
      topic: "Pipeline Risk",
      messages: [
        {
          role: "user",
          text: "Which of my deals look healthy by stage but have Red Explori risk underneath?",
        },
        {
          role: "agent",
          actionTraces: [
            { name: "My open opportunities", source: "crm-read", cost: "included" },
            { name: "Get Risk Scores (bulk)", source: "live-api", cost: "~$0.10" },
          ],
          text: "3 risk exceptions in your pipeline this week. These deals are at Proposal or later by stage but flagged Red by Explori.",
          items: [
            { text: "Siemens AG · Proposal · £180k · NPS 54, declining 4 yrs. Hall C + lead quality cited.", risk: "RED" },
            { text: "Bosch GmbH · Proposal · £95k · NPS 48, -15pts vs sector. ROI + lead data underdelivered.", risk: "RED" },
            { text: "Atlas Copco · Qualify · £62k · NPS 51, first-time flag. Hall B foot traffic.", risk: "RED" },
          ],
        },
      ],
      costSummary: "1 live call · ~$0.10 · 6 open deals scored in one request",
    },
  },

  {
    id: "sm-account-1on1",
    label: "Account 1:1 coaching",
    personaId: "sales-manager",
    surface: "record",
    renderMode: "native",
    buildLabel: "API + LWC",
    blurb:
      "In a 1:1, \"what's your gut feel on Siemens?\" becomes \"the task was triggered 10 days ago and has not been acted on.\" Coaching to a specific missed action.",
    chrome: {
      objectType: "Account",
      recordName: "Siemens AG",
      subtitle: "Key Account · Owned by J.Harper",
      highlights: [
        { label: "Account Owner", value: "J.Harper" },
        { label: "Last Contact", value: "12 days ago" },
        { label: "Open Opportunities", value: "1 · £180,000" },
        { label: "Explori Risk", value: "Red" },
      ],
      detailFields: [
        { label: "Account Name", value: "Siemens AG" },
        { label: "Account Owner", value: "J.Harper" },
        { label: "Industry", value: "Manufacturing" },
        { label: "Last Activity", value: "12 days ago" },
        { label: "Explori Risk", value: "Red · NPS 54" },
        { label: "System Task", value: "Triggered Aug 3 · not acted on" },
      ],
    },
    panel: {
      kind: "account-coaching",
      exhibitor: "Siemens AG",
      signals: [
        { label: "NPS", value: "54" },
        { label: "Benchmark", value: "-9pts" },
        { label: "Risk", value: "RED", tone: "risk", risk: "RED" },
      ],
      owner: "J.Harper",
      lastContact: "12 days ago",
      saidAbout:
        "What Siemens said about London Build 2025: Hall C foot traffic, lead quality, and stand visibility.",
      trendNote: "Trend: declining 4 consecutive years (78 to 54)",
      sectorContext: "Sector context: 9 pts below the industrial shows average (NPS 63).",
      churnSignal: "mentioned a competing show in 3 of the last 4 years",
      recommendation:
        "Address floor plan before price. Lead data package discussion. Early-bird viable if committed by Aug 15.",
      taskTriggered: "Aug 3 (10 days ago)",
      taskStatus: "NOT ACTED ON",
      taskActed: false,
      actions: ["Create task for rep", "Flag for Director Attention", "Full report in Explori ->"],
    },
  },

  // Scene: CCO asks for portfolio risk. One live call to Get Portfolio Risk.
  {
    id: "agent-portfolio-briefing",
    label: "Agent: portfolio briefing",
    personaId: "cco",
    surface: "home",
    renderMode: "native",
    buildLabel: "Agentforce",
    blurb:
      "The Monday agenda in one question. One live call to Get Portfolio Risk returns the cross-show heat map. No dashboard needed; the agent surfaces only what needs attention.",
    panel: {
      kind: "agentforce-chat",
      topic: "Portfolio Briefing",
      messages: [
        {
          role: "user",
          text: "What is at risk in my portfolio this week?",
        },
        {
          role: "agent",
          actionTraces: [
            { name: "Get Portfolio Risk", source: "live-api", cost: "~$0.10" },
          ],
          text: "Portfolio briefing for week of Jun 30. Two shows need attention before Monday leadership.",
          items: [
            { text: "London Build 2026 · £2.1M at risk · 8 exhibitors flagged. Structural: foot traffic + lead quality across multiple accounts. Not a sales execution problem, brief the Event Director.", risk: "RED" },
            { text: "Energy Summit 2026 · £1.4M at risk · 6 exhibitors flagged. Year-1 show, satisfaction below sector baseline. Same root cause.", risk: "RED" },
            { text: "Pharma World 2026 · £840k at risk · 4 exhibitors. No rep contact in 30+ days. Sentiment window closing.", risk: "AMBER" },
            { text: "Tech Connect 2026 · All exhibitors above sector benchmark. No action needed this cycle.", risk: "GREEN" },
          ],
          block: {
            kind: "confirm",
            label: "Total exposure",
            detail: "£4.35M renewal revenue in below-benchmark accounts across 3 active shows.",
          },
        },
      ],
      costSummary: "1 live call · ~$0.10 · Get Portfolio Risk",
    },
  },
];
