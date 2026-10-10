import './Spinner.css';

export function Spinner({ size = 20, label }) {
  return (
    <span className="spinner" style={{ width: size, height: size }} role={label ? 'status' : undefined}>
      {label && <span className="visually-hidden">{label}</span>}
    </span>
  );
}

/** Full-area loading indicator used while lazy pages load. */
export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="page-loader">
      <Spinner size={28} label={label} />
    </div>
  );
}
