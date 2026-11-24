import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageContext } from '../../context/contexts';

/**
 * Class-based error boundary — React only supports boundaries via class
 * components. Catches render-time errors in any child route.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static contextType = LanguageContext;

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In a production build this is where telemetry would be reported.
    if (import.meta.env.MODE !== 'production') {
      console.error('LUXORA error boundary:', error, info);
    }
  }

  componentDidUpdate(prevProps) {
    // Navigating away is the natural "try again": without this the same crashed
    // view stayed on screen for every route until a full reload.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;
    const t = this.context?.t ?? ((key) => key);
    const tr = (key, fallbackText) => {
      const value = t(key);
      return value === key ? fallbackText : value;
    };

    if (!hasError) return children;

    if (fallback) return fallback;

    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6 py-24">
        <div className="w-full max-w-lg border border-line bg-white p-10 text-center dark:border-night-border dark:bg-night-soft">
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
          </span>

          <h1 className="font-display text-2xl font-normal text-ink dark:text-cream">{tr('state.errorTitle', 'Something went wrong')}</h1>
          <p className="prose-lux mt-3">{tr('state.errorBody', 'An unexpected error interrupted this view. You can retry, or return to the homepage.')}</p>

          {import.meta.env.MODE !== 'production' && error?.message && (
            <pre className="mt-6 overflow-x-auto border border-line bg-cream-soft p-4 text-start text-xs text-danger dark:border-night-border dark:bg-night-card">
              {error.message}
            </pre>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button icon={RotateCcw} onClick={this.handleReset}>
              {tr('state.retry', 'Try again')}
            </Button>
            <Button variant="subtle" to="/">
              {tr('nav.home', 'Return home')}
            </Button>
          </div>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;
