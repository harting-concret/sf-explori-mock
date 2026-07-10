import type { LeadKnownPanelData } from "../../fixtures/types";
import { PanelHeader, Block } from "../primitives";

// Lead record panel, Scenario A: company has exhibition history in Explori's
// dataset. Maps the first Lead wireframe in senior-account-manager.md.
export function LeadKnownPanel({ data }: { data: LeadKnownPanelData }) {
  return (
    <div className="ex-panel">
      <PanelHeader title={`EXPLORI INTELLIGENCE · ${data.company}`} />

      <div className="ex-match">
        <span>
          Match: <strong>{data.company}</strong>
        </span>
        <span className={`ex-match__badge ex-match__badge--${data.matchConfidence.toLowerCase()}`}>
          Confidence: {data.matchConfidence}
        </span>
      </div>

      <Block label="Last known exhibition">
        <p className="ex-text">{data.lastShow}</p>
        <div className="ex-benchmark">{data.npsLine}</div>
      </Block>

      <Block label={`What ${data.company} said at that show`}>
        <ul className="ex-list">
          {data.saidAtShow.map((s, i) => (
            <li key={i} className={`ex-list__item ex-list__item--${s.tone}`}>
              {s.text}
            </li>
          ))}
        </ul>
      </Block>

      <div className="ex-angle">
        <div className="ex-angle__label">Opening angle</div>
        <p className="ex-angle__text">{data.openingAngle}</p>
      </div>

      <a className="ex-link" href="#">
        No match? Search by company →
      </a>
    </div>
  );
}
