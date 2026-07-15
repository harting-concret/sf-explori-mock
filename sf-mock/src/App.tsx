import { useState } from "react";
import { scenes, personas } from "./fixtures/scenes";
import { Header } from "./salesforce/Header";
import { Footer } from "./salesforce/Footer";
import { RecordPage } from "./salesforce/RecordPage";
import { HomePage } from "./salesforce/HomePage";
import { ReportPage } from "./salesforce/ReportPage";
import { AgentforceDock } from "./salesforce/AgentforceDock";
import { ExploriPanel } from "./explori/ExploriPanel";
import { useApiData, type PanelKind } from "./hooks/useApiData";

const tabForObject: Record<string, string> = {
  Account: "Accounts",
  Opportunity: "Opportunities",
  Lead: "Leads",
};

// Capture mode for scripted screenshots: /?scene=<scene-id>&capture=1 selects
// the scene directly, hides the harness nav, and lets the stage hug content.
const params = new URLSearchParams(window.location.search);
const paramScene = scenes.find((s) => s.id === params.get("scene"));
const captureMode = params.get("capture") === "1";

// Canvas iframe mode: /?mode=iframe renders ONLY the Explori panel, full
// viewport, no sidebar/chrome. With ?panel=<kind> it loads live data from the
// /api/ routes (see useApiData) instead of fixtures/scenes.ts.
const iframeMode = params.get("mode") === "iframe";
const panelKinds: PanelKind[] = ["portfolio-pulse", "account", "opportunity", "lead-known"];
const rawPanelParam = params.get("panel");
const panelParam: PanelKind | null = panelKinds.includes(rawPanelParam as PanelKind)
  ? (rawPanelParam as PanelKind)
  : null;
const exhibitorParam = params.get("exhibitor") ?? undefined;
const eventParam = params.get("event") ?? undefined;
const companyParam = params.get("company") ?? undefined;

// EXPERIMENT: Lead-known panel test for path-based URLs (/lead/:company)
// instead of query params, e.g. /lead/Farmers%20Coop.%20of%20Florida.
// See buildCanvasRedirectUrl in server/index.js for the matching redirect.
const leadPathMatch = window.location.pathname.match(/^\/lead\/(.+)$/);
const leadPathCompany = leadPathMatch ? decodeURIComponent(leadPathMatch[1]) : null;

export default function App() {
  if (leadPathCompany) {
    return <IframeDataPanel panelKind="lead-known" company={leadPathCompany} />;
  }
  if (iframeMode) {
    return <IframeApp />;
  }
  return <WireframeApp />;
}

// ------------------------------------------------------------ Iframe render
function IframeApp() {
  if (panelParam) {
    return (
      <IframeDataPanel
        panelKind={panelParam}
        exhibitor={exhibitorParam}
        event={eventParam}
        company={companyParam}
      />
    );
  }

  if (paramScene) {
    return (
      <div className="iframe-stage">
        <ExploriPanel data={paramScene.panel} />
      </div>
    );
  }

  return <div className="iframe-stage" />;
}

function IframeDataPanel({
  panelKind,
  exhibitor,
  event,
  company,
}: {
  panelKind: PanelKind;
  exhibitor?: string;
  event?: string;
  company?: string;
}) {
  const { data, loading, error } = useApiData(panelKind, { exhibitor, event, company });

  return (
    <div className="iframe-stage">
      {loading && <div className="iframe-spinner" aria-label="Loading" />}
      {!loading && error && <div className="iframe-error">{error}</div>}
      {!loading && !error && data && <ExploriPanel data={data} />}
    </div>
  );
}

