import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/95 text-white font-mono flex items-center justify-center">
          <div className="max-w-md p-8 border border-red-500 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">⚠️ Critical Error</h1>
            <p className="text-gray-300 mb-4">The application encountered an unexpected error.</p>
            
            <div className="bg-black/50 rounded p-4 mb-6 text-left text-xs text-gray-400 overflow-auto max-h-40">
              <p className="font-bold text-red-400 mb-2">Error Details:</p>
              <p className="mb-2">{this.state.error?.toString()}</p>
              {this.state.errorInfo && (
                <details className="text-[8px] mt-2">
                  <summary className="cursor-pointer text-gray-300">Stack Trace</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-gray-500">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-red-500 text-black font-bold rounded hover:bg-red-600 transition-colors"
            >
              Reload Application
            </button>

            <p className="text-[10px] text-gray-500 mt-4">
              If the error persists, check the browser console for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
