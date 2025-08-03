import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Card from './Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // In production, you would send this to your error reporting service
    // Example: Sentry.captureException(error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-900">
          <Card className="max-w-md w-full p-8 text-center">
            <div className="flex justify-center mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Terjadi Kesalahan
            </h1>
            
            <p className="text-neutral-400 mb-6">
              Aplikasi mengalami kesalahan yang tidak terduga. 
              Silakan muat ulang halaman atau hubungi administrator.
            </p>
            
            <button
              onClick={this.handleReload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Halaman
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-300">
                  Detail Error (Development Only)
                </summary>
                <div className="mt-2 p-4 bg-neutral-800 rounded-lg text-xs text-red-400 overflow-auto">
                  <p className="font-semibold mb-2">Error:</p>
                  <pre>{this.state.error.toString()}</pre>
                  
                  <p className="font-semibold mt-4 mb-2">Stack Trace:</p>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
