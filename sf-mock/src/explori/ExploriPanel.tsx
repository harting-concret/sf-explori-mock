import type { ExploriPanelData } from "../fixtures/types";
import { AccountPanel } from "./panels/AccountPanel";
import { OpportunityPanel } from "./panels/OpportunityPanel";
import { LeadKnownPanel } from "./panels/LeadKnownPanel";
import { LeadSectorPanel } from "./panels/LeadSectorPanel";
import { HomePanel } from "./panels/HomePanel";
import { PortfolioPulsePanel } from "./panels/PortfolioPulsePanel";
import { ReportPanel } from "./panels/ReportPanel";
import { AccountCoachingPanel } from "./panels/AccountCoachingPanel";
import { AgentforceChatPanel } from "./panels/AgentforceChatPanel";

// Router: picks the panel component for the scene's data variant.
export function ExploriPanel({ data }: { data: ExploriPanelData }) {
  switch (data.kind) {
    case "account":
      return <AccountPanel data={data} />;
    case "opportunity":
      return <OpportunityPanel data={data} />;
    case "lead-known":
      return <LeadKnownPanel data={data} />;
    case "lead-sector":
      return <LeadSectorPanel data={data} />;
    case "home":
      return <HomePanel data={data} />;
    case "portfolio-pulse":
      return <PortfolioPulsePanel data={data} />;
    case "report":
      return <ReportPanel data={data} />;
    case "account-coaching":
      return <AccountCoachingPanel data={data} />;
    case "agentforce-chat":
      return <AgentforceChatPanel data={data} />;
  }
}
