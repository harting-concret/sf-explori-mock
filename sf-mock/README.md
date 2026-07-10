# Explori in Salesforce: Wireframe Harness

Lightweight Vite + React harness that renders the persona wireframes from
`icp-journeys/` inside a Salesforce-looking shell. Built to iterate fast on
persona screens for the Explori AppExchange proposal.

## Run

```bash
cd sf-mocks
npm install
npm run dev      # http://localhost:5180
```

## What's reusable

| Piece | File | Purpose |
|---|---|---|
| SF Header / Footer | `src/salesforce/Header.tsx`, `Footer.tsx` | Global Salesforce chrome |
| Record Details | `src/salesforce/RecordDetails.tsx` | Highlights panel; renders any object via props |
| Record Page shell | `src/salesforce/RecordPage.tsx` | Tabs + slots the Explori panel into an "Explori Intelligence" tab |
| Home surface | `src/salesforce/HomePage.tsx` | Home page with embedded Explori panel |
| Report surface | `src/salesforce/ReportPage.tsx` | Full-width SF report / list view using Explori fields (`ReportPanel`) |
| Explori atoms | `src/explori/primitives.tsx` | SignalStrip, TrendBar, Recommendation, PanelHeader |
| Explori panels | `src/explori/panels/*` | One component per wireframe |
| Sidebar widget | `src/explori/SidebarWidget.tsx` | Trimmed per-persona variant for the right sidebar |
| Render frame | `src/explori/RenderFrame.tsx` | iframe vs native visual cue around any panel |

Account / Opportunity / Lead UX is selected by the scene's `chrome.objectType`
and `panel.kind`; the same `RecordPage` shell drives all three.

## Persona dropdown

The sidebar dropdown lists the five revenue-chain personas from
`sf-journeys.md` (CCO, Event Director, Sales Manager, Senior Account Manager,
Sales Rep). Selecting a persona filters its scenes. Personas with no mockups
yet show a `· soon` tag and an empty state.

Populated today, mapped from the `icp-journeys/` files:

| Persona | Scenes |
|---|---|
| CCO / VP Commercial | Portfolio Pulse (home), Revenue at Risk report, Event risk drill-down |
| Sales Manager | Pipeline list view, Risk Exceptions view, Account 1:1 coaching |
| Senior Account Manager | Account, Opportunity, Lead (known), Lead (sector), Home strip |

Event Director and Sales Rep are still `· soon`.

## Right sidebar (trimmed widgets)

Record and Home surfaces follow Salesforce's "Header and Right Sidebar"
Lightning template: a narrow (~300px) SMALL region on the right where SF itself
puts Activity, News, and compact related-list cards.

`SidebarWidget.tsx` renders a trimmed variant of each persona's panel there,
derived from the same scene data (no extra fixtures). It stays visible on every
record tab, so the intelligence never disappears when the user works the
Related or Details tab. Reports stay full width, matching real list views.

Build story, iteration 1 (Canvas iframe, client's preference):

- Explori serves a compact widget route from its own web app
  (`widgets.explori.com/...`), embedded via Canvas. Salesforce allows Canvas in
  any App Builder region, including the narrow sidebar: wrap `force:canvasApp`
  in a small Aura component (`flexipage:availableForRecordHome`) and drag it in.
- Constraints to carry into the proposal: the wrapper must be Aura (LWC does
  not support Canvas); each widget load is a signed-request POST counted
  against the org's Canvas call limit (5,000/day per full user license,
  org-wide); Explori's widget route must render responsively at ~280px; needs
  the same CSP `frame-ancestors` change as the main Canvas panel.
- The dashed border + `iframe · Canvas widget` badge encode this, consistent
  with the harness-wide iframe cue. Each widget header carries a ↗ popout
  (View more on explori.com) linking the trimmed view to the full report.

Iteration 2 option: rebuild as one width-aware native LWC
(`@api flexipageRegionWidth` returns SMALL / MEDIUM / LARGE per region), so the
same component serves the main tab and the sidebar with no Canvas round-trips.

## iframe vs native (render mode)

Every scene declares a `renderMode`:

| Mode | Visual cue | Means |
|---|---|---|
| `iframe` | dashed purple border + `iframe · Canvas embed` badge | Explori's existing web UI embedded via Canvas. Needs the CSP header change. |
| `native` | solid, with a `⚡ Native Salesforce` badge | Built on the platform: LWC / Flow / config. |

`buildLabel` adds the precise build type (e.g. `Canvas embed`, `API + LWC`).
The legend in the sidebar explains the convention for client demos.

## Add a persona or screen

Append entries to `src/fixtures/scenes.ts`. Each scene declares its
`personaId`, `surface`, `renderMode`, optional `buildLabel`, the Salesforce
record chrome, and the Explori panel data. To light up a new persona, add
scenes tagged with its `personaId` (personas themselves are listed at the top
of `scenes.ts`). New record-type panels go in `src/explori/panels/` and get
wired in `src/explori/ExploriPanel.tsx`.

## Scope note

This is a clickable wireframe harness, not a Salesforce build. The Salesforce
skin is SLDS via CDN; the Explori panels are custom-styled to mirror how a
Canvas/LWC panel would carry Explori's own brand inside Salesforce.
