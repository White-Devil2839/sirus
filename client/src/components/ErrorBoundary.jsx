import { Component } from 'react';
import { FileWarning, RotateCcw } from 'lucide-react';

// On-brand recovery screen instead of a white crash page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Hook point for an error-reporting service (Sentry etc.).
    console.error('[sirus] render error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-6">
        <div className="w-full max-w-md rounded-4xl bg-card p-10 text-center shadow-card ring-1 ring-ink/5">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500">
            <FileWarning size={26} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold text-ink">A page came loose.</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Something unexpected broke this view. Your reports and data are safe — reloading usually fixes it.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-ink/5 p-3 text-left text-[11px] text-red-500">
              {String(this.state.error?.message || this.state.error)}
            </pre>
          )}
          <button onClick={() => window.location.reload()} className="btn-primary mt-6 w-full py-3">
            <RotateCcw size={16} /> Reload SIRUS
          </button>
        </div>
      </div>
    );
  }
}
