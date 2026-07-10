import type { AgentforceChatData } from "../fixtures/types";
import { Message } from "../explori/panels/AgentforceChatPanel";

// The native Agentforce side panel, where employee agents actually live in
// Lightning Experience: docked to the right edge, full height under the global
// header, opened from the Agentforce icon in the header (or programmatically
// from a component via lightning/accApi). The conversation never renders
// inside a record tab; the record page stays visible beside the dock.

export function AgentforceDock({ data }: { data: AgentforceChatData }) {
  return (
    <aside className="af-dock">
      <div className="af-dock__head">
        <div className="af-dock__title">
          <span className="af-dock__logo">✦ Agentforce</span>
          <span className="af-dock__agent">Sales Agent ▾</span>
        </div>
        <div className="af-dock__icons">
          <span title="Expand">⤢</span>
          <span title="Close">✕</span>
        </div>
      </div>
      <div className="af-dock__topic">Topic: {data.topic}</div>

      <div className="af-messages af-dock__messages">
        {data.messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
      </div>

      <div className="af-footer">
        <div className="af-input">
          <div className="af-input__field">Ask Agentforce...</div>
          <button className="af-input__send">↑</button>
        </div>
        {data.costSummary && <div className="af-cost">⚡ {data.costSummary}</div>}
      </div>
      <div className="af-dock__buildnote">
        Native Agentforce panel · Explori actions via External Services (OpenAPI)
      </div>
    </aside>
  );
}
