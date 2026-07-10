// Reusable Salesforce global header. Static chrome that frames the record
// page so the Explori panel reads as "inside Salesforce".

const tabs = ["Home", "Accounts", "Opportunities", "Leads", "Reports", "Dashboards"];

export function Header({
  activeTab,
  agentActive,
}: {
  activeTab?: string;
  agentActive?: boolean;
}) {
  return (
    <header className="sf-header">
      <div className="sf-header__bar">
        <div className="sf-header__app">
          <span className="sf-header__waffle">⋮⋮⋮</span>
          <span className="sf-header__appname">Sales Cloud</span>
        </div>
        <div className="sf-header__search">
          <input
            className="sf-header__searchinput"
            placeholder="Search Salesforce"
            readOnly
          />
        </div>
        <div className="sf-header__icons">
          <span
            className={"sf-header__af" + (agentActive ? " sf-header__af--active" : "")}
            title="Agentforce"
          >
            ✦
          </span>
          <span title="Notifications">🔔</span>
          <span title="Setup">⚙️</span>
          <span title="Help">❓</span>
          <span className="sf-header__avatar">AM</span>
        </div>
      </div>
      <nav className="sf-header__nav">
        {tabs.map((t) => (
          <span
            key={t}
            className={
              "sf-header__tab" + (t === activeTab ? " sf-header__tab--active" : "")
            }
          >
            {t}
          </span>
        ))}
      </nav>
    </header>
  );
}
