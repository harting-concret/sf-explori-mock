import { Fragment } from "react";
import type { ReportPanelData } from "../../fixtures/types";
import { riskColor } from "../primitives";

// A native Salesforce report / list view that uses Explori fields. Styled as a
// standard SF report (not an Explori-branded card) to reinforce that these are
// out-of-the-box reports once the score fields exist. Covers Revenue at Risk,
// Event drill-down, Pipeline list view, and Risk Exceptions.
export function ReportPanel({ data }: { data: ReportPanelData }) {
  return (
    <div className="rep">
      <div className="rep__head">
        <div className="rep__title">{data.title}</div>
        {data.flaggedNote && <div className="rep__flag">{data.flaggedNote}</div>}
      </div>

      <table className="rep__table">
        <thead>
          <tr>
            {data.columns.map((c, i) => (
              <th key={i} className={c.align === "right" ? "rep__r" : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <Fragment key={ri}>
              <tr className={row.note ? "rep__rowtop" : undefined}>
                {row.cells.map((cell, ci) => (
                  <td
                    key={ci}
                    className={data.columns[ci]?.align === "right" ? "rep__r" : undefined}
                  >
                    {cell.risk ? (
                      <span
                        className="rep__pill"
                        style={{ color: riskColor[cell.risk], borderColor: riskColor[cell.risk] }}
                      >
                        {cell.risk}
                      </span>
                    ) : null}
                    <span className={cell.strong ? "rep__strong" : undefined}>
                      {cell.value}
                    </span>
                  </td>
                ))}
              </tr>
              {row.note && (
                <tr className="rep__noterow">
                  <td colSpan={data.columns.length}>
                    <span className="rep__note">{row.note}</span>
                    {row.link && <a className="rep__link" href="#">{row.link}</a>}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      {data.summaries && (
        <div className="rep__summaries">
          {data.summaries.map((s, i) => (
            <div
              key={i}
              className={"rep__sumrow" + (s.emphasis ? " rep__sumrow--emph" : "")}
            >
              <span>{s.label}</span>
              <span>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {(data.footerNote || data.actions) && (
        <div className="rep__footer">
          {data.footerNote && <div className="rep__footnote">{data.footerNote}</div>}
          {data.actions && (
            <div className="rep__actions">
              {data.actions.map((a) => (
                <button key={a} className="sf-btn">
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
