import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { adminService } from '../../../services/adminService.js';
import { useAsync } from '../../../hooks/useAsync.js';
import { useListQuery } from '../../../hooks/useListQuery.js';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue.js';
import { ENQUIRY_STATUSES } from '../../../constants/admin.js';
import { ENQUIRY_TYPES } from '../../../constants/options.js';
import en from '../../../i18n/locales/en.js';
import { formatDateTime, formatRelative, telHref } from '../../../utils/format.js';
import { Button } from '../../../components/common/Button.jsx';
import { Icon } from '../../../components/common/Icon.jsx';
import { Skeleton, StateMessage } from '../../../components/common/StateMessage.jsx';
import { SelectField, TextField } from '../../../components/forms/Fields.jsx';
import { ConfirmDialog, Drawer, PageHeader, Pagination, StatusBadge } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';

const typeLabel = (type) => en.contact.enquiryTypes[type] || type;

export default function EnquiriesPage() {
  useBreadcrumbs([{ label: 'Enquiries' }]);
  const { canEdit } = useAuth();
  const toast = useToast();
  const { query, update } = useListQuery();
  const [search, setSearch] = useState(query.q || '');
  const debounced = useDebouncedValue(search, 350);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if ((query.q || '') !== debounced) update({ q: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data, loading, error, reload, setData } = useAsync(
    (signal) => adminService.enquiries({ ...query, limit: 20 }, { signal }),
    [JSON.stringify(query)],
  );
  const rows = data?.data || [];

  const changeStatus = async (status) => {
    setSaving(true);
    try {
      const { data: updated } = await adminService.updateEnquiry(selected.id, { status });
      setSelected(updated);
      setData((current) => ({ ...current, data: current.data.map((row) => (row.id === updated.id ? { ...row, status } : row)) }));
      toast.success(`Marked as ${ENQUIRY_STATUSES.find((s) => s.value === status)?.label.toLowerCase()}.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await adminService.deleteEnquiry(selected.id);
      toast.success('Enquiry deleted.');
      setConfirmDelete(false);
      setSelected(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const open = (row) => {
    setSelected(row);
    // Opening a new enquiry moves it into progress automatically.
    if (row.status === 'new' && canEdit) {
      adminService
        .updateEnquiry(row.id, { status: 'in_progress' })
        .then(({ data: updated }) => {
          setSelected((current) => (current?.id === updated.id ? updated : current));
          setData((current) => ({ ...current, data: current.data.map((item) => (item.id === updated.id ? updated : item)) }));
        })
        .catch(() => {});
    }
  };

  return (
    <>
      <PageHeader title="Enquiries" description="Messages sent through the contact page." />
      <section className="panel">
        <div className="status-tabs" role="toolbar" aria-label="Filter by status">
          <button type="button" aria-pressed={!query.status} onClick={() => update({ status: '' })}>
            All
          </button>
          {ENQUIRY_STATUSES.map((status) => (
            <button key={status.value} type="button" aria-pressed={query.status === status.value} onClick={() => update({ status: status.value })}>
              {status.label}
            </button>
          ))}
        </div>
        <div className="toolbar">
          <div className="toolbar__search">
            <TextField id="enq-q" label="Search" type="search" placeholder="Name, email, phone or subject" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Icon name="search" size={16} />
          </div>
          <SelectField
            id="enq-type"
            className="toolbar__filter"
            label="Topic"
            placeholder="All topics"
            value={query.enquiryType || ''}
            onChange={(event) => update({ enquiryType: event.target.value })}
            options={ENQUIRY_TYPES.map((value) => ({ value, label: typeLabel(value) }))}
          />
        </div>

        {error && !loading ? (
          <StateMessage tone="error" title="Enquiries could not be loaded" text={error.message} onRetry={reload} />
        ) : !loading && rows.length === 0 ? (
          <StateMessage icon="inbox" title="No enquiries" text="Messages from the contact page will appear here." />
        ) : (
          <div className="table-wrap" aria-busy={loading}>
            <table className="data-table data-table--responsive">
              <thead>
                <tr>
                  <th scope="col">From</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Topic</th>
                  <th scope="col">Status</th>
                  <th scope="col">Received</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0
                  ? Array.from({ length: 5 }, (_, index) => (
                      <tr key={index}>
                        <td colSpan={6}>
                          <Skeleton height={14} />
                        </td>
                      </tr>
                    ))
                  : rows.map((row) => (
                      <tr key={row.id}>
                        <td data-label="" className="cell-full">
                          <div className="cell-primary">
                            <strong>{row.full_name}</strong>
                            <span>{row.email}</span>
                          </div>
                        </td>
                        <td data-label="Subject">{row.subject}</td>
                        <td data-label="Topic">{typeLabel(row.enquiry_type)}</td>
                        <td data-label="Status">
                          <StatusBadge status={row.status} />
                        </td>
                        <td data-label="Received" className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                          {formatRelative(row.created_at)}
                        </td>
                        <td data-label="">
                          <div className="row-actions">
                            <Button variant="secondary" size="sm" onClick={() => open(row)}>
                              Open
                            </Button>
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

      <Drawer
        open={Boolean(selected)}
        title={selected?.subject}
        subtitle={selected ? `${typeLabel(selected.enquiry_type)} · ${formatDateTime(selected.created_at)}` : ''}
        onClose={() => setSelected(null)}
        footer={
          selected && (
            <>
              <Button href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`} icon="mail" iconPosition="start">
                Reply by email
              </Button>
              {canEdit && (
                <Button variant="ghost" icon="trash" iconPosition="start" onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="admin-stack">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{selected.full_name}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={selected.status} />
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{selected.phone ? <a href={telHref(selected.phone)}>{selected.phone}</a> : <span className="text-muted">Not provided</span>}</dd>
              </div>
            </dl>
            <div>
              <p className="field__label" style={{ marginBottom: 8 }}>
                Message
              </p>
              <p style={{ whiteSpace: 'pre-line', color: 'var(--ink)' }}>{selected.message}</p>
            </div>
            {canEdit && (
              <SelectField id="enq-status" label="Status" value={selected.status} disabled={saving} onChange={(event) => changeStatus(event.target.value)} options={ENQUIRY_STATUSES} />
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this enquiry?"
        message="The message will be permanently removed."
        confirmLabel="Delete"
        busy={saving}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
