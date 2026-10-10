import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../../services/adminService.js';
import { useAsync } from '../../../hooks/useAsync.js';
import { useListQuery } from '../../../hooks/useListQuery.js';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue.js';
import { PATHS } from '../../../constants/publicRoutes.js';
import { formatDate, formatFileSize } from '../../../utils/format.js';
import { Icon } from '../../../components/common/Icon.jsx';
import { Skeleton, StateMessage } from '../../../components/common/StateMessage.jsx';
import { SelectField, TextField } from '../../../components/forms/Fields.jsx';
import { PageHeader, Pagination, StatusBadge } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';

export default function DocumentsPage() {
  useBreadcrumbs([{ label: 'Documents' }]);
  const { query, update } = useListQuery();
  const [search, setSearch] = useState(query.q || '');
  const debounced = useDebouncedValue(search, 350);

  useEffect(() => {
    if ((query.q || '') !== debounced) update({ q: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data, loading, error, reload } = useAsync((signal) => adminService.documents({ ...query, limit: 25 }, { signal }), [JSON.stringify(query)]);
  const rows = data?.data || [];

  return (
    <>
      <PageHeader title="Documents" description="CVs and supporting files uploaded with applications. Files are stored privately and opened through your session." />
      <section className="panel">
        <div className="toolbar">
          <div className="toolbar__search">
            <TextField id="doc-q" label="Search" type="search" placeholder="File name, candidate or application ID" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Icon name="search" size={16} />
          </div>
          <SelectField
            id="doc-type"
            className="toolbar__filter"
            label="Type"
            placeholder="All documents"
            value={query.docType || ''}
            onChange={(event) => update({ docType: event.target.value })}
            options={[
              { value: 'cv', label: 'CV / Resume' },
              { value: 'supporting', label: 'Supporting' },
            ]}
          />
        </div>

        {error && !loading ? (
          <StateMessage tone="error" title="Documents could not be loaded" text={error.message} onRetry={reload} />
        ) : !loading && rows.length === 0 ? (
          <StateMessage icon="file" title="No documents found" text={query.q || query.docType ? 'Try a different search.' : 'Uploaded files will appear here.'} />
        ) : (
          <div className="table-wrap" aria-busy={loading}>
            <table className="data-table data-table--responsive">
              <thead>
                <tr>
                  <th scope="col">File</th>
                  <th scope="col">Type</th>
                  <th scope="col">Candidate</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="num">
                    Size
                  </th>
                  <th scope="col">Uploaded</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0
                  ? Array.from({ length: 6 }, (_, index) => (
                      <tr key={index}>
                        <td colSpan={7}>
                          <Skeleton height={14} />
                        </td>
                      </tr>
                    ))
                  : rows.map((doc) => (
                      <tr key={doc.id}>
                        <td data-label="" className="cell-full">
                          <div className="cell-primary">
                            <strong style={{ overflowWrap: 'anywhere' }}>{doc.original_name}</strong>
                          </div>
                        </td>
                        <td data-label="Type">{doc.doc_type === 'cv' ? 'CV' : 'Supporting'}</td>
                        <td data-label="Candidate">
                          <div className="cell-primary">
                            <Link to={`${PATHS.admin}/applications/${doc.application_id}`}>{doc.full_name}</Link>
                            <span className="mono">{doc.reference_no}</span>
                          </div>
                        </td>
                        <td data-label="Status">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td data-label="Size" className="num">
                          {formatFileSize(doc.size_bytes)}
                        </td>
                        <td data-label="Uploaded" className="text-muted">
                          {formatDate(doc.created_at)}
                        </td>
                        <td data-label="">
                          <div className="row-actions">
                            <a className="icon-button" href={adminService.documentUrl(doc.application_id, doc.id, { inline: true })} target="_blank" rel="noopener noreferrer" aria-label={`Open ${doc.original_name}`}>
                              <Icon name="eye" size={16} />
                            </a>
                            <a className="icon-button" href={adminService.documentUrl(doc.application_id, doc.id)} aria-label={`Download ${doc.original_name}`}>
                              <Icon name="download" size={16} />
                            </a>
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
