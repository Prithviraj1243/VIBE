function About() {
  return (
    <section className="section" id="about">
      <div className="container about-grid">
        <div>
          <p className="eyebrow">About</p>
          <h2>Built for offices that still run on paper trails.</h2>
        </div>
        <div className="about-copy">
          <p>
            Applications, certificates, and supporting files often wait because
            someone has to open them, figure out where they belong, and remember
            to follow up. That delay is not always a lack of staff — it is a
            lack of routing.
          </p>
          <p>
            FlowX is a prototype for institutions that need a clearer path:
            read the document, check it, send it to the right desk, and escalate
            it if it sits too long. This first version is the public-facing
            product surface. Agent logic will come next.
          </p>
        </div>
      </div>
    </section>
  )
}

export default About
