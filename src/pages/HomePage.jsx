import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearUser, getUser } from '../auth.js'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function HomePage() {
  const navigate = useNavigate()
  const user = getUser()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/signin', { replace: true })
    }
  }, [user, navigate])

  if (!user) return null

  function addFiles(fileList) {
    const next = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      size: formatSize(file.size),
      status: 'Uploaded',
      addedAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))

    setDocuments((current) => [...next, ...current])
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    if (event.dataTransfer.files?.length) {
      addFiles(event.dataTransfer.files)
    }
  }

  function handleSignOut() {
    clearUser()
    navigate('/signin')
  }

  return (
    <div className="home-page">
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/home" className="logo">
            FlowX
          </Link>
          <p className="home-user">{user.email}</p>
          <button type="button" className="btn btn-outline" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="container home-main">
        <p className="eyebrow">Workspace</p>
        <h1>Upload a document</h1>
        <p className="section-lead">
          Drop in an application or supporting file. In later versions, FlowX
          agents will read, verify, route and escalate it from here.
        </p>

        <div
          className={'dropzone' + (dragging ? ' is-dragging' : '')}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
        >
          <span className="dropzone-mark">+</span>
          <strong>Drop a file here</strong>
          <span>or click to browse · PDF, images, or office files</span>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(event) => {
              if (event.target.files?.length) addFiles(event.target.files)
              event.target.value = ''
            }}
          />
        </div>

        <section className="doc-list" aria-live="polite">
          <div className="doc-list-head">
            <h2>Your queue</h2>
            <span>{documents.length} file{documents.length === 1 ? '' : 's'}</span>
          </div>

          {documents.length === 0 ? (
            <p className="empty-queue">Nothing in the queue yet.</p>
          ) : (
            <ul>
              {documents.map((doc) => (
                <li key={doc.id} className="doc-row">
                  <div>
                    <strong>{doc.name}</strong>
                    <p>
                      {doc.size} · added {doc.addedAt}
                    </p>
                  </div>
                  <span className="status-pill">{doc.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export default HomePage
