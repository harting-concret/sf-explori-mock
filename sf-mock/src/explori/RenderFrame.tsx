import type { RenderMode } from "../fixtures/types";

// Wraps any Explori surface with a visual cue for HOW it reaches the page:
//  - iframe  → dashed border + an "iframe · Canvas" badge (Explori's own UI)
//  - native  → solid, integrated, with a "built on platform" badge (LWC/Flow)
// The distinction is a core proposal point, so it's made explicit in the mock.

export function RenderFrame({
  mode,
  label,
  children,
}: {
  mode: RenderMode;
  label?: string;
  children: React.ReactNode;
}) {
  if (mode === "iframe") {
    return (
      <div className="frame frame--iframe">
        <div className="frame__iframebadge">
          iframe · {label ?? "Canvas embed"}
        </div>
        <div className="frame__inner">{children}</div>
      </div>
    );
  }

  return (
    <div className="frame frame--native">
      <div className="frame__nativebadge">
        <span className="frame__bolt">⚡</span> Native Salesforce · {label ?? "LWC"}
      </div>
      {children}
    </div>
  );
}
