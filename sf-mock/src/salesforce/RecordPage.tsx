import { useState } from "react";
import type { Scene } from "../fixtures/types";
import { RecordDetails } from "./RecordDetails";
import { ExploriPanel } from "../explori/ExploriPanel";
import { RenderFrame } from "../explori/RenderFrame";
import { ExploriSidebarWidget } from "../explori/SidebarWidget";

// Generic Salesforce record shell, "Header and Right Sidebar" template:
// highlights panel, then a main column (tab bar + body) beside a narrow right
// sidebar. The sidebar carries the trimmed Explori widget so intelligence
// stays visible on every tab, plus standard SF cards. Same shell for
// Account / Opportunity / Lead; only the data differs.
// One intelligence surface at a time: when the Explori Intelligence sub-tab is
// open, the sidebar card yields (component visibility rule in the real build).

export function RecordPage({ scene }: { scene: Scene }) {
  // Agent scenes: the conversation lives in the docked Agentforce panel
  // (rendered at shell level), never inside the record. The record page is
  // ordinary background context: Details tab open, standard sidebar cards.
  const isAgent = scene.panel.kind === "agentforce-chat";
  const tabs = ["Related", "Details", "News", "Explori Intelligence"];
  const [active, setActive] = useState(
    isAgent ? "Details" : "Explori Intelligence"
  );
  const chrome = scene.chrome!;

  return (
    <div className="sf-recordpage">
      <RecordDetails chrome={chrome} />

      <div className="sf-recordpage__cols">
        <div className="sf-recordpage__main">
          <div className="sf-tabs">
            {tabs.map((t) => (
              <button
                key={t}
                className={"sf-tab" + (t === active ? " sf-tab--active" : "")}
                onClick={() => setActive(t)}
              >
                {t}
                {t === "Explori Intelligence" && <span className="sf-tab__dot" />}
              </button>
            ))}
          </div>

          <div className="sf-tabbody">
            {active === "Explori Intelligence" &&
              (isAgent ? (
                <div className="sf-empty">
                  Phase 1 Explori panel (see the embedded-intelligence scenes).
                </div>
              ) : (
                <RenderFrame mode={scene.renderMode} label={scene.buildLabel}>
                  <ExploriPanel data={scene.panel} />
                </RenderFrame>
              ))}
            {active === "Details" && <DetailsTab fields={chrome.detailFields} />}
            {active !== "Explori Intelligence" && active !== "Details" && (
              <div className="sf-empty">Standard Salesforce {active} content.</div>
            )}
          </div>
        </div>

        <aside className="sf-recordpage__side">
          {!isAgent && active !== "Explori Intelligence" && (
            <ExploriSidebarWidget data={scene.panel} />
          )}
          <div className="sf-card">
            <div className="sf-card__head">Activity</div>
            <div className="sf-empty">
              Standard Salesforce activity timeline.
            </div>
          </div>
          <div className="sf-card">
            <div className="sf-card__head">News</div>
            <div className="sf-empty">Standard Salesforce news.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailsTab({ fields }: { fields: { label: string; value: string }[] }) {
  return (
    <div className="sf-card">
      <div className="sf-card__head">Details</div>
      <div className="sf-detailgrid">
        {fields.map((f) => (
          <div key={f.label} className="sf-detailgrid__row">
            <div className="sf-detailgrid__label">{f.label}</div>
            <div className="sf-detailgrid__value">{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
