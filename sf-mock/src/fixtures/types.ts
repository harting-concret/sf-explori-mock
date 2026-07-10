// Shared data shapes. New personas/scenes are added as fixtures only, no new
// components required. This file is the contract every Explori panel reads from.

export type RiskLevel = "GREEN" | "AMBER" | "RED";
export type ObjectType = "Account" | "Opportunity" | "Lead" | "Contact";

export interface FieldItem {
  label: string;
  value: string;
}

// Drives the reusable Salesforce record chrome (highlights panel + Details tab).
export interface RecordChrome {
  objectType: ObjectType;
  recordName: string;
  subtitle?: string;
  highlights: FieldItem[]; // compact key fields in the highlights bar
  detailFields: FieldItem[]; // fuller list shown under the Details tab
}

// The four signal tiles reused across every panel.
export interface Signal {
  label: string;
  value: string;
  tone?: "default" | "risk";
  risk?: RiskLevel;
}

export interface TrendPoint {
  year: string;
  value: number;
}

// Discriminated union: one variant per wireframe across the icp-journeys files.
export type ExploriPanelData =
  | AccountPanelData
  | OpportunityPanelData
  | LeadKnownPanelData
  | LeadSectorPanelData
  | HomePanelData
  | PortfolioPulseData
  | ReportPanelData
  | AccountCoachingData
  | AgentforceChatData;

export interface AccountPanelData {
  kind: "account";
  exhibitor: string;
  show: string;
  showOptions: string[]; // event picker; single entry = resolved silently
  signals: Signal[];
  benchmarkNote: string;
  trend: TrendPoint[];
  trendNote: string;
  aiSummary: { tone: "negative" | "positive"; text: string }[];
  recommendation: string;
}

export interface OpportunityPanelData {
  kind: "opportunity";
  exhibitor: string;
  show: string;
  renewalValue: string;
  signals: Signal[];
  saidAboutShow: string;
  sectorAvgNote: string;
  editionHistory: TrendPoint[];
  recommendation: string;
}

export interface LeadKnownPanelData {
  kind: "lead-known";
  company: string;
  matchConfidence: "HIGH" | "MEDIUM" | "LOW";
  lastShow: string;
  npsLine: string;
  saidAtShow: { tone: "negative" | "positive"; text: string }[];
  openingAngle: string;
}

export interface LeadSectorPanelData {
  kind: "lead-sector";
  sector: string;
  sectorNps: string;
  topPriority: string;
  cadenceNote: string;
  drivers: string;
  openingAngle: string;
}

export interface HomeRiskRow {
  account: string;
  show: string;
  nps: number;
  risk: RiskLevel;
  renewalValue: string;
}

export interface HomePanelData {
  kind: "home";
  cycle: string;
  rows: HomeRiskRow[];
}

// CCO Portfolio Pulse tile: heat map of the active portfolio by event.
export interface PortfolioRow {
  event: string;
  risk: RiskLevel;
  atRisk: string; // "£2.1M at risk"
  flagged: string; // "8 accts flagged" or "On track"
  note: string; // structural vs execution diagnosis
}

export interface PortfolioPulseData {
  kind: "portfolio-pulse";
  asOf: string; // "Week of Jun 30"
  rows: PortfolioRow[];
  total: string; // the headline revenue-at-risk roll-up
  actions?: string[];
}

// Generic Salesforce report / list view that uses Explori fields. Covers the
// Revenue at Risk, Event drill-down, Pipeline, and Risk Exceptions wireframes.
export interface ReportCell {
  value: string;
  risk?: RiskLevel; // colours the cell as a RAG pill
  strong?: boolean;
}

export interface ReportRow {
  cells: ReportCell[]; // aligned to columns
  note?: string; // italic detail line spanning the row
  link?: string; // e.g. "Open in Explori ->"
}

export interface ReportSummary {
  label: string;
  value: string;
  emphasis?: boolean; // the adjusted-forecast / total line
}

export interface ReportPanelData {
  kind: "report";
  title: string;
  flaggedNote?: string; // "3 accounts flagged this week"
  columns: { label: string; align?: "right" }[];
  rows: ReportRow[];
  summaries?: ReportSummary[];
  footerNote?: string; // "Event Director: ...  Sales Manager: ..."
  actions?: string[];
}

// Sales Manager 1:1 coaching panel: Explori data blended with SF task status.
export interface AccountCoachingData {
  kind: "account-coaching";
  exhibitor: string;
  signals: Signal[];
  owner: string;
  lastContact: string;
  saidAbout: string;
  trendNote: string;
  sectorContext: string;
  churnSignal: string;
  recommendation: string;
  taskTriggered: string;
  taskStatus: string;
  taskActed: boolean; // false = NOT ACTED ON (red)
  actions?: string[];
}

// Agentforce Agent conversation. One message per turn; agent turns carry
// optional action traces (what fired before the reply) and structured blocks.
// Renders in the DOCKED Agentforce side panel (AgentforceDock), matching where
// employee agents actually live in Lightning Experience. Actions are External
// Services operations from Explori's OpenAPI spec (live-api) or reads of
// standard CRM context (crm-read). No custom Explori fields anywhere.

export type AgentforceSource = "crm-read" | "live-api";

export interface AfActionTrace {
  name: string;
  source: AgentforceSource;
  cost: string; // "~$0.10" or "included"
}

export interface AfItem {
  text: string;
  risk?: RiskLevel;
}

export interface AfBlock {
  kind: "confirm" | "write";
  label: string;
  detail: string;
}

export interface AgentforceMessage {
  role: "user" | "agent";
  text: string;
  actionTraces?: AfActionTrace[];
  items?: AfItem[];
  block?: AfBlock;
}

export interface AgentforceChatData {
  kind: "agentforce-chat";
  topic: string;
  messages: AgentforceMessage[];
  costSummary?: string;
}

// A persona in the revenue chain (see sf-journeys.md). Listed explicitly so a
// role still appears in the dropdown before it has any mockups.
export interface Persona {
  id: string;
  label: string;
  blurb: string; // role one-liner shown in the empty state
}

// How the Explori UI reaches the page:
//  - iframe  = Explori's existing web UI embedded via Canvas (dotted border)
//  - native  = custom-built on the platform: LWC / Flow / config (solid)
export type RenderMode = "iframe" | "native";

// A scene = one screen in the harness.
export interface Scene {
  id: string;
  label: string;
  personaId: string;
  surface: "record" | "home" | "report";
  renderMode: RenderMode;
  buildLabel?: string; // precise build type, e.g. "API + LWC", "Canvas embed"
  blurb: string; // one-line "what changes for the user"
  chrome?: RecordChrome; // present for record surfaces
  panel: ExploriPanelData;
}
