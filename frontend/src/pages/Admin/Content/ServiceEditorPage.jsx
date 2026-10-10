import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { adminService } from '../../../services/adminService.js';
import { PATHS } from '../../../constants/publicRoutes.js';
import { ADMIN_LANGUAGES, SERVICE_ICON_OPTIONS } from '../../../constants/admin.js';
import { Button } from '../../../components/common/Button.jsx';
import { PageLoader } from '../../../components/common/Spinner.jsx';
import { StateMessage } from '../../../components/common/StateMessage.jsx';
import { CheckboxField, FormAlert, SelectField, TextField, TextareaField } from '../../../components/forms/Fields.jsx';
import { ConfirmDialog, PageHeader, Panel } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';
import './ContentEditor.css';

const EMPTY_COPY = { title: '', summary: '', body: '' };
const EMPTY = {
  slug: '',
  icon: 'compass',
  sortOrder: 100,
  isFeatured: false,
  isActive: true,
  translations: { en: { ...EMPTY_COPY }, hi: { ...EMPTY_COPY }, pa: { ...EMPTY_COPY } },
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 120);

/** A translation is sent only when a title or summary has been entered. */
function toPayload(form) {
  const translations = {};
  Object.entries(form.translations).forEach(([code, copy]) => {
    const filled = copy.title.trim() || copy.summary.trim();
    if (code === 'en' || filled) {
      translations[code] = { title: copy.title.trim(), summary: copy.summary.trim(), body: copy.body.trim() || undefined };
    }
  });
  return { ...form, sortOrder: Number(form.sortOrder) || 0, translations };
}

export default function ServiceEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const { canEdit } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [tab, setTab] = useState('en');
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const base = `${PATHS.admin}/services`;

  useBreadcrumbs([{ label: 'Services', to: base }, { label: isNew ? 'New service' : form.translations.en.title || 'Edit' }]);

  useEffect(() => {
    if (isNew) return undefined;
    const controller = new AbortController();
    adminService
      .service(id, { signal: controller.signal })
      .then((service) => {
        setForm({
          slug: service.slug,
          icon: service.icon,
          sortOrder: service.sortOrder,
          isFeatured: service.isFeatured,
          isActive: service.isActive,
          translations: Object.fromEntries(
            ADMIN_LANGUAGES.map(({ code }) => [code, { ...EMPTY_COPY, ...service.translations[code], body: service.translations[code]?.body || '' }]),
          ),
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

  if (loading) return <PageLoader label="Loading service" />;
  if (loadError) return <StateMessage tone="error" title="Service could not be loaded" text={loadError.message} />;

  const setCopy = (field, value) => {
    setForm((current) => {
      const next = { ...current, translations: { ...current.translations, [tab]: { ...current.translations[tab], [field]: value } } };
      if (tab === 'en' && field === 'title' && !slugTouched) next.slug = slugify(value);
      return next;
    });
    setErrors((current) => ({ ...current, [`translations.${tab}.${field}`]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = toPayload(form);
      if (isNew) {
        const { data } = await adminService.createService(payload);
        toast.success('Service created.');
        navigate(`${base}/${data.id}`, { replace: true });
      } else {
        await adminService.updateService(id, payload);
        toast.success('Service saved. The website updates within a few minutes.');
      }
    } catch (error) {
      setErrors(error.errors || {});
      const firstLang = Object.keys(error.errors || {}).find((key) => key.startsWith('translations.'))?.split('.')[1];
      if (firstLang) setTab(firstLang);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await adminService.deleteService(id);
      toast.success('Service deleted.');
      navigate(base, { replace: true });
    } catch (error) {
      toast.error(error.message);
      setSaving(false);
    }
  };

  const copy = form.translations[tab];
  const err = (field) => errors[`translations.${tab}.${field}`];
  const tabHasError = (code) => Object.keys(errors).some((key) => key.startsWith(`translations.${code}.`));

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title={isNew ? 'New service' : form.translations.en.title || 'Edit service'}
        description="English is required. Hindi and Punjabi are optional; anything left blank falls back to English on the website."
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
                {isNew ? 'Create service' : 'Save changes'}
              </Button>
            )}
          </>
        }
      />

      {Object.keys(errors).length > 0 && <FormAlert title="Please correct the highlighted fields." />}

      <fieldset disabled={!canEdit} className="editor">
        <Panel title="Content">
          <div className="lang-tabs" role="tablist" aria-label="Language">
            {ADMIN_LANGUAGES.map((language) => (
              <button
                key={language.code}
                type="button"
                role="tab"
                aria-selected={tab === language.code}
                className={tabHasError(language.code) ? 'has-error' : ''}
                onClick={() => setTab(language.code)}
              >
                {language.label}
                {language.code === 'en' && <span className="field__required">*</span>}
                {form.translations[language.code].title && <span className="lang-tabs__dot" aria-label="has content" />}
              </button>
            ))}
          </div>
          <div className="editor__fields" role="tabpanel" lang={tab}>
            <TextField id="svc-title" label="Title" required={tab === 'en'} value={copy.title} error={err('title')} onChange={(event) => setCopy('title', event.target.value)} maxLength={150} />
            <TextareaField id="svc-summary" label="Summary" hint="One or two sentences, shown in lists." required={tab === 'en'} value={copy.summary} error={err('summary')} onChange={(event) => setCopy('summary', event.target.value)} rows={3} maxLength={400} />
            <TextareaField id="svc-body" label="Details" optionalLabel="Optional" hint="Shown on the Services page under the summary." value={copy.body} error={err('body')} onChange={(event) => setCopy('body', event.target.value)} rows={5} maxLength={4000} />
          </div>
        </Panel>

        <Panel title="Settings">
          <div className="form-grid form-grid--3">
            <TextField
              id="svc-slug"
              label="URL name"
              hint="Used for links such as /services#overseas-education-guidance"
              required
              value={form.slug}
              error={errors.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setForm((current) => ({ ...current, slug: event.target.value }));
              }}
            />
            <SelectField id="svc-icon" label="Icon" value={form.icon} error={errors.icon} options={SERVICE_ICON_OPTIONS} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} />
            <TextField id="svc-order" label="Display order" type="number" min={0} max={999} hint="Lower numbers appear first." value={form.sortOrder} error={errors.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} />
            <CheckboxField id="svc-active" label="Visible on the website" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
            <CheckboxField id="svc-featured" label="Featured (shown with a photograph)" checked={form.isFeatured} onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))} />
          </div>
        </Panel>
      </fieldset>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this service?"
        message="It will be removed from the website in every language."
        confirmLabel="Delete service"
        busy={saving}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}
