import type { PortfolioPulseData } from "../../fixtures/types";
import { PanelHeader, riskColor } from "../primitives";

// CCO home-page tile: portfolio heat map by event with a revenue-at-risk
// roll-up. Native LWC, but carries Explori branding. Maps the Portfolio Pulse
// wireframe in cco-vp-commercial.md.
export function PortfolioPulsePanel({ data }: { data: PortfolioPulseData }) {
  return (
    <div className="ex-panel ex-panel--home">
      <PanelHeader title="PORTFOLIO PULSE · Explori Risk Overview" context={data.asOf} />

      <div className="pp">
        {data.rows.map((r) => (
          <div key={r.event} className="pp__row">
            <div className="pp__bar" style={{ background: riskColor[r.risk] }} />
            <div className="pp__main">
              <div className="pp__line">
                <span className="pp__event">{r.event}</span>
                <span
                  className="ex-pill"
                  style={{ color: riskColor[r.risk], borderColor: riskColor[r.risk] }}
                >
                  {r.risk}
                </span>
                <span className="pp__atrisk">{r.atRisk}</span>
                <span className="pp__flagged">{r.flagged}</span>
              </div>
              <div className="pp__note">{r.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pp__total">{data.total}</div>

      {data.actions && (
        <div className="pp__actions">
          {data.actions.map((a) => (
            <button key={a} className="sf-btn sf-btn--brand">
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
