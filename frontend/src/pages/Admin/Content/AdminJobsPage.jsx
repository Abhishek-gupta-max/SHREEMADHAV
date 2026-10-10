import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { adminService } from '../../../services/adminService.js';
import { useAsync } from '../../../hooks/useAsync.js';
import { useListQuery } from '../../../hooks/useListQuery.js';
import { PATHS } from '../../../constants/publicRoutes.js';
import { JOB_STATUSES } from '../../../constants/admin.js';
import en from '../../../i18n/locales/en.js';
import { formatDate } from '../../../utils/format.js';
import { Button } from '../../../components/common/Button.jsx';
import { Icon } from '../../../components/common/Icon.jsx';
import { Skeleton, StateMessage } from '../../../components/common/StateMessage.jsx';
import { PageHeader, Pagination, StatusBadge } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';

export default function AdminJobsPage() {
  useBreadcrumbs([{ label: 'Openings' }]);
  const { canEdit } = useAuth();
  const { query, update } = useListQuery();
  const { data, loading, error, reload } = useAsync((signal) => adminService.jobs({ ...query, limit: 20 }, { signal }), [JSON.stringify(query)]);
  const rows = data?.data || [];
  const base = `${PATHS.admin}/openings`;

  return (
    <>
      <PageHeader
        title="Openings"
        description="Job openings listed on the Requirements page under Current Openings. Only published openings are visible to the public."
        actions={
          canEdit && (
            <Button to={`${base}/new`} size="sm" icon="plus" iconPosition="start">
              New opening
            </Button>
          )
        }
      />
      <section className="panel">
        <div className="status-tabs" role="toolbar" aria-label="Filter by status">
          <button type="button" aria-pressed={!query.status} onClick={() => update({ status: '' })}>
            All
          </button>
          {JOB_STATUSES.map((status) => (
            <button key={status.value} type="button" aria-pressed={query.status === status.value} onClick={() => update({ status: status.value })}>
              {status.label}
            </button>
          ))}
        </div>

        {error && !loading ? (
          <StateMessage tone="error" title="Openings could not be loaded" text={error.message} onRetry={reload} />
        ) : !loading && rows.length === 0 ? (
          <StateMessage
            icon="briefcase"
            title="No openings"
            text="The Requirements page shows a 'register your profile' message until an opening is published."
            action={
              canEdit && (
                <Button to={`${base}/new`} size="sm" icon="plus" iconPosition="start">
                  New opening
                </Button>
              )
            }
          />
        ) : (
          <div className="table-wrap" aria-busy={loading}>
            <table className="data-table data-table--responsive">
              <thead>
                <tr>
                  <th scope="col">Opening</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="num">
                    Applications
                  </th>
                  <th scope="col">Published</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0
                  ? Array.from({ length: 4 }, (_, index) => (
                      <tr key={index}>
                        <td colSpan={6}>
                          <Skeleton height={14} />
                        </td>
                      </tr>
                    ))
                  : rows.map((job) => (
                      <tr key={job.id}>
                        <td data-label="" className="cell-full">
                          <div className="cell-primary">
                            <Link to={`${base}/${job.id}`}>{job.title}</Link>
                            <span>{[job.location, job.country, job.sector].filter(Boolean).join(' · ') || '—'}</span>
                          </div>
                        </td>
                        <td data-label="Type">{en.careers.employmentTypes[job.employment_type]}</td>
                        <td data-label="Status">
                          <StatusBadge status={job.status} />
                        </td>
                        <td data-label="Applications" className="num">
                          {job.status !== 'draft' && Number(job.application_count) > 0 ? (
                            <Link to={`${PATHS.admin}/applications?q=${encodeURIComponent(job.title)}`}>{job.application_count}</Link>
                          ) : (
                            job.application_count
                          )}
                        </td>
                        <td data-label="Published" className="text-muted">
                          {job.published_at ? formatDate(job.published_at) : '—'}
                        </td>
                        <td data-label="">
                          <div className="row-actions">
                            {job.status === 'published' && (
                              <a className="icon-button" href={`${PATHS.requirements}/${job.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${job.title} on the website`}>
                                <Icon name="external" size={16} />
                              </a>
                            )}
                            <Link className="icon-button" to={`${base}/${job.id}`} aria-label={`Edit ${job.title}`}>
                              <Icon name="edit" size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={data?.meta} onPage={(page) => update({ page })} />
      </section>
    </>
  );
}
