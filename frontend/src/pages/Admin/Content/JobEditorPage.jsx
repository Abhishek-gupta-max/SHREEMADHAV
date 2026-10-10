import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { adminService } from '../../../services/adminService.js';
import { PATHS } from '../../../constants/publicRoutes.js';
import { JOB_STATUSES } from '../../../constants/admin.js';
import en from '../../../i18n/locales/en.js';
import { Button } from '../../../components/common/Button.jsx';
import { PageLoader } from '../../../components/common/Spinner.jsx';
import { StateMessage } from '../../../components/common/StateMessage.jsx';
import { FormAlert, SelectField, TextField, TextareaField } from '../../../components/forms/Fields.jsx';
import { ConfirmDialog, PageHeader, Panel } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';
import './ContentEditor.css';

const EMPTY = { title: '', country: '', location: '', sector: '', employmentType: 'full_time', summary: '', requirements: '', status: 'draft' };
const EMPLOYMENT_OPTIONS = Object.entries(en.careers.employmentTypes).map(([value, label]) => ({ value, label }));

export default function JobEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const { canEdit } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const base = `${PATHS.admin}/openings`;

  useBreadcrumbs([{ label: 'Openings', to: base }, { label: isNew ? 'New opening' : form.title || 'Edit' }]);

  useEffect(() => {
    if (isNew) return undefined;
    const controller = new AbortController();
    adminService
      .job(id, { signal: controller.signal })
      .then((job) => {
        setForm({
          title: job.title,
          country: job.country || '',
          location: job.location || '',
          sector: job.sector || '',
          employmentType: job.employment_type,
          summary: job.summary,
          requirements: job.requirements || '',
          status: job.status,
        });
        setLoading(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setLoadError(error);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [id, isNew]);

  if (loading) return <PageLoader label="Loading opening" />;
  if (loadError) return <StateMessage tone="error" title="Opening could not be loaded" text={loadError.message} />;

  const bind = (name) => ({
    id: `job-${name}`,
    value: form[name],
    error: errors[name],
    onChange: (event) => {
      setForm((current) => ({ ...current, [name]: event.target.value }));
      setErrors((current) => ({ ...current, [name]: undefined }));
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (isNew) {
        const { data } = await adminService.createJob(form);
        toast.success(form.status === 'published' ? 'Opening published.' : 'Draft saved.');
        navigate(`${base}/${data.id}`, { replace: true });
      } else {
        await adminService.updateJob(id, form);
        toast.success('Opening saved.');
      }
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await adminService.deleteJob(id);
      toast.success('Opening deleted.');
      navigate(base, { replace: true });
    } catch (error) {
      toast.error(error.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title={isNew ? 'New opening' : form.title}
        description="Only publish openings that are confirmed and currently available."
        actions={
          <>
            {!isNew && canEdit && (
              <Button variant="ghost" size="sm" icon="trash" iconPosition="start" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            )}
            <Button to={base} variant="secondary" size="sm">
              Cancel
            </Button>
            {canEdit && (
              <Button type="submit" size="sm" loading={saving}>
                Save
              </Button>
            )}
          </>
        }
      />
      {Object.keys(errors).length > 0 && <FormAlert title="Please correct the highlighted fields." />}

      <fieldset disabled={!canEdit} className="editor">
        <Panel title="Role">
          <div className="form-grid">
            <TextField {...bind('title')} className="span-2" label="Job title" required maxLength={160} />
            <TextField {...bind('country')} label="Country" optionalLabel="Optional" maxLength={100} />
            <TextField {...bind('location')} label="City / location" optionalLabel="Optional" maxLength={150} />
            <TextField {...bind('sector')} label="Sector" optionalLabel="Optional" maxLength={100} />
            <SelectField {...bind('employmentType')} label="Employment type" options={EMPLOYMENT_OPTIONS} />
            <TextareaField {...bind('summary')} className="span-2" label="About the role" required rows={6} maxLength={4000} hint="Line breaks are kept on the website." />
            <TextareaField {...bind('requirements')} className="span-2" label="Requirements" optionalLabel="Optional" rows={6} maxLength={4000} />
          </div>
        </Panel>
        <Panel title="Publishing">
          <div className="form-grid">
            <SelectField {...bind('status')} label="Status" options={JOB_STATUSES} hint="Published openings appear on the Requirements page immediately." />
          </div>
        </Panel>
      </fieldset>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this opening?"
        message="It will be removed from the Requirements page. Applications already received are kept."
        confirmLabel="Delete opening"
        busy={saving}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}
