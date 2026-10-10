import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../../services/adminService.js';
import { useAsync } from '../../../hooks/useAsync.js';
import { useListQuery } from '../../../hooks/useListQuery.js';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue.js';
import { PATHS } from '../../../constants/publicRoutes.js';
import { APPLICATION_STATUSES } from '../../../constants/admin.js';
import { OPPORTUNITY_TYPES, SECTORS } from '../../../constants/options.js';
import { formatDate } from '../../../utils/format.js';
import { optionLabel } from '../../../utils/labels.js';
import { Button } from '../../../components/common/Button.jsx';
import { Icon } from '../../../components/common/Icon.jsx';
import { Skeleton, StateMessage } from '../../../components/common/StateMessage.jsx';
import { SelectField, TextField } from '../../../components/forms/Fields.jsx';
import { PageHeader, Pagination, SortHeader, StatusBadge } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';

const FILTER_KEYS = ['q', 'status', 'preferredCountry', 'preferredSector', 'opportunity', 'from', 'to'];

export default function ApplicationsPage() {
  useBreadcrumbs([{ label: 'Applications' }]);
  const { query, update, reset } = useListQuery({ sort: 'created_at', order: 'desc' });
  const [search, setSearch] = useState(query.q || '');
  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    if ((query.q || '') !== debouncedSearch) update({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const queryKey = JSON.stringify(query);
  const { data, loading, error, reload } = useAsync(
    (signal) => adminService.applications({ ...query, limit: 20 }, { signal }),
    [queryKey],
  );
  const filters = useAsync((signal) => adminService.applicationFilters({ signal }), [], { initialData: { countries: [] } });

  const rows = data?.data || [];
  const meta = data?.meta;
  const counts = meta?.statusCounts || {};
  const totalAll = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const activeFilters = FILTER_KEYS.some((key) => query[key]);

  const onSort = (column) => {
    const order = query.sort === column && query.order === 'asc' ? 'desc' : 'asc';
    update({ sort: column, order });
  };

  const sortProps = { sort: query.sort, order: query.order, onSort };

  return (
    <>
      <PageHeader
        title="Applications"
        description="Every application submitted through the website, newest first."
      />

      <section className="panel">
        <div className="status-tabs" role="toolbar" aria-label="Filter by status">
          <button type="button" aria-pressed={!query.status} onClick={() => update({ status: '' })}>
            All <span className="status-tabs__count">{totalAll}</span>
          </button>
          {APPLICATION_STATUSES.map((status) => (
            <button key={status.value} type="button" aria-pressed={query.status === status.value} onClick={() => update({ status: status.value })}>
              {status.label} <span className="status-tabs__count">{counts[status.value] || 0}</span>
            </button>
          ))}
        </div>

        <div className="toolbar">
          <div className="toolbar__search">
            <TextField
              id="filter-q"
              label="Search"
              type="search"
              placeholder="Name, email, phone, ID or position"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Icon name="search" size={16} />
          </div>
          <SelectField
            id="filter-country"
            className="toolbar__filter"
            label="Preferred country"
            placeholder="Any country"
            value={query.preferredCountry || ''}
            onChange={(event) => update({ preferredCountry: event.target.value })}
            options={(filters.data?.countries || []).map((value) => ({ value, label: value }))}
          />
          <SelectField
            id="filter-sector"
            className="toolbar__filter"
            label="Sector"
            placeholder="Any sector"
            value={query.preferredSector || ''}
            onChange={(event) => update({ preferredSector: event.target.value })}
            options={SECTORS.map((value) => ({ value, label: optionLabel('sector', value) }))}
          />
          <SelectField
            id="filter-opportunity"
            className="toolbar__filter"
            label="Opportunity"
            placeholder="Any type"
            value={query.opportunity || ''}
            onChange={(event) => update({ opportunity: event.target.value })}
            options={OPPORTUNITY_TYPES.map((value) => ({ value, label: optionLabel('opportunity', value) }))}
          />
          <TextField id="filter-from" className="toolbar__filter" label="From" type="date" value={query.from || ''} max={query.to || undefined} onChange={(event) => update({ from: event.target.value })} />
          <TextField id="filter-to" className="toolbar__filter" label="To" type="date" value={query.to || ''} min={query.from || undefined} onChange={(event) => update({ to: event.target.value })} />
          {activeFilters && (
            <div className="toolbar__actions">
              <Button
                variant="ghost"
                size="sm"
                icon="close"
                iconPosition="start"
                onClick={() => {
                  setSearch('');
                  reset();
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {error && !loading ? (
          <StateMessage tone="error" title="Applications could not be loaded" text={error.message} onRetry={reload} />
        ) : !loading && rows.length === 0 ? (
          <StateMessage
            title={activeFilters ? 'No applications match these filters' : 'No applications yet'}
            text={activeFilters ? 'Try a different search or clear the filters.' : 'Applications submitted on the website will appear here.'}
          />
        ) : (
          <div className="table-wrap" aria-busy={loading}>
            <table className="data-table data-table--responsive">
              <thead>
                <tr>
                  <SortHeader label="Candidate" column="full_name" {...sortProps} />
                  <SortHeader label="Preferred position" column="preferred_position" {...sortProps} />
                  <SortHeader label="Country" column="preferred_country" {...sortProps} />
                  <th scope="col">Sector</th>
                  <th scope="col" className="num">
                    Docs
                  </th>
                  <SortHeader label="Status" column="status" {...sortProps} />
                  <SortHeader label="Received" column="created_at" {...sortProps} />
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0
                  ? Array.from({ length: 6 }, (_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 8 }, (__, cell) => (
                          <td key={cell}>
                            <Skeleton height={14} width={cell === 0 ? 140 : 80} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : rows.map((row) => (
                      <tr key={row.id}>
                        <td data-label="" className="cell-full">
                          <div className="cell-primary">
                            <Link to={`${PATHS.admin}/applications/${row.id}`}>{row.full_name}</Link>
                            <span>
                              <span className="mono">{row.reference_no}</span> · {row.email}
                            </span>
                          </div>
                        </td>
                        <td data-label="Position">{row.preferred_position}</td>
                        <td data-label="Country">{row.preferred_country}</td>
                        <td data-label="Sector">{optionLabel('sector', row.preferred_sector)}</td>
                        <td data-label="Documents" className="num">
                          {row.document_count}
                        </td>
                        <td data-label="Status">
                          <StatusBadge status={row.status} />
                        </td>
                        <td data-label="Received" className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                          {formatDate(row.created_at)}
                        </td>
                        <td data-label="">
                          <div className="row-actions">
                            <Link className="icon-button" to={`${PATHS.admin}/applications/${row.id}`} aria-label={`Open application from ${row.full_name}`}>
                              <Icon name="arrow-right" size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} onPage={(page) => update({ page })} />
      </section>
    </>
  );
}
