import { Link } from 'react-router-dom'

function CTA() {
  return (
    <section className="cta">
      <div className="container cta-inner">
        <h2>Stop documents from getting stuck.</h2>
        <Link to="/signin" className="btn btn-accent">
          Get Started
        </Link>
      </div>
    </section>
  )
}

export default CTA
