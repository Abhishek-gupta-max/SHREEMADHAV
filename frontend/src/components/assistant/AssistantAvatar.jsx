// Lightweight 2D advisor avatar: inline SVG animated with CSS only.
// States: idle | listening | thinking | speaking (see Assistant.css).
// Always shown with an "AI" badge so it is never mistaken for a real person.

export function AssistantAvatar({ state = 'idle', size = 56, badge = 'AI' }) {
  return (
    <span className={`sm-ai-avatar is-${state}`} style={{ width: size, height: size }} aria-hidden="true">
      <span className="sm-ai-avatar__ring" />
      <svg viewBox="0 0 64 64" className="sm-ai-avatar__svg">
        <defs>
          <linearGradient id="smAiBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1d4271" />
            <stop offset="1" stopColor="#0c2340" />
          </linearGradient>
          <clipPath id="smAiClip">
            <circle cx="32" cy="32" r="32" />
          </clipPath>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#smAiBg)" />
        <g clipPath="url(#smAiClip)">
          <g className="sm-ai-avatar__body">
            {/* Blazer, shirt and gold lapel pin */}
            <path d="M10 66c1-12 9-18 22-18s21 6 22 18Z" fill="#13325a" />
            <path d="M26 48.5 32 58l6-9.5c-2-.6-4-.9-6-.9s-4 .3-6 .9Z" fill="#f2f5f9" />
            <path d="M32 52.5 30 58h4Z" fill="#1f6b4e" />
            <circle cx="43" cy="55" r="1.6" fill="#cfa95e" />
            {/* Neck */}
            <path d="M28 41h8v7.5c-1.2 1-2.6 1.5-4 1.5s-2.8-.5-4-1.5Z" fill="#c98f6b" />
            {/* Head */}
            <g className="sm-ai-avatar__head">
              <ellipse cx="32" cy="30" rx="11" ry="12.5" fill="#dba27f" />
              <path d="M20.5 29c-.6-9 4.6-15 11.6-15 7.2 0 12.2 5.6 11.4 15-1.4-4.8-4.4-7.6-8.6-8.6-3.4 2.4-9.6 3.6-14.4 8.6Z" fill="#2a2522" />
              <g className="sm-ai-avatar__eyes" fill="#1b2129">
                <ellipse cx="27.6" cy="30.5" rx="1.35" ry="1.6" />
                <ellipse cx="36.4" cy="30.5" rx="1.35" ry="1.6" />
              </g>
              <path d="M25.6 27.2c1.2-.7 2.6-.8 3.8-.3M34.6 26.9c1.2-.5 2.6-.4 3.8.3" stroke="#2a2522" strokeWidth="0.9" fill="none" strokeLinecap="round" />
              <ellipse className="sm-ai-avatar__mouth" cx="32" cy="36.6" rx="2.6" ry="0.9" fill="#8a3b33" />
            </g>
          </g>
        </g>
      </svg>
      {badge && <span className="sm-ai-avatar__badge">{badge}</span>}
    </span>
  );
}
