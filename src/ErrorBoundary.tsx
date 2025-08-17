import React from 'react'

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; msg?: string }
> {
  constructor(p: any) {
    super(p)
    this.state = { hasError: false, msg: undefined }
  }
  static getDerivedStateFromError(err: any) {
    return { hasError: true, msg: String(err) }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 12, color: '#ffdada', background: '#3a0f1a',
                      border: '1px solid #7a2240', borderRadius: 8 }}>
          <b>Couldn’t load model.</b>
          <div style={{ opacity: .8, marginTop: 6, whiteSpace: 'pre-wrap' }}>
            {this.state.msg}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
