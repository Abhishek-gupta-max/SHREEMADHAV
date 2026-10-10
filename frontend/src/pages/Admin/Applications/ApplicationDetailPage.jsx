import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { adminService } from '../../../services/adminService.js';
import { useAsync } from '../../../hooks/useAsync.js';
import { PATHS } from '../../../constants/publicRoutes.js';
import { ACTIVITY_LABELS, APPLICATION_STATUSES, STATUS_LABELS } from '../../../constants/admin.js';
import { formatDate, formatDateTime, formatFileSize, formatRelative, humanize, telHref } from '../../../utils/format.js';
import { optionLabel } from '../../../utils/labels.js';
import { Button } from '../../../components/common/Button.jsx';
import { Icon } from '../../../components/common/Icon.jsx';
import { PageLoader } from '../../../components/common/Spinner.jsx';
import { StateMessage } from '../../../components/common/StateMessage.jsx';
import { SelectField, TextareaField } from '../../../components/forms/Fields.jsx';
import { ConfirmDialog, Panel, StatusBadge } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';
import './ApplicationDetailPage.css';

function DetailList({ rows, single = false }) {
  return (
    <dl className={`detail-list ${single ? 'detail-list--single' : ''}`}>
      {rows.map(([term, value]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{value || <span className="text-muted">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

function ageFrom(dob) {
  const date = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  if (today < new Date(today.getFullYear(), date.getMonth(), date.getDate())) age -= 1;
  return age;
}

function describeActivity(item) {
  const label = ACTIVITY_LABELS[item.action] || humanize(item.action);
  if (item.action === 'application.status_changed' && item.details) {
    return `${label}: ${STATUS_LABELS[item.details.from] || item.details.from} → ${STATUS_LABELS[item.details.to] || item.details.to}`;
  }
  if (item.action === 'application.document_viewed' && item.details?.document) return `${label}: ${item.details.document}`;
  return label;
}

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { canEdit, isSuperAdmin } = useAuth();
  const { data, loading, error, reload } = useAsync((signal) => adminService.application(id, { signal }), [id]);

  const [status, setStatus] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const application = data?.application;
  useBreadcrumbs([
    { label: 'Applications', to: `${PATHS.admin}/applications` },
    { label: application?.reference_no || 'Application' },
  ]);

  if (loading && !data) return <PageLoader label="Loading application" />;
  if (error && !data) {
    return (
      <div className="panel">
        <StateMessage
          tone={error.status === 404 ? 'empty' : 'error'}
          title={error.status === 404 ? 'Application not found' : 'The application could not be loaded'}
          text={error.status === 404 ? 'It may have been deleted.' : error.message}
          onRetry={error.status === 404 ? undefined : reload}
          action={
            <Button to={`${PATHS.admin}/applications`} variant="secondary" size="sm">
              Back to applications
            </Button>
          }
        />
      </div>
    );
  }

  const { documents, notes, activity } = data;
  const selectedStatus = status ?? application.status;
  const statusChanged = selectedStatus !== application.status;

  const saveStatus = async (event) => {
    event.preventDefault();
    if (!statusChanged && !statusNote.trim()) return;
    setSavingStatus(true);
    try {
      await adminService.updateApplication(id, { status: selectedStatus, note: statusNote.trim() || undefined });
      toast.success(statusChanged ? `Status changed to ${STATUS_LABELS[selectedStatus]}.` : 'Note added.');
      setStatus(null);
      setStatusNote('');
      await reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  const addNote = async (event) => {
    event.preventDefault();
    if (note.trim().length < 2) return;
    setSavingNote(true);
    try {
      await adminService.addNote(id, note.trim());
      toast.success('Note added.');
      setNote('');
      await reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminService.deleteApplication(id);
      toast.success(`Application ${application.reference_no} deleted.`);
      navigate(`${PATHS.admin}/applications`, { replace: true });
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const currentIndex = APPLICATION_STATUSES.findIndex((item) => item.value === application.status);

  return (
    <>
      <header className="app-detail__header">
        <div>
          <p className="app-detail__ref">
            <span className="mono">{application.reference_no}</span>
            <StatusBadge status={application.status} />
          </p>
          <h1>{application.full_name}</h1>
          <p className="text-muted">
            Received {formatDateTime(application.created_at)} · {application.preferred_position} · {application.preferred_country}
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Button href={`mailto:${application.email}`} variant="secondary" size="sm" icon="mail" iconPosition="start">
            Email
          </Button>
          <Button href={telHref(application.phone)} variant="secondary" size="sm" icon="phone" iconPosition="start">
            Call
          </Button>
          {isSuperAdmin && (
            <Button variant="ghost" size="sm" icon="trash" iconPosition="start" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          )}
        </div>
      </header>

      <ol className="status-track" aria-label="Application progress">
        {APPLICATION_STATUSES.filter((item) => !['rejected', 'closed'].includes(item.value)).map((item, index) => {
          const reached = ['rejected', 'closed'].includes(application.status) ? false : index <= currentIndex;
          return (
            <li key={item.value} className={`${reached ? 'is-reached' : ''} ${item.value === application.status ? 'is-current' : ''}`}>
              <span aria-hidden="true" />
              {item.label}
            </li>
          );
        })}
      </ol>

      <div className="admin-grid-2">
        <div className="admin-stack">
          <Panel title="Personal information">
            <DetailList
              rows={[
                ['Full name', application.full_name],
                ['Email', <a key="e" href={`mailto:${application.email}`}>{application.email}</a>],
                ['Phone', <a key="p" href={telHref(application.phone)}>{application.phone}</a>],
                ['Date of birth', `${formatDate(application.date_of_birth)} (age ${ageFrom(application.date_of_birth)})`],
                ['Gender', optionLabel('gender', application.gender)],
                ['Location', [application.city, application.state, application.country].join(', ')],
              ]}
            />
          </Panel>

          <Panel title="Education & experience">
            <DetailList
              rows={[
                ['Highest qualification', optionLabel('qualification', application.qualification)],
                ['Work experience', optionLabel('experience', application.experience)],
                ['Current profession', application.profession],
                ['Preferred opportunity', optionLabel('opportunity', application.preferred_opportunity)],
              ]}
            />
          </Panel>

          <Panel title="Preferences">
            <DetailList
              rows={[
                ['Preferred country', application.preferred_country],
                ['Preferred sector', optionLabel('sector', application.preferred_sector)],
                ['Preferred position / course', application.preferred_position],
                ['Applied for opening', application.job_title || 'General application'],
                ['Form language', { en: 'English', hi: 'Hindi', pa: 'Punjabi' }[application.language] || application.language],
                ['Consent recorded', formatDateTime(application.consent_at)],
              ]}
            />
          </Panel>

          <Panel title="Message from candidate">
            {application.message ? <p className="app-detail__message">{application.message}</p> : <p className="text-muted">No message was included.</p>}
          </Panel>

          <Panel title="Documents" description={`${documents.length} file${documents.length === 1 ? '' : 's'}`} flush>
            {documents.length === 0 ? (
              <StateMessage title="No documents" compact />
            ) : (
              <ul role="list" className="doc-list">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <span className="doc-list__icon" aria-hidden="true">
                      <Icon name="file" size={20} />
                    </span>
                    <div className="doc-list__info">
                      <strong>{doc.original_name}</strong>
                      <span>
                        {doc.doc_type === 'cv' ? 'CV / Resume' : 'Supporting document'} · {formatFileSize(doc.size_bytes)}
                      </span>
                    </div>
                    <div className="row-actions">
                      <a className="icon-button" href={adminService.documentUrl(id, doc.id, { inline: true })} target="_blank" rel="noopener noreferrer" aria-label={`Open ${doc.original_name}`}>
                        <Icon name="eye" size={16} />
                      </a>
                      <a className="icon-button" href={adminService.documentUrl(id, doc.id)} aria-label={`Download ${doc.original_name}`}>
                        <Icon name="download" size={16} />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="admin-stack app-detail__side">
          <Panel title="Status">
            {canEdit ? (
              <form className="app-detail__form" onSubmit={saveStatus}>
                <SelectField
                  id="detail-status"
                  label="Application status"
                  value={selectedStatus}
                  onChange={(event) => setStatus(event.target.value)}
                  options={APPLICATION_STATUSES}
                />
                <TextareaField
                  id="detail-status-note"
                  label="Note"
                  optionalLabel="Optional"
                  hint="Saved to the internal notes with this change."
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                  rows={3}
                  maxLength={2000}
                />
                <Button type="submit" block loading={savingStatus} disabled={!statusChanged && !statusNote.trim()}>
                  {statusChanged ? `Change to ${STATUS_LABELS[selectedStatus]}` : 'Save'}
                </Button>
              </form>
            ) : (
              <p className="text-muted">You have read-only access.</p>
            )}
            {application.status_changed_at && (
              <p className="app-detail__changed">Last changed {formatRelative(application.status_changed_at)}</p>
            )}
          </Panel>

          <Panel title="Internal notes" description="Visible to staff only">
            {canEdit && (
              <form className="app-detail__form" onSubmit={addNote}>
                <TextareaField id="detail-note" label="Add a note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={2000} />
                <Button type="submit" variant="secondary" size="sm" loading={savingNote} disabled={note.trim().length < 2}>
                  Add note
                </Button>
              </form>
            )}
            {notes.length === 0 ? (
              <p className="text-muted app-detail__empty">No notes yet.</p>
            ) : (
              <ul role="list" className="notes">
                {notes.map((item) => (
                  <li key={item.id}>
                    <p>{item.body}</p>
                    <span>
                      {item.admin_name || 'Former team member'} · {formatDateTime(item.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Activity history">
            <ol role="list" className="timeline">
              {activity.map((item) => (
                <li key={item.id}>
                  <span className="timeline__dot" aria-hidden="true" />
                  <div>
                    <p>{describeActivity(item)}</p>
                    <span>
                      {item.admin_name || 'Candidate (website)'} · {formatDateTime(item.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this application?"
        message={`${application.full_name} (${application.reference_no}) and all ${documents.length} uploaded document(s) will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete permanently"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
