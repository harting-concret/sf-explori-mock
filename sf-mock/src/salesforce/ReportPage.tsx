import type { Scene } from "../fixtures/types";
import { ExploriPanel } from "../explori/ExploriPanel";
import { RenderFrame } from "../explori/RenderFrame";

// Report / list-view surface. For agent scenes the page is an ORDINARY
// Salesforce pipeline view built on standard fields only (no Explori columns);
// the point of the scene is that the docked agent reveals the risk the
// standard view cannot show. The conversation itself renders in the dock.

const pipeRows = [
  ["Siemens - London Build 2026 Renewal", "Siemens AG", "Proposal", "£180,000", "30 Sep 2026"],
  ["Bosch - London Build 2026 Renewal", "Bosch GmbH", "Proposal", "£95,000", "15 Sep 2026"],
  ["ABB - Energy Summit 2026", "ABB Ltd", "Negotiation", "£140,000", "22 Aug 2026"],
  ["Atlas Copco - London Build 2026", "Atlas Copco", "Qualify", "£62,000", "30 Oct 2026"],
  ["Schneider - Tech Connect 2026", "Schneider Electric", "Proposal", "£118,000", "12 Sep 2026"],
  ["Festo - Pharma World 2026 Renewal", "Festo SE", "Negotiation", "£74,000", "05 Sep 2026"],
];

export function ReportPage({ scene }: { scene: Scene }) {
  const isAgent = scene.panel.kind === "agentforce-chat";
  if (isAgent) {
    return (
      <div className="sf-reportpage">
        <div className="sf-card">
          <div className="sf-card__head">My Team Pipeline · This Quarter</div>
          <table className="sf-pipetable">
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Account</th>
                <th>Stage</th>
                <th>Amount</th>
                <th>Close Date</th>
              </tr>
            </thead>
            <tbody>
              {pipeRows.map((r) => (
                <tr key={r[0]}>
                  {r.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sf-pipetable__note">
            Standard list view, standard fields. Stage says healthy; sentiment
            risk is not visible here.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="sf-reportpage">
      <RenderFrame mode={scene.renderMode} label={scene.buildLabel}>
        <ExploriPanel data={scene.panel} />
      </RenderFrame>
    </div>
  );
}
