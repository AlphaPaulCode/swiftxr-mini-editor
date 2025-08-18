import React from 'react'
import { Html } from '@react-three/drei'

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; msg?: string }
> {
  constructor(p: any) {
    super(p)
    this.state = { hasError: false, msg: undefined }
  }

  static getDerivedStateFromError(err: any) {
    console.error("Model load error:", err) // keep full log in console
    return { hasError: true, msg: "We couldn't load your 3D model file. Please check the file and try again." }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div style={{
            padding: 12, color: '#ffdada', background: '#3a0f1a',
            border: '1px solid #7a2240', borderRadius: 8, maxWidth: 420,
            textAlign: 'center'
          }}>
            <b>Couldn’t load model.</b>
            <div style={{ opacity: .8, marginTop: 6 }}>
              {this.state.msg}
            </div>
          </div>
        </Html>
      )
    }
    return this.props.children
  }
}
