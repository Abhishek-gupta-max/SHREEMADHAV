import { Component } from 'react';
import { StateMessage } from './StateMessage.jsx';

/**
 * Catches render errors in a subtree so one broken section never blanks the
 * whole page. A failed lazy-loaded chunk (often after a new deployment) is
 * recovered by reloading once.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    const chunkFailed = /Failed to fetch dynamically imported module|Importing a module script failed/i.test(
      error?.message || '',
    );
    if (chunkFailed && !sessionStorage.getItem('smos.chunk-reload')) {
      sessionStorage.setItem('smos.chunk-reload', '1');
      window.location.reload();
      return;
    }
    if (import.meta.env.DEV) console.error(error);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset);
    return (
      <div className="page-wrap section--sm">
        <StateMessage
          tone="error"
          title="This section could not be displayed"
          text="Please reload the page. If the problem continues, contact us."
          onRetry={() => window.location.reload()}
          retryLabel="Reload page"
        />
      </div>
    );
  }
}
