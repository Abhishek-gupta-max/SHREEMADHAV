import { Link } from 'react-router-dom';
import { PATHS } from '../../constants/publicRoutes.js';
import './Logo.css';

// Brand lock-up: the official ShreeMadhav emblem plus the company wordmark.
// The emblem is served from /brand/logo-256.{webp,png} (master: logo-1024.png).
// On dark surfaces (tone="light") it sits on a white badge so the navy parts
// of the emblem keep their contrast.
export function Logo({ tone = 'dark', to = PATHS.home, size = 'md', onClick }) {
  return (
    <Link to={to} className={`logo logo--${tone} logo--${size}`} onClick={onClick} aria-label="ShreeMadhav Overseas Solutions — Home">
      <span className="logo__mark">
        <picture>
          <source srcSet="/brand/logo-256.webp" type="image/webp" />
          <img src="/brand/logo-256.png" alt="" width="256" height="256" decoding="async" />
        </picture>
      </span>
      <span className="logo__text" aria-hidden="true">
        <span className="logo__name">ShreeMadhav</span>
        <span className="logo__tagline">Overseas Solutions</span>
      </span>
    </Link>
  );
}
