import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 rounded-2xl border border-rose-900/60 bg-slate-900/90 text-center space-y-4 shadow-2xl">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 w-16 h-16 mx-auto flex items-center justify-center">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="text-xs font-mono text-rose-300 bg-slate-950 p-3 rounded-lg border border-slate-800 text-left overflow-x-auto">
            {this.state.error?.message || "Unexpected rendering error"}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
