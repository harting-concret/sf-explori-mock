import type { Scene } from "../fixtures/types";
import { ExploriPanel } from "../explori/ExploriPanel";
import { RenderFrame } from "../explori/RenderFrame";

// Salesforce Home surface: greeting + the embedded Explori panel beside a
// right sidebar holding the trimmed Explori widget and standard home components.
export function HomePage({
  scene,
  personaLabel,
}: {
  scene: Scene;
  personaLabel: string;
}) {
  const isAgent = scene.panel.kind === "agentforce-chat";
  return (
    <div className="sf-home">
      <div className="sf-home__greeting">
        <h1>Good morning</h1>
        <div className="sf-home__quarter">
          {personaLabel} · Q3 2026 rebooking cycle in progress
        </div>
      </div>
      <div
        className={
          "sf-home__grid" + (isAgent ? " sf-home__grid--dock" : "")
        }
      >
        <div className="sf-home__main">
          {isAgent ? (
            <div className="sf-card">
              <div className="sf-card__head">Home</div>
              <div className="sf-empty">Standard Salesforce home dashboard.</div>
            </div>
          ) : (
            <RenderFrame mode={scene.renderMode} label={scene.buildLabel}>
              <ExploriPanel data={scene.panel} />
            </RenderFrame>
          )}
        </div>
        <aside className="sf-home__side">
          <div className="sf-card">
            <div className="sf-card__head">Today's Tasks</div>
            <div className="sf-empty">Standard Salesforce task list.</div>
          </div>
          <div className="sf-card">
            <div className="sf-card__head">Quarterly Performance</div>
            <div className="sf-empty">Standard Salesforce chart.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
