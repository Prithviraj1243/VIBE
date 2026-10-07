import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { saveUser } from '../auth.js'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.69 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96L3.97 7.29C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}

function SignInPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  function handleGoogleSignIn() {
    // UI-only Google sign-in for this prototype (no real OAuth yet).
    setLoading(true)

    window.setTimeout(() => {
      saveUser({
        name: 'A. Sharma',
        email: 'officer@flowx.gov',
      })
      navigate('/home')
    }, 900)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="logo auth-logo">
          FlowX
        </Link>
        <h1>Sign in</h1>
        <p className="auth-copy">
          Continue to your document workspace. Officers and applicants use the
          same door — the queue is what changes.
        </p>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <GoogleIcon />
          {loading ? 'Connecting…' : 'Sign in with Google'}
        </button>

        <p className="auth-note">
          This is a prototype button. Real Google login will be added later.
        </p>

        <Link to="/welcome" className="auth-link">
          What is FlowX?
        </Link>
      </div>
    </div>
  )
}

export default SignInPage
