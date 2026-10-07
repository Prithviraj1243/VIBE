import { Link } from 'react-router-dom'
import WorkflowAnimation from './WorkflowAnimation.jsx'

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Document workflow automation</p>
          <h1>Documents shouldn&apos;t wait.</h1>
          <p className="hero-sub">
            FlowX uses AI-powered agents to verify, route, track and escalate
            document workflows — so requests don&apos;t get stuck for days.
          </p>

          <div className="hero-actions">
            <Link to="/signin" className="btn btn-accent">
              Get Started
            </Link>
            <a href="#how-it-works" className="btn btn-outline">
              See How It Works
            </a>
          </div>
        </div>

        <WorkflowAnimation />
      </div>
    </section>
  )
}

export default Hero