// ---------------------------------------------------------- Wireframe render
function WireframeApp() {
  const firstPopulated =
    personas.find((p) => scenes.some((s) => s.personaId === p.id))?.id ??
    personas[0].id;
  const [personaId, setPersonaId] = useState(
    paramScene?.personaId ?? firstPopulated
  );
  const [activeId, setActiveId] = useState<string | undefined>(
    paramScene?.id ?? scenes.find((s) => s.personaId === firstPopulated)?.id
  );

  const persona = personas.find((p) => p.id === personaId)!;
  const personaScenes = scenes.filter((s) => s.personaId === personaId);
  const scene = scenes.find((s) => s.id === activeId);

  // Demo-only: reflect the selected scene in the address bar for Lead
  // scenes specifically (matches the real /lead/:company Canvas route),
  // using pushState so it's just a display update, not a page reload.
  // Any other scene resets back to "/" so the URL never shows a stale
  // /lead/... path while a different scene is actually on screen.
  function updateUrlForScene(target: typeof scene) {
    if (target?.panel.kind === "lead-known") {
      window.history.pushState(null, "", `/lead/${encodeURIComponent(target.panel.company)}`);
    } else {
      window.history.pushState(null, "", "/");
    }
  }

  function selectPersona(id: string) {
    setPersonaId(id);
    const nextScene = scenes.find((s) => s.personaId === id);
    setActiveId(nextScene?.id);
    updateUrlForScene(nextScene);
  }

  function selectScene(id: string) {
    setActiveId(id);
    updateUrlForScene(scenes.find((s) => s.id === id));
  }

  const activeTab =
    !scene || scene.surface === "home"
      ? "Home"
      : scene.surface === "report"
      ? "Reports"
      : tabForObject[scene.chrome!.objectType] ?? "Home";

  return (
    <div className={"harness" + (captureMode ? " harness--capture" : "")}>
      <aside className="harness__nav">
        <div className="harness__brand">
          <div className="harness__brandtitle">Explori in Salesforce</div>
          <div className="harness__brandsub">Persona mockups</div>
        </div>

        <div className="harness__personawrap">
          <label className="harness__personalabel">Persona</label>
          <select
            className="harness__persona"
            value={personaId}
            onChange={(e) => selectPersona(e.target.value)}
          >
            {personas.map((p) => {
              const count = scenes.filter((s) => s.personaId === p.id).length;
              return (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {count ? ` (${count})` : " · soon"}
                </option>
              );
            })}
          </select>
        </div>

        <div className="harness__scenes">
          {personaScenes.length === 0 && (
            <div className="harness__none">No mockups yet for this persona.</div>
          )}
          {personaScenes.map((s) => (
            <button
              key={s.id}
              className={
                "harness__item" + (s.id === activeId ? " harness__item--active" : "")
              }
              onClick={() => selectScene(s.id)}
            >
              <span
                className={"harness__modedot harness__modedot--" + s.renderMode}
                title={s.renderMode === "iframe" ? "iframe (Canvas)" : "native LWC"}
              />
              {s.label}
            </button>
          ))}
        </div>

        <div className="harness__legend">
          <div className="harness__legendtitle">Render type</div>
          <div className="harness__legendrow">
            <span className="harness__swatch harness__swatch--iframe" />
            iframe: Explori web UI via Canvas
          </div>
          <div className="harness__legendrow">
            <span className="harness__swatch harness__swatch--native" />
            native: built in Salesforce (LWC / Flow)
          </div>
        </div>

        <div className="harness__hint">
          Add a persona's mockups in <code>fixtures/scenes.ts</code>.
        </div>
      </aside>

      <main className="harness__stage">
        {scene ? (
          <>
            <div className="harness__blurb">{scene.blurb}</div>
            <div className="sf-shell">
              <Header
                activeTab={activeTab}
                agentActive={scene.panel.kind === "agentforce-chat"}
              />
              <div
                className={
                  "sf-shell__body" +
                  (scene.panel.kind === "agentforce-chat"
                    ? " sf-shell__body--dock"
                    : "")
                }
              >
                <div className="sf-shell__page">
                  {scene.surface === "record" && <RecordPage key={scene.id} scene={scene} />}
                  {scene.surface === "report" && <ReportPage scene={scene} />}
                  {scene.surface === "home" && (
                    <HomePage scene={scene} personaLabel={persona.label} />
                  )}
                </div>
                {scene.panel.kind === "agentforce-chat" && (
                  <AgentforceDock data={scene.panel} />
                )}
              </div>
              <Footer />
            </div>
          </>
        ) : (
          <div className="harness__emptystate">
            <h2>{persona.label}</h2>
            <p>{persona.blurb}</p>
            <p className="harness__emptyhint">
              No mockups built for this persona yet. They map from{" "}
              <code>sf-journeys.md</code> and get added to{" "}
              <code>fixtures/scenes.ts</code>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
