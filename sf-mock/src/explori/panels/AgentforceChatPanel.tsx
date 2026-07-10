import type {
  AgentforceChatData,
  AgentforceMessage,
  AfActionTrace,
} from "../../fixtures/types";
import { riskColor } from "../primitives";

const riskBorder: Record<string, string> = {
  RED: "#ba0517",
  AMBER: "#a86403",
  GREEN: "#2e844a",
};

function ActionTrace({ trace }: { trace: AfActionTrace }) {
  const isLive = trace.source === "live-api";
  return (
    <div className="af-trace-row">
      <span
        className="af-trace-dot"
        style={{ background: isLive ? "#0176d3" : "#2e844a" }}
      />
      <span className="af-trace-action">{trace.name}</span>
      <span className="af-trace-source">{isLive ? "live API" : "CRM context"}</span>
      <span className="af-trace-cost">{trace.cost}</span>
    </div>
  );
}

export function Message({ msg }: { msg: AgentforceMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={"af-msg af-msg--" + msg.role}>
      {msg.actionTraces && msg.actionTraces.length > 0 && (
        <div className="af-trace">
          {msg.actionTraces.map((t, i) => (
            <ActionTrace key={i} trace={t} />
          ))}
        </div>
      )}
      <div className="af-bubble">
        {msg.text && <p>{msg.text}</p>}

        {msg.items && msg.items.length > 0 && (
          <ul className="af-items">
            {msg.items.map((item, i) => (
              <li
                key={i}
                style={
                  item.risk
                    ? { borderLeftColor: riskBorder[item.risk] }
                    : undefined
                }
              >
                {item.risk && (
                  <span
                    className="af-item-pill"
                    style={{
                      background: item.risk === "RED" ? "#fddde3" : item.risk === "AMBER" ? "#fde9cf" : "#ddf0e0",
                      color: riskColor[item.risk],
                    }}
                  >
                    {item.risk}
                  </span>
                )}
                {item.text}
              </li>
            ))}
          </ul>
        )}

        {msg.block?.kind === "confirm" && (
          <div className="af-block af-block--confirm">
            <div className="af-block__label">{msg.block.label}</div>
            <div className="af-block__detail">{msg.block.detail}</div>
          </div>
        )}

        {msg.block?.kind === "write" && (
          <div className="af-block af-block--write">
            <div className="af-block__label">{msg.block.label}</div>
            <div className="af-block__detail">{msg.block.detail}</div>
          </div>
        )}
      </div>
      {!isUser && <div className="af-sender">Agentforce</div>}
    </div>
  );
}

export function AgentforceChatPanel({ data }: { data: AgentforceChatData }) {
  return (
    <div className="af-panel">
      <div className="af-head">
        <div className="af-head__left">
          <span className="af-head__logo">✦ Agentforce</span>
          <span className="af-head__badge">Sales Agent</span>
        </div>
        <span className="af-head__topic">Topic: {data.topic}</span>
      </div>

      <div className="af-messages">
        {data.messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
      </div>

      <div className="af-footer">
        <div className="af-input">
          <div className="af-input__field">Ask Agentforce...</div>
          <button className="af-input__send">↑</button>
        </div>
        {data.costSummary && (
          <div className="af-cost">
            ⚡ {data.costSummary}
          </div>
        )}
      </div>
    </div>
  );
}
