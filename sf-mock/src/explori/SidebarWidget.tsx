import type {
  ExploriPanelData,
  RiskLevel,
  Signal,
} from "../fixtures/types";
import { riskColor, riskBg } from "./primitives";

// Trimmed sidebar variant of each Explori panel, derived from the same scene
// data as the full panel. Iteration 1 build: a compact widget route served by
// Explori's own web app (widgets.explori.com), embedded in the SMALL right
// sidebar region via Canvas (force:canvasApp in an Aura wrapper, placeable in
// any App Builder region). The dashed border + Canvas badge follow the
// harness-wide iframe cue; the ↗ popout opens the full view on explori.com.
// Iteration 2 option: rebuild as one width-aware native LWC reading
// flexipageRegionWidth.

function SideCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ex-side">
      <div className="ex-side__head">
        <span className="ex-side__logo">explori</span>
        <span className="ex-side__title">{title}</span>
        <a
          className="ex-side__popout"
          href="#"
          title="View more on explori.com"
          aria-label="View more on explori.com"
          onClick={(e) => e.preventDefault()}
        >
          ↗
        </a>
      </div>
      <div className="ex-side__body">{children}</div>
      <div className="ex-side__badge">iframe · Canvas widget</div>
    </div>
  );
}

function Stat({
  label,
  value,
  risk,
}: {
  label: string;
  value: string;
  risk?: RiskLevel;
}) {
  return (
    <div className="ex-side__stat">
      <span className="ex-side__statlabel">{label}</span>
      {risk ? (
        <span
          className="ex-side__pill"
          style={{ background: riskBg[risk], color: riskColor[risk] }}
        >
          {value}
        </span>
      ) : (
        <span className="ex-side__statvalue">{value}</span>
      )}
    </div>
  );
}

function Stats({ signals }: { signals: Signal[] }) {
  return (
    <>
      {signals.map((s) => (
        <Stat
          key={s.label}
          label={s.label}
          value={s.value}
          risk={s.tone === "risk" ? s.risk : undefined}
        />
      ))}
    </>
  );
}

function Reco({ text }: { text: string }) {
  return <div className="ex-side__reco">{text}</div>;
}

export function ExploriSidebarWidget({ data }: { data: ExploriPanelData }) {
  switch (data.kind) {
    case "account":
      return (
        <SideCard title="Account at a glance">
          <Stats signals={data.signals} />
          <div className="ex-side__note">{data.trendNote}</div>
          <Reco text={data.recommendation} />
        </SideCard>
      );
    case "opportunity":
      return (
        <SideCard title="Renewal at a glance">
          <Stat label="Renewal" value={data.renewalValue} />
          <Stats signals={data.signals} />
          <Reco text={data.recommendation} />
        </SideCard>
      );
    case "lead-known":
      return (
        <SideCard title="Lead match">
          <Stat
            label="Match"
            value={data.matchConfidence}
            risk={data.matchConfidence === "HIGH" ? "GREEN" : "AMBER"}
          />
          <Stat label="Last show" value={data.lastShow} />
          <div className="ex-side__note">{data.npsLine}</div>
          <Reco text={data.openingAngle} />
        </SideCard>
      );
    case "lead-sector":
      return (
        <SideCard title="Sector snapshot">
          <Stat label="Sector NPS" value={data.sectorNps} />
          <div className="ex-side__note">{data.topPriority}</div>
          <Reco text={data.openingAngle} />
        </SideCard>
      );
    case "home":
      return (
        <SideCard title="Renewals at risk">
          {data.rows.slice(0, 3).map((r) => (
            <Stat
              key={r.account}
              label={r.account}
              value={`NPS ${r.nps} · ${r.renewalValue}`}
              risk={r.risk}
            />
          ))}
        </SideCard>
      );
    case "portfolio-pulse":
      return (
        <SideCard title="Portfolio pulse">
          <div className="ex-side__headline">{data.total}</div>
          {data.rows
            .filter((r) => r.risk !== "GREEN")
            .slice(0, 3)
            .map((r) => (
              <Stat key={r.event} label={r.event} value={r.atRisk} risk={r.risk} />
            ))}
        </SideCard>
      );
    case "account-coaching":
      return (
        <SideCard title="Coaching snapshot">
          <Stats signals={data.signals} />
          <Stat label="Owner" value={data.owner} />
          <Stat
            label="Task"
            value={data.taskActed ? "Acted on" : "Not acted on"}
            risk={data.taskActed ? "GREEN" : "RED"}
          />
        </SideCard>
      );
    case "agentforce-chat":
      return (
        <SideCard title="Agent session">
          <div className="ex-side__note">{data.topic}</div>
          {data.costSummary && (
            <div className="ex-side__note">{data.costSummary}</div>
          )}
          <Reco text="Continue in the Agentforce panel." />
        </SideCard>
      );
    case "report":
      // Reports render full-width; no sidebar variant.
      return null;
  }
}
