import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Spinner } from '../common/Spinner.jsx';
import { AssistantAvatar } from './AssistantAvatar.jsx';
import { assistantStrings } from './assistantStrings.js';
import './Assistant.css';

// Floating entry point for the AI assistant, shown on every public page.
// The panel (chat, voice, knowledge) is code-split and only downloaded the
// first time a visitor opens it, so page load is unaffected.
const AssistantPanel = lazy(() => import('./AssistantPanel.jsx'));

/** If the assistant ever fails, hide it rather than affect the website. */
class AssistantBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error('[assistant]', error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function AssistantWidget() {
  return (
    <AssistantBoundary>
      <AssistantWidgetInner />
    </AssistantBoundary>
  );
}

function AssistantWidgetInner() {
  const { language } = useLanguage();
  const initialLang = language === 'hi' ? 'hi' : 'en';
  const s = assistantStrings(initialLang);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const launcherRef = useRef(null);
  const wasOpen = useRef(false);

  // Return focus to the launcher after the panel closes.
  useEffect(() => {
    if (wasOpen.current && !open) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  if (!open) {
    return (
      <button
        ref={launcherRef}
        type="button"
        className="sm-ai-launcher"
        onClick={() => {
          setMinimized(false);
          setOpen(true);
        }}
        aria-haspopup="dialog"
      >
        <AssistantAvatar size={40} badge={s.aiBadge} />
        <span className="sm-ai-launcher__label">{s.launcher}</span>
      </button>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="sm-ai-mini" role="status">
          <Spinner size={20} label={s.name} />
        </div>
      }
    >
      <AssistantPanel
        initialLang={initialLang}
        minimized={minimized}
        onMinimize={() => setMinimized(true)}
        onExpand={() => setMinimized(false)}
        onClose={() => setOpen(false)}
      />
    </Suspense>
  );
}
