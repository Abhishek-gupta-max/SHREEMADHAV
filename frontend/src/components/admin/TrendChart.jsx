import { useId, useMemo, useState } from 'react';
import { formatDate } from '../../utils/format.js';
import { useElementWidth } from '../../hooks/useElementWidth.js';

const HEIGHT = 200;
const PAD = { top: 12, right: 8, bottom: 26, left: 32 };
const GAP = 2; // surface gap between adjacent bars

function niceMax(value) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude * 4 >= value) * magnitude;
  return step * 4;
}

/**
 * Daily applications as thin bars (single series → no legend; the panel
 * title names it). Hover/focus shows a tooltip; a table view is available.
 */
export function TrendChart({ data = [] }) {
  const [hover, setHover] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [wrapRef, width] = useElementWidth(720);
  const id = useId();

  const max = useMemo(() => niceMax(Math.max(0, ...data.map((d) => d.total))), [data]);
  const total = data.reduce((sum, d) => sum + d.total, 0);
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const slot = innerW / Math.max(1, data.length);
  const barW = Math.max(2, slot - GAP);
  const ticks = [0, max / 2, max];
  const y = (value) => PAD.top + innerH - (value / max) * innerH;

  // Rounded top corners only; the bar is anchored to the baseline.
  const barPath = (x, top, w) => {
    const h = PAD.top + innerH - top;
    if (h <= 0) return '';
    const r = Math.min(4, w / 2, h);
    return `M${x},${top + h} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${top + h} Z`;
  };

  return (
    <div className="trend" ref={wrapRef}>
      <div className="trend__summary">
        <span>
          <strong>{total}</strong> applications in the last {data.length} days
        </span>
        <button type="button" className="trend__toggle" onClick={() => setShowTable((v) => !v)} aria-expanded={showTable} aria-controls={`${id}-table`}>
          {showTable ? 'Show chart' : 'Show as table'}
        </button>
      </div>

      {showTable ? (
        <div className="table-wrap trend__table" id={`${id}-table`}>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col" className="num">
                  Applications
                </th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.day}>
                  <td>{formatDate(d.day)}</td>
                  <td className="num">{d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="trend__plot">
          <svg viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={`Bar chart of daily applications over the last ${data.length} days, ${total} in total.`}>
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} className={tick === 0 ? 'trend__baseline' : 'trend__grid'} />
                <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="trend__axis">
                  {tick}
                </text>
              </g>
            ))}
            {data.map((d, index) => {
              const x = PAD.left + index * slot + GAP / 2;
              const every = width < 480 ? 14 : 7;
              const showLabel = index === 0 || index === data.length - 1 || (index % every === 0 && data.length - 1 - index > every / 2);
              return (
                <g key={d.day}>
                  {d.total > 0 && <path d={barPath(x, y(d.total), barW)} className={`trend__bar ${hover === index ? 'is-hover' : ''}`} />}
                  {showLabel && (
                    <text x={x + barW / 2} y={HEIGHT - 6} textAnchor="middle" className="trend__axis">
                      {formatDate(d.day, 'en', { day: 'numeric', month: 'short' })}
                    </text>
                  )}
                  {/* Hit target spans the full column, larger than the mark. */}
                  <rect
                    x={PAD.left + index * slot}
                    y={PAD.top}
                    width={slot}
                    height={innerH}
                    fill="transparent"
                    onMouseEnter={() => setHover(index)}
                    onMouseLeave={() => setHover(null)}
                  />
                </g>
              );
            })}
          </svg>
          {hover !== null && data[hover] && (
            <div className="trend__tooltip" style={{ left: `${((PAD.left + hover * slot + slot / 2) / width) * 100}%` }} role="status">
              <span>{formatDate(data[hover].day, 'en', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <strong>
                {data[hover].total} application{data[hover].total === 1 ? '' : 's'}
              </strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Ranked horizontal bars with labels and values in text ink. */
export function BarList({ items = [], formatLabel = (label) => label, emptyText = 'No data yet.' }) {
  const max = Math.max(1, ...items.map((item) => item.total));
  if (!items.length) return <p className="text-muted">{emptyText}</p>;
  return (
    <ul role="list" className="bar-list">
      {items.map((item) => (
        <li key={item.label}>
          <div className="bar-list__row">
            <span className="bar-list__label">{formatLabel(item.label)}</span>
            <span className="bar-list__value">{item.total}</span>
          </div>
          <span className="bar-list__track" aria-hidden="true">
            <span style={{ width: `${(item.total / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
