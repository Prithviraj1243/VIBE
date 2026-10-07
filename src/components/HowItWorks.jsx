const STEPS = [
  {
    number: '01',
    title: 'Upload',
    text: 'User uploads a document or application.',
  },
  {
    number: '02',
    title: 'Understand',
    text: 'AI agents read and analyze the document.',
  },
  {
    number: '03',
    title: 'Notify',
    text: 'The responsible officer is automatically alerted.',
  },
  {
    number: '04',
    title: 'Escalate',
    text: 'If the request stays pending too long, FlowX escalates it.',
  },
]

function HowItWorks() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <p className="eyebrow">Process</p>
        <h2>How FlowX Works</h2>
        <p className="section-lead">
          A short path from submission to decision — with agents watching the
          queue so files do not sit unread.
        </p>

        <div className="card-grid">
          {STEPS.map((step) => (
            <article key={step.number} className="info-card">
              <span className="info-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
