import { Link } from 'react-router-dom';
import { Icon } from './Icon.jsx';
import { Spinner } from './Spinner.jsx';
import './Button.css';

/**
 * One button system for the whole product.
 *   variant: primary | secondary | ghost | link | danger | light
 *   size:    sm | md | lg
 * Renders a router <Link> when `to` is given, an <a> for `href`, else <button>.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  icon,
  iconPosition = 'end',
  loading = false,
  block = false,
  className = '',
  children,
  type = 'button',
  disabled,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', loading && 'is-loading', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading && <Spinner size={16} />}
      {icon && iconPosition === 'start' && !loading && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children && <span>{children}</span>}
      {icon && iconPosition === 'end' && <Icon name={icon} size={size === 'sm' ? 16 : 18} className="btn__icon-end" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
