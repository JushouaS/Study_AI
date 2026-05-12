import { Component, type ReactNode } from 'react'
import Icon from './Icon'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4">
          <div className="text-center fade-up max-w-md">
            <div className="w-20 h-20 bg-error-container rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon name="error" className="text-error text-4xl" />
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-background mb-2">Something went wrong</h1>
            <p className="text-on-surface-variant text-body-sm mb-2">
              An unexpected error occurred in the application.
            </p>
            {this.state.error && (
              <pre className="text-left text-xs text-error bg-error-container border border-outline-variant rounded-xl p-4 mb-6 overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-150 active:scale-95 flex items-center gap-sm mx-auto"
            >
              <Icon name="refresh" />
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
