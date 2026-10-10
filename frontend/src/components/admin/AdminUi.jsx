import { useRef } from 'react';
import { STATUS_LABELS } from '../../constants/admin.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';

// Small, shared back-office components.

export function PageHeader({ title, description, actions }) {
  return (
    <header className="admin-page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-page-header__actions">{actions}</div>}
    </header>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export function Panel({ title, description, actions, children, flush = false, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <div className="panel__head">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={`panel__body ${flush ? 'panel__body--flush' : ''}`}>{children}</div>
    </section>
  );
}

/** Sortable column header. */
export function SortHeader({ label, column, sort, order, onSort }) {
  const active = sort === column;
  return (
    <th scope="col" aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : undefined}>
      <button type="button" className="sort-button" data-active={active} onClick={() => onSort(column)}>
        {label}
        <Icon name={active ? (order === 'asc' ? 'chevron-up' : 'chevron-down') : 'sort'} size={14} />
      </button>
    </th>
  );
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.total === 0) return null;
  const { page, totalPages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Compact range: first, last, current ±1.
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  return (
    <nav className="pagination" aria-label="Pagination">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div className="pagination__controls">
        <button type="button" className="pagination__page" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <Icon name="chevron-left" size={16} />
        </button>
        {pages.map((number, index) => (
          <span key={number} style={{ display: 'contents' }}>
            {index > 0 && number - pages[index - 1] > 1 && <span aria-hidden="true">…</span>}
            <button
              type="button"
              className="pagination__page"
              aria-current={number === page ? 'page' : undefined}
              aria-label={`Page ${number}`}
              onClick={() => onPage(number)}
            >
              {number}
            </button>
          </span>
        ))}
        <button type="button" className="pagination__page" onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </nav>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'danger', busy = false, onConfirm, onCancel }) {
  const ref = useRef(null);
  useFocusTrap(ref, open, onCancel);
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div ref={ref} className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="dialog__actions">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Drawer({ open, title, subtitle, onClose, children, footer }) {
  const ref = useRef(null);
  useFocusTrap(ref, open, onClose);
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside ref={ref} className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer__head">
          <div>
            <h2 id="drawer-title">{title}</h2>
            {subtitle && <p className="text-muted">{subtitle}</p>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </aside>
    </div>
  );
}
