import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-100 text-red-900 rounded-xl m-4">
          <h2 className="text-xl font-bold mb-4">React Component Crash (White Screen of Death)</h2>
          <p className="font-mono bg-white p-4 rounded border border-red-200">
            {this.state.error && this.state.error.toString()}
          </p>
          <pre className="mt-4 bg-gray-900 text-red-400 p-4 rounded overflow-auto text-xs">
            {this.state.error && this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
