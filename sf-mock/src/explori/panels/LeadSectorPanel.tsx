import type { LeadSectorPanelData } from "../../fixtures/types";
import { PanelHeader, Block } from "../primitives";

// Lead record panel, Scenario B: no prior exhibition history; show the sector
// benchmark. Maps the second Lead wireframe in senior-account-manager.md.
export function LeadSectorPanel({ data }: { data: LeadSectorPanelData }) {
  return (
    <div className="ex-panel">
      <PanelHeader title="EXPLORI INTELLIGENCE · Sector View" />

      <div className="ex-nohistory">
        No exhibition history found for this company.
        <br />
        Showing: <strong>{data.sector}</strong> benchmark
      </div>

      <Block label="Sector benchmark">
        <div className="ex-sectorgrid">
          <div>{data.sectorNps}</div>
          <div>{data.topPriority}</div>
          <div>{data.cadenceNote}</div>
          <div>{data.drivers}</div>
        </div>
      </Block>

      <div className="ex-angle">
        <div className="ex-angle__label">Opening angle</div>
        <p className="ex-angle__text">{data.openingAngle}</p>
      </div>
    </div>
  );
}
