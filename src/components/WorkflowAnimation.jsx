import { useEffect, useState } from 'react'

// Steps shown in the hero animation. The active step is highlighted in orange
// to show a document moving through the FlowX pipeline.
const STEPS = [
  { id: 'upload', label: 'Document uploaded' },
  { id: 'verify', label: 'AI verification' },
  { id: 'alert', label: 'Officer alert' },
  { id: 'review', label: 'Document review' },
  { id: 'done', label: 'Completed' },
]

function WorkflowAnimation() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % STEPS.length)
    }, 1800)

    return () => clearInterval(timer)
  }, [])

  return (
    <aside className="workflow" aria-label="Document workflow animation">
      <p className="workflow-caption">Live request path</p>

      <div className="workflow-track">
        {STEPS.map((step, index) => {
          const isActive = index === activeIndex
          const isDone = index < activeIndex

          return (
            <div
              key={step.id}
              className={
                'workflow-step' +
                (isActive ? ' is-active' : '') +
                (isDone ? ' is-done' : '')
              }
            >
              <div className="workflow-marker">
                <span className="workflow-dot" />
                {index < STEPS.length - 1 && <span className="workflow-line" />}
              </div>

              <div className="workflow-card">
                {isActive && (
                  <span className="doc-chip" aria-hidden="true">
                    DOC
                  </span>
                )}
                <span className="workflow-index">0{index + 1}</span>
                <span className="workflow-label">{step.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default WorkflowAnimation
