// ErrorBoundary.tsx
import React from 'react'
import { Html } from '@react-three/drei'

type Props = { children: React.ReactNode; onDismiss?: () => void; watch?: unknown }
type State = { hasError: boolean; userMsg?: string; devMsg?: string; showDetails: boolean }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(p: Props) {
    super(p)
    this.state = { hasError: false, userMsg: undefined, devMsg: undefined, showDetails: false }
  }

  static getDerivedStateFromError(err: unknown): State {
    console.error('Model load error:', err)
    return {
      hasError: true,
      userMsg: "We couldn't load your 3D model. Please check the file and try again.",
      devMsg: String(err),
      showDetails: false
    }
  }

  componentDidUpdate(prev: Props) {
    // If the watched value (e.g., modelUrl) changes, clear the error UI
    if (prev.watch !== this.props.watch && this.state.hasError) {
      this.setState({ hasError: false, showDetails: false })
    }
  }

  private dismiss = () => {
    // Hide the panel and let parent clear the bad model
    this.setState({ hasError: false, showDetails: false })
    this.props.onDismiss?.()
  }

  private toggleDetails = () => this.setState(s => ({ showDetails: !s.showDetails }))

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Html center style={{ pointerEvents: 'auto' }}>
        {/* …UI unchanged… */}
        <div style={{ minWidth: 360, maxWidth: 520, color: '#e8ecff', background: 'rgba(20,22,35,0.7)',
          backdropFilter: 'blur(8px)', border: '1px solid rgba(120,130,255,0.25)', borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)', padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* …icon + text… */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Couldn’t load model</div>
              <div style={{ opacity: 0.9, lineHeight: 1.5 }}>{this.state.userMsg}</div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button onClick={this.dismiss} style={{
                  padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(120,130,255,0.3)',
                  background: 'rgba(60,70,130,0.25)', color: 'white', cursor: 'pointer'
                }}>
                  Dismiss
                </button>
                <button onClick={this.toggleDetails} style={{
                  padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(120,130,255,0.3)',
                  background: 'rgba(60,70,130,0.25)', color: 'white', cursor: 'pointer'
                }}>
                  {this.state.showDetails ? 'Hide details' : 'Show details'}
                </button>
              </div>

              {this.state.showDetails && (
                <pre style={{
                  marginTop: 10, maxHeight: 140, overflow: 'auto', whiteSpace: 'pre-wrap',
                  background: 'rgba(8,10,20,0.5)', border: '1px solid rgba(120,130,255,0.15)',
                  borderRadius: 8, padding: 10, fontSize: 12, color: '#c6ccff'
                }}>{this.state.devMsg}</pre>
              )}
            </div>
          </div>
        </div>
      </Html>
    )
  }
}
