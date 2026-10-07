import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="#top" className="logo">
          FlowX
        </a>

        <nav className="nav-links" aria-label="Primary">
          <a href="#how-it-works">How it Works</a>
          <a href="#ai-agents">AI Agents</a>
          <a href="#about">About</a>
        </nav>

        <Link to="/signin" className="btn btn-dark">
          Sign In
        </Link>
      </div>
    </header>
  )
}

export default Navbar
