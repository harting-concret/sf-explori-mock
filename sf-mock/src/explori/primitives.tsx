import type { Signal, TrendPoint, RiskLevel } from "../fixtures/types";

// Shared Explori UI atoms reused across every panel variant.

export const riskColor: Record<RiskLevel, string> = {
  GREEN: "#2e844a",
  AMBER: "#a86403",
  RED: "#ba0517",
};

export const riskBg: Record<RiskLevel, string> = {
  GREEN: "#ddf0e0",
  AMBER: "#fde9cf",
  RED: "#fddde3",
};

// Branded panel header with the Explori wordmark + context line.
export function PanelHeader({ title, context }: { title: string; context?: string }) {
  return (
    <div className="ex-head">
      <div className="ex-head__brand">
        <span className="ex-head__logo">explori</span>
        <span className="ex-head__tag">Intelligence</span>
      </div>
      <div className="ex-head__title">{title}</div>
      {context && <div className="ex-head__context">{context}</div>}
    </div>
  );
}

// Row of signal tiles (NPS / Satisfaction / Risk / Benchmark).
export function SignalStrip({ signals }: { signals: Signal[] }) {
  return (
    <div className="ex-signals">
      {signals.map((s) => {
        const isRisk = s.tone === "risk" && s.risk;
        return (
          <div
            key={s.label}
            className="ex-signal"
            style={
              isRisk
                ? { background: riskBg[s.risk!], borderColor: riskColor[s.risk!] }
                : undefined
            }
          >
            <div className="ex-signal__label">{s.label}</div>
            <div
              className="ex-signal__value"
              style={isRisk ? { color: riskColor[s.risk!] } : undefined}
            >
              {s.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Year-over-year bar trend (satisfaction / NPS over editions).
export function TrendBar({
  points,
  note,
}: {
  points: TrendPoint[];
  note?: string;
}) {
  const max = Math.max(...points.map((p) => p.value), 100);
  return (
    <div className="ex-trend">
      <div className="ex-trend__bars">
        {points.map((p) => (
          <div key={p.year} className="ex-trend__col">
            <div className="ex-trend__value">{p.value}</div>
            <div
              className="ex-trend__bar"
              style={{ height: `${(p.value / max) * 100}%` }}
            />
            <div className="ex-trend__year">{p.year}</div>
          </div>
        ))}
      </div>
      {note && <div className="ex-trend__note">↘ {note}</div>}
    </div>
  );
}

// Labelled section block used throughout the panels.
export function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ex-block">
      <div className="ex-block__label">{label}</div>
      <div className="ex-block__body">{children}</div>
    </div>
  );
}

// Green commercial-action callout.
export function Recommendation({ text }: { text: string }) {
  return (
    <div className="ex-reco">
      <div className="ex-reco__label">Recommendation</div>
      <div className="ex-reco__text">{text}</div>
    </div>
  );
}
