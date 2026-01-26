import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // In production, you might want to send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 bg-error/10 rounded-full flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-error" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-base-content mb-2">
              Something went wrong
            </h1>
            <p className="text-base-content/60 mb-6">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={this.handleRetry}
                className="btn btn-primary"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="btn btn-ghost"
              >
                Go Home
              </button>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left bg-base-100 rounded-lg p-4 border border-base-300">
                <summary className="cursor-pointer text-sm font-medium text-error">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs overflow-auto text-base-content/70 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
