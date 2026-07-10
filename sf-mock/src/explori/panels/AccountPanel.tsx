import type { AccountPanelData } from "../../fixtures/types";
import { PanelHeader, SignalStrip, TrendBar, Block, Recommendation } from "../primitives";

// Account record panel: the relationship view. Maps the Account wireframe in
// senior-account-manager.md.
export function AccountPanel({ data }: { data: AccountPanelData }) {
  const ambiguous = data.showOptions.length > 1;
  return (
    <div className="ex-panel">
      <PanelHeader title={`EXPLORI INTELLIGENCE · ${data.exhibitor}`} />

      <div className="ex-showbar">
        <span className="ex-showbar__show">{data.show}</span>
        {ambiguous ? (
          <select className="ex-showbar__picker">
            {data.showOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : (
          <span className="ex-showbar__resolved">resolved from open opportunity</span>
        )}
      </div>

      <SignalStrip signals={data.signals} />
      <div className="ex-benchmark">{data.benchmarkNote}</div>

      <Block label="Satisfaction trend">
        <TrendBar points={data.trend} note={data.trendNote} />
      </Block>

      <Block label="AI Summary">
        <ul className="ex-list">
          {data.aiSummary.map((s, i) => (
            <li key={i} className={`ex-list__item ex-list__item--${s.tone}`}>
              {s.text}
            </li>
          ))}
        </ul>
      </Block>

      <Recommendation text={data.recommendation} />

      <a className="ex-link" href="#">
        View Full Analysis →
      </a>
    </div>
  );
}
