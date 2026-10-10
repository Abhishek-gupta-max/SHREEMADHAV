import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { adminService } from '../../../services/adminService.js';
import { useAsync } from '../../../hooks/useAsync.js';
import { PATHS } from '../../../constants/publicRoutes.js';
import { ACTIVITY_LABELS, APPLICATION_STATUSES } from '../../../constants/admin.js';
import { formatRelative, humanize } from '../../../utils/format.js';
import { optionLabel } from '../../../utils/labels.js';
import { Button } from '../../../components/common/Button.jsx';
import { Icon } from '../../../components/common/Icon.jsx';
import { Skeleton, StateMessage } from '../../../components/common/StateMessage.jsx';
import { PageHeader, Panel, StatusBadge } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';
import { BarList, TrendChart } from '../../../components/admin/TrendChart.jsx';
import './DashboardPage.css';

const KPIS = [
  { key: 'total', label: 'Total applications', icon: 'users' },
  { key: 'new', label: 'New', status: 'new', icon: 'inbox' },
  { key: 'under_review', label: 'Under review', status: 'under_review', icon: 'eye' },
  { key: 'shortlisted', label: 'Shortlisted', status: 'shortlisted', icon: 'check-circle' },
  { key: 'selected', label: 'Selected', status: 'selected', icon: 'user-check' },
  { key: 'rejected', label: 'Rejected', status: 'rejected', icon: 'close' },
];

function greeting() {
  const hour = Number(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()));
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  useBreadcrumbs([{ label: 'Dashboard' }]);
  const { admin } = useAuth();
  const { data, loading, error, reload } = useAsync((signal) => adminService.dashboard({ signal }));
  const appsPath = `${PATHS.admin}/applications`;

  const header = (
    <PageHeader
      title={`${greeting()}, ${admin?.name?.split(' ')[0] || 'there'}`}
      description="Here is where things stand across applications and enquiries."
      actions={
        <Button to={appsPath} size="sm" icon="arrow-right">
          Review applications
        </Button>
      }
    />
  );

  if (error && !data) {
    return (
      <>
        {header}
        <div className="panel">
          <StateMessage tone="error" title="The dashboard could not be loaded" text={error.message} onRetry={reload} />
        </div>
      </>
    );
  }

  const apps = data?.applications;
  const valueOf = (key) => (key === 'total' ? apps?.total : apps?.byStatus?.[key]);

  return (
    <>
      {header}

      <div className="kpis" aria-busy={loading}>
        {KPIS.map((kpi) => (
          <Link key={kpi.key} className="kpi" to={kpi.status ? `${appsPath}?status=${kpi.status}` : appsPath}>
            <span className="kpi__label">
              <Icon name={kpi.icon} size={14} />
              {kpi.label}
            </span>
            <span className="kpi__value">{loading && !data ? <Skeleton width={48} height={30} /> : valueOf(kpi.key) ?? 0}</span>
            {kpi.key === 'total' && apps && <span className="kpi__meta">{apps.lastSevenDays} in the last 7 days</span>}
            {kpi.key === 'new' && apps && <span className="kpi__meta">{apps.pending} awaiting a decision</span>}
            {kpi.key === 'shortlisted' && apps && <span className="kpi__meta">{apps.reviewed} shortlisted or interviewing</span>}
          </Link>
        ))}
      </div>

      <div className="admin-grid-2">
        <div className="admin-stack">
          <Panel title="Applications received" description="Daily submissions, last 30 days">
            {data ? <TrendChart data={data.trend} /> : <Skeleton height={220} />}
          </Panel>

          <Panel
            title="Recent applications"
            actions={
              <Button to={appsPath} variant="ghost" size="sm" icon="arrow-right">
                View all
              </Button>
            }
            flush
          >
            {data && data.recentApplications.length === 0 ? (
              <StateMessage title="No applications yet" text="New applications submitted on the website will appear here." compact />
            ) : (
              <div className="table-wrap">
                <table className="data-table data-table--responsive">
                  <thead>
                    <tr>
                      <th scope="col">Candidate</th>
                      <th scope="col">Preference</th>
                      <th scope="col">Status</th>
                      <th scope="col">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentApplications || []).map((row) => (
                      <tr key={row.id}>
                        <td data-label="" className="cell-full">
                          <div className="cell-primary">
                            <Link to={`${appsPath}/${row.id}`}>{row.full_name}</Link>
                            <span className="mono">{row.reference_no}</span>
                          </div>
                        </td>
                        <td data-label="Preference">
                          <div className="cell-primary">
                            <span style={{ color: 'var(--ink)', fontSize: 'inherit' }}>{row.preferred_position}</span>
                            <span>{row.preferred_country}</span>
                          </div>
                        </td>
                        <td data-label="Status">
                          <StatusBadge status={row.status} />
                        </td>
                        <td data-label="Received" className="text-muted">
                          {formatRelative(row.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Recent activity">
            {data && data.recentActivity.length === 0 && <p className="text-muted">No activity recorded yet.</p>}
            <ol className="activity" role="list">
              {(data?.recentActivity || []).map((item) => (
                <li key={item.id}>
                  <span className="activity__dot" aria-hidden="true" />
                  <div>
                    <p>
                      <strong>{ACTIVITY_LABELS[item.action] || humanize(item.action)}</strong>
                      {item.details?.to && <> → {humanize(item.details.to)}</>}
                    </p>
                    <p className="text-muted">
                      {item.candidate_name || item.details?.title || item.details?.subject || ''}
                      {item.candidate_name || item.details?.title || item.details?.subject ? ' · ' : ''}
                      {item.admin_name || 'Website'} · {formatRelative(item.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="admin-stack">
          <Panel title="Pipeline" description="Applications by status">
            {apps ? (
              <ul role="list" className="pipeline">
                {APPLICATION_STATUSES.map((status) => (
                  <li key={status.value}>
                    <Link to={`${appsPath}?status=${status.value}`}>
                      <StatusBadge status={status.value} />
                      <span className="pipeline__value">{apps.byStatus[status.value]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Skeleton height={220} />
            )}
          </Panel>

          <Panel
            title="Enquiries"
            actions={
              <Button to={`${PATHS.admin}/enquiries`} variant="ghost" size="sm" icon="arrow-right">
                Open
              </Button>
            }
          >
            <dl className="mini-stats">
              <div>
                <dt>New</dt>
                <dd>{data?.enquiries.new ?? '—'}</dd>
              </div>
              <div>
                <dt>In progress</dt>
                <dd>{data?.enquiries.inProgress ?? '—'}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{data?.enquiries.total ?? '—'}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Preferred countries">
            <BarList items={data?.topCountries || []} emptyText="Appears once applications arrive." />
          </Panel>

          <Panel title="Preferred sectors">
            <BarList items={data?.topSectors || []} formatLabel={(value) => optionLabel('sector', value)} emptyText="Appears once applications arrive." />
          </Panel>

        </div>
      </div>
    </>
  );
}
