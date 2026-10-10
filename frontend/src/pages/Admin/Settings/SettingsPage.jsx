import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { adminService } from '../../../services/adminService.js';
import { useAsync } from '../../../hooks/useAsync.js';
import { ROLES, ROLE_LABELS } from '../../../constants/admin.js';
import { formatRelative } from '../../../utils/format.js';
import { Button } from '../../../components/common/Button.jsx';
import { PageLoader } from '../../../components/common/Spinner.jsx';
import { StateMessage } from '../../../components/common/StateMessage.jsx';
import { FormAlert, SelectField, TextField, TextareaField } from '../../../components/forms/Fields.jsx';
import { Drawer, PageHeader, Panel } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';
import '../Content/ContentEditor.css';

const CONTACT_FIELDS = [
  { key: 'contact_phone', label: 'Phone', type: 'tel', hint: 'Shown in the footer, menu and contact page.' },
  { key: 'contact_whatsapp', label: 'WhatsApp number', type: 'tel', hint: 'Include the country code, e.g. +91 …' },
  { key: 'contact_email', label: 'Email', type: 'email' },
  { key: 'office_hours', label: 'Office hours', placeholder: 'e.g. Monday–Saturday, 10:00–18:00' },
  { key: 'map_url', label: 'Map link', type: 'url', placeholder: 'https://maps.google.com/…', hint: 'Used for the “Get directions” link.' },
];

const SOCIAL_FIELDS = [
  { key: 'social_linkedin', label: 'LinkedIn' },
  { key: 'social_facebook', label: 'Facebook' },
  { key: 'social_instagram', label: 'Instagram' },
  { key: 'social_youtube', label: 'YouTube' },
  { key: 'social_x', label: 'X (Twitter)' },
];

