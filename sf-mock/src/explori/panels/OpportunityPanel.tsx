import type { OpportunityPanelData } from "../../fixtures/types";
import { PanelHeader, SignalStrip, TrendBar, Block, Recommendation } from "../primitives";

// Opportunity record panel: show-specific intelligence at the deal level.
// Maps the Opportunity wireframe in senior-account-manager.md.
export function OpportunityPanel({ data }: { data: OpportunityPanelData }) {
  return (
    <div className="ex-panel">
      <PanelHeader
        title={`EXPLORI INTELLIGENCE · ${data.show}`}
        context={`${data.exhibitor} · Renewal value: ${data.renewalValue}`}
      />

      <SignalStrip signals={data.signals} />

      <Block label="What this exhibitor said about this show">
        <p className="ex-text">{data.saidAboutShow}</p>
      </Block>

      <div className="ex-benchmark">{data.sectorAvgNote}</div>

      <Block label="Edition history for this show">
        <TrendBar points={data.editionHistory} />
      </Block>

      <Recommendation text={data.recommendation} />
      <div className="ex-scopednote">Scoped to this deal, this show.</div>
    </div>
  );
}
