import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser } from '../auth.js'

function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const alreadySignedIn = Boolean(getUser())

    // Play the logo animation, then continue into the app.
    const timer = setTimeout(() => {
      navigate(alreadySignedIn ? '/home' : '/signin', { replace: true })
    }, 2800)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash">
      <div className="splash-mark">
        <span className="splash-line" />
        <h1 className="splash-logo" aria-label="FlowX">
          {'FlowX'.split('').map((letter, index) => (
            <span key={index} style={{ animationDelay: `${0.35 + index * 0.08}s` }}>
              {letter}
            </span>
          ))}
        </h1>
        <p className="splash-tag">Documents shouldn&apos;t wait.</p>
      </div>
    </div>
  )
}

export default SplashPage
