import { Icon } from './Icon.jsx';
import { Button } from './Button.jsx';
import './StateMessage.css';

/** Shared empty / error state with an optional action. */
export function StateMessage({ tone = 'empty', icon, title, text, action, onRetry, retryLabel = 'Try again', compact = false }) {
  const iconName = icon || (tone === 'error' ? 'alert-circle' : 'inbox');
  return (
    <div className={`state-message state-message--${tone} ${compact ? 'state-message--compact' : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      <span className="state-message__icon">
        <Icon name={iconName} size={compact ? 20 : 24} />
      </span>
      {title && <p className="state-message__title">{title}</p>}
      {text && <p className="state-message__text">{text}</p>}
      {(action || onRetry) && (
        <div className="state-message__actions">
          {onRetry && (
            <Button variant="secondary" size="sm" icon="refresh" iconPosition="start" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 16, style, className = '' }) {
  return <span className={`skeleton ${className}`} style={{ width, height, ...style }} aria-hidden="true" />;
}
