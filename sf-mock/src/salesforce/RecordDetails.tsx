import type { RecordChrome, ObjectType } from "../fixtures/types";

// Reusable Salesforce "record highlights" panel: object icon, record name,
// compact key fields, and standard action buttons. Driven entirely by props so
// the same component renders an Account, Opportunity, or Lead.

const iconColor: Record<ObjectType, string> = {
  Account: "#7f8de1",
  Opportunity: "#fcb95b",
  Lead: "#f88962",
  Contact: "#7dd1e8",
};

const iconGlyph: Record<ObjectType, string> = {
  Account: "🏢",
  Opportunity: "💷",
  Lead: "👤",
  Contact: "📇",
};

export function RecordDetails({ chrome }: { chrome: RecordChrome }) {
  return (
    <section className="sf-record">
      <div className="sf-record__top">
        <div
          className="sf-record__icon"
          style={{ background: iconColor[chrome.objectType] }}
        >
          {iconGlyph[chrome.objectType]}
        </div>
        <div className="sf-record__titlewrap">
          <div className="sf-record__eyebrow">{chrome.objectType}</div>
          <h1 className="sf-record__name">{chrome.recordName}</h1>
          {chrome.subtitle && (
            <div className="sf-record__subtitle">{chrome.subtitle}</div>
          )}
        </div>
        <div className="sf-record__actions">
          <button className="sf-btn">Edit</button>
          <button className="sf-btn">New Task</button>
          <button className="sf-btn sf-btn--brand">Log a Call</button>
        </div>
      </div>
      <div className="sf-record__highlights">
        {chrome.highlights.map((f) => (
          <div key={f.label} className="sf-record__field">
            <div className="sf-record__fieldlabel">{f.label}</div>
            <div className="sf-record__fieldvalue">{f.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