function WebsiteSettings({ canEdit }) {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync((signal) => adminService.settings({ signal }));
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value || ''])));
  }, [data]);

  if (loading && !data) return <PageLoader label="Loading settings" />;
  if (error) return <StateMessage tone="error" title="Settings could not be loaded" text={error.message} onRetry={reload} />;

  const bind = (key) => ({
    id: `setting-${key}`,
    value: form[key] || '',
    error: errors[key],
    onChange: (event) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await adminService.saveSettings(form);
      toast.success('Settings saved. The website shows the new details within a few minutes.');
    } catch (err) {
      setErrors(err.errors || {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {Object.keys(errors).length > 0 && <FormAlert title="Please correct the highlighted fields." />}
      <fieldset disabled={!canEdit} className="editor">
        <Panel title="Contact details" description="Leave a field blank to hide it on the website.">
          <div className="form-grid">
            <TextareaField {...bind('office_address')} className="span-2" label="Office address" rows={3} maxLength={300} hint="If blank, the website shows the registered office: SCO 156-157, 4th Floor, Sector 34A, Chandigarh 160022." />
            {CONTACT_FIELDS.map((field) => (
              <TextField key={field.key} {...bind(field.key)} type={field.type || 'text'} label={field.label} hint={field.hint} placeholder={field.placeholder} />
            ))}
          </div>
        </Panel>
        <Panel title="Social media" description="Full https:// links. Icons appear in the footer only for links you add.">
          <div className="form-grid">
            {SOCIAL_FIELDS.map((field) => (
              <TextField key={field.key} {...bind(field.key)} type="url" label={field.label} placeholder="https://" />
            ))}
          </div>
        </Panel>
        {canEdit && (
          <div>
            <Button type="submit" loading={saving}>
              Save settings
            </Button>
          </div>
        )}
      </fieldset>
    </form>
  );
}

function TeamSettings() {
  const toast = useToast();
  const { admin } = useAuth();
  const { data, loading, error, reload } = useAsync((signal) => adminService.team({ signal }), [], { initialData: [] });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const create = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await adminService.createTeamMember(form);
      toast.success(`${form.name} can now sign in.`);
      setAdding(false);
      setForm({ name: '', email: '', password: '', role: 'admin' });
      reload();
    } catch (err) {
      setErrors(err.errors || {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateMember = async (member, changes) => {
    try {
      await adminService.updateTeamMember(member.id, { role: member.role, isActive: member.is_active, ...changes });
      toast.success('Team member updated.');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const bind = (key) => ({
    id: `member-${key}`,
    value: form[key],
    error: errors[key],
    onChange: (event) => setForm((current) => ({ ...current, [key]: event.target.value })),
  });

  return (
    <>
      <Panel
        title="Team"
        description="People who can sign in to this back office."
        actions={
          <Button size="sm" icon="plus" iconPosition="start" onClick={() => setAdding(true)}>
            Add member
          </Button>
        }
        flush
      >
        {error ? (
          <StateMessage tone="error" title="Team could not be loaded" text={error.message} onRetry={reload} />
        ) : (
          <div className="table-wrap" aria-busy={loading}>
            <table className="data-table data-table--responsive">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Access</th>
                  <th scope="col">Last sign-in</th>
                </tr>
              </thead>
              <tbody>
                {data.map((member) => {
                  const isSelf = member.id === admin?.id;
                  return (
                    <tr key={member.id}>
                      <td data-label="" className="cell-full">
                        <div className="cell-primary">
                          <strong>
                            {member.name} {isSelf && <span className="text-muted">(you)</span>}
                          </strong>
                          <span>{member.email}</span>
                        </div>
                      </td>
                      <td data-label="Role">
                        {isSelf ? (
                          ROLE_LABELS[member.role]
                        ) : (
                          <select className="input" style={{ minHeight: 36, padding: '4px 8px', width: 'auto' }} aria-label={`Role for ${member.name}`} value={member.role} onChange={(event) => updateMember(member, { role: event.target.value })}>
                            {ROLES.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td data-label="Access">
                        {isSelf ? (
                          <span className="badge badge--published">Active</span>
                        ) : (
                          <Button variant={member.is_active ? 'secondary' : 'primary'} size="sm" onClick={() => updateMember(member, { isActive: !member.is_active })}>
                            {member.is_active ? 'Deactivate' : 'Reactivate'}
                          </Button>
                        )}
                      </td>
                      <td data-label="Last sign-in" className="text-muted">
                        {member.last_login_at ? formatRelative(member.last_login_at) : 'Never'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Drawer
        open={adding}
        title="Add team member"
        subtitle="Share the password with them securely. They can change it from their profile."
        onClose={() => setAdding(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-member-form" loading={saving}>
              Add member
            </Button>
          </>
        }
      >
        <form id="add-member-form" className="editor__fields" onSubmit={create} noValidate>
          <TextField {...bind('name')} label="Full name" required autoComplete="off" />
          <TextField {...bind('email')} type="email" label="Email" required autoComplete="off" />
          <TextField {...bind('password')} type="password" label="Temporary password" required hint="At least 10 characters, including a letter and a number." autoComplete="new-password" />
          <SelectField {...bind('role')} label="Role" options={ROLES} hint="Viewers can see everything but cannot change data." />
        </form>
      </Drawer>
    </>
  );
}

export default function SettingsPage() {
  useBreadcrumbs([{ label: 'Settings' }]);
  const { canEdit, isSuperAdmin } = useAuth();
  const [tab, setTab] = useState('website');

  return (
    <>
      <PageHeader title="Settings" description="Contact details shown on the website, and who has access to the back office." />
      {isSuperAdmin && (
        <div className="lang-tabs" role="tablist" aria-label="Settings sections" style={{ margin: '0 0 var(--space-5)', padding: 0 }}>
          <button type="button" role="tab" aria-selected={tab === 'website'} onClick={() => setTab('website')}>
            Website
          </button>
          <button type="button" role="tab" aria-selected={tab === 'team'} onClick={() => setTab('team')}>
            Team
          </button>
        </div>
      )}
      {tab === 'team' && isSuperAdmin ? <TeamSettings /> : <WebsiteSettings canEdit={canEdit} />}
    </>
  );
}
