import type { AccountCoachingData } from "../../fixtures/types";
import { PanelHeader, SignalStrip, Block, Recommendation } from "../primitives";

// Sales Manager 1:1 coaching panel on an Account record. Explori sentiment
// blended with Salesforce task status, so a vague "what's your gut feel?"
// becomes "the task was triggered 10 days ago and not acted on". Maps the
// "Account Record in 1:1 Context" wireframe in sales-manager.md.
export function AccountCoachingPanel({ data }: { data: AccountCoachingData }) {
  return (
    <div className="ex-panel">
      <PanelHeader
        title={`EXPLORI INTELLIGENCE · ${data.exhibitor}`}
        context={`Owner: ${data.owner} · Last contact: ${data.lastContact}`}
      />

      <SignalStrip signals={data.signals} />

      <Block label="What this exhibitor said">
        <p className="ex-text">{data.saidAbout}</p>
        <div className="ex-benchmark">{data.trendNote}</div>
        <p className="ex-text">{data.sectorContext}</p>
        <div className="ex-benchmark">Churn signal: {data.churnSignal}</div>
      </Block>

      <Recommendation text={data.recommendation} />

      <div className={"ex-task" + (data.taskActed ? "" : " ex-task--alert")}>
        <div className="ex-task__label">System task triggered: {data.taskTriggered}</div>
        <div className="ex-task__status">
          Status: <strong>{data.taskStatus}</strong>
        </div>
      </div>

      {data.actions && (
        <div className="ex-coachactions">
          {data.actions.map((a) => (
            <button key={a} className="sf-btn">
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
