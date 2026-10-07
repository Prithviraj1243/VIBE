const AGENTS = [
  {
    name: 'Document AI Agent',
    role: 'Reads the uploaded file and extracts the fields an officer would normally look for.',
  },
  {
    name: 'Verification Agent',
    role: 'Checks completeness, consistency, and whether the request is ready for review.',
  },
  {
    name: 'Routing Agent',
    role: 'Identifies the correct department or officer instead of leaving the file in a general queue.',
  },
  {
    name: 'Alert Agent',
    role: 'Notifies the responsible officer as soon as the request is ready.',
  },
  {
    name: 'Escalation Agent',
    role: 'Sends reminders if a request stays pending, then escalates it to a senior officer.',
  },
]

function Agents() {
  return (
    <section className="section section-muted" id="ai-agents">
      <div className="container">
        <p className="eyebrow">System</p>
        <h2>AI Agents</h2>
        <p className="section-lead">
          Each agent has one job. Together they keep a document moving from
          upload to a named officer, then to a decision.
        </p>

        <div className="agent-list">
          {AGENTS.map((agent, index) => (
            <article key={agent.name} className="agent-row">
              <span className="agent-index">0{index + 1}</span>
              <h3>{agent.name}</h3>
              <p>{agent.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Agents
