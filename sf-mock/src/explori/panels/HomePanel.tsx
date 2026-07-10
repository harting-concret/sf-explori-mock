import type { HomePanelData } from "../../fixtures/types";
import { PanelHeader, riskColor } from "../primitives";

// Home page strip: the AM's highest-risk accounts for the current cycle.
// Maps the "Other surfaces: Home Page" note in senior-account-manager.md.
export function HomePanel({ data }: { data: HomePanelData }) {
  return (
    <div className="ex-panel ex-panel--home">
      <PanelHeader
        title="EXPLORI · HIGHEST-RISK ACCOUNTS"
        context={data.cycle}
      />
      <table className="ex-hometable">
        <thead>
          <tr>
            <th>Account</th>
            <th>Show</th>
            <th>NPS</th>
            <th>Risk</th>
            <th>Renewal</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.account}>
              <td className="ex-hometable__acct">{r.account}</td>
              <td>{r.show}</td>
              <td>{r.nps}</td>
              <td>
                <span
                  className="ex-pill"
                  style={{ color: riskColor[r.risk], borderColor: riskColor[r.risk] }}
                >
                  {r.risk}
                </span>
              </td>
              <td>{r.renewalValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
