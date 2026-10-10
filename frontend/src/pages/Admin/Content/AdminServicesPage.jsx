import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { adminService } from '../../../services/adminService.js';
import { useAsync } from '../../../hooks/useAsync.js';
import { PATHS } from '../../../constants/publicRoutes.js';
import { formatRelative } from '../../../utils/format.js';
import { Button } from '../../../components/common/Button.jsx';
import { Icon } from '../../../components/common/Icon.jsx';
import { Skeleton, StateMessage } from '../../../components/common/StateMessage.jsx';
import { PageHeader } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';

export default function AdminServicesPage() {
  useBreadcrumbs([{ label: 'Services' }]);
  const { canEdit } = useAuth();
  const { data, loading, error, reload } = useAsync((signal) => adminService.services({ signal }), [], { initialData: [] });
  const base = `${PATHS.admin}/services`;

  return (
    <>
      <PageHeader
        title="Services"
        description="The services shown on the website, in display order. Featured services appear with a photograph on the Services page."
        actions={
          canEdit && (
            <Button to={`${base}/new`} size="sm" icon="plus" iconPosition="start">
              Add service
            </Button>
          )
        }
      />
      <section className="panel">
        {error ? (
          <StateMessage tone="error" title="Services could not be loaded" text={error.message} onRetry={reload} />
        ) : !loading && data.length === 0 ? (
          <StateMessage icon="layers" title="No services yet" text="Add the first service to show it on the website." />
        ) : (
          <div className="table-wrap">
            <table className="data-table data-table--responsive">
              <thead>
                <tr>
                  <th scope="col" className="num">
                    Order
                  </th>
                  <th scope="col">Service</th>
                  <th scope="col">Languages</th>
                  <th scope="col">Visibility</th>
                  <th scope="col">Updated</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && data.length === 0
                  ? Array.from({ length: 4 }, (_, index) => (
                      <tr key={index}>
                        <td colSpan={6}>
                          <Skeleton height={14} />
                        </td>
                      </tr>
                    ))
                  : data.map((service) => (
                      <tr key={service.id}>
                        <td data-label="Order" className="num">
                          {service.sortOrder}
                        </td>
                        <td data-label="" className="cell-full">
                          <div className="cell-primary" style={{ gridTemplateColumns: 'auto 1fr', columnGap: 12, alignItems: 'center' }}>
                            <Icon name={service.icon} size={20} />
                            <span style={{ display: 'grid', fontSize: 'inherit' }}>
                              <Link to={`${base}/${service.id}`}>{service.translations.en?.title}</Link>
                              <span className="mono" style={{ fontSize: 'var(--text-xs)' }}>
                                /{service.slug}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td data-label="Languages">{['en', 'hi', 'pa'].filter((code) => service.translations[code]).map((code) => code.toUpperCase()).join(' · ')}</td>
                        <td data-label="Visibility">
                          <span className={`badge badge--${service.isActive ? 'published' : 'closed'}`}>{service.isActive ? 'Visible' : 'Hidden'}</span>{' '}
                          {service.isFeatured && <span className="badge badge--shortlisted">Featured</span>}
                        </td>
                        <td data-label="Updated" className="text-muted">
                          {formatRelative(service.updatedAt)}
                        </td>
                        <td data-label="">
                          <div className="row-actions">
                            <Link className="icon-button" to={`${base}/${service.id}`} aria-label={`Edit ${service.translations.en?.title}`}>
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
      </section>
    </>
  );
}
