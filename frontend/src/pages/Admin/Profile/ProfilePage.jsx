import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { authService } from '../../../services/adminService.js';
import { PATHS } from '../../../constants/publicRoutes.js';
import { ROLE_LABELS } from '../../../constants/admin.js';
import { formatDateTime } from '../../../utils/format.js';
import { Button } from '../../../components/common/Button.jsx';
import { TextField } from '../../../components/forms/Fields.jsx';
import { ConfirmDialog, PageHeader, Panel } from '../../../components/admin/AdminUi.jsx';
import { useBreadcrumbs } from '../../../components/admin/Breadcrumbs.jsx';
import '../Content/ContentEditor.css';

export default function ProfilePage() {
  useBreadcrumbs([{ label: 'Profile' }]);
  const { admin, setAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: admin.name, email: admin.email });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [confirmEverywhere, setConfirmEverywhere] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileErrors({});
    try {
      const { data } = await authService.updateProfile(profile);
      setAdmin(data.admin);
      toast.success('Profile updated.');
    } catch (err) {
      setProfileErrors(err.errors || {});
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordErrors({ confirm: 'The passwords do not match.' });
      return;
    }
    setSavingPassword(true);
    setPasswordErrors({});
    try {
      const { message } = await authService.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success(message);
    } catch (err) {
      setPasswordErrors(err.errors || {});
      toast.error(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const signOutEverywhere = async () => {
    try {
      await authService.logoutEverywhere();
    } finally {
      await logout();
      navigate(PATHS.adminLogin, { replace: true });
    }
  };

  const bindPassword = (key) => ({
    id: `pw-${key}`,
    type: 'password',
    value: passwords[key],
    error: passwordErrors[key],
    onChange: (event) => setPasswords((current) => ({ ...current, [key]: event.target.value })),
  });

  return (
    <>
      <PageHeader title="Your profile" description={`${ROLE_LABELS[admin.role]} · Last sign-in ${admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : 'this session'}`} />
      <div className="admin-grid-2">
        <div className="admin-stack">
          <Panel title="Details">
            <form className="editor__fields" onSubmit={saveProfile} noValidate>
              <TextField id="profile-name" label="Name" required value={profile.name} error={profileErrors.name} onChange={(event) => setProfile((p) => ({ ...p, name: event.target.value }))} autoComplete="name" />
              <TextField id="profile-email" type="email" label="Email" required value={profile.email} error={profileErrors.email} onChange={(event) => setProfile((p) => ({ ...p, email: event.target.value }))} autoComplete="email" />
              <div>
                <Button type="submit" loading={savingProfile}>
                  Save details
                </Button>
              </div>
            </form>
          </Panel>

          <Panel title="Change password" description="Changing your password signs you out on other devices.">
            <form className="editor__fields" onSubmit={savePassword} noValidate>
              <TextField {...bindPassword('currentPassword')} label="Current password" required autoComplete="current-password" />
              <TextField {...bindPassword('newPassword')} label="New password" required hint="At least 10 characters, including a letter and a number." autoComplete="new-password" />
              <TextField {...bindPassword('confirm')} label="Confirm new password" required autoComplete="new-password" />
              <div>
                <Button type="submit" loading={savingPassword} disabled={!passwords.currentPassword || !passwords.newPassword}>
                  Update password
                </Button>
              </div>
            </form>
          </Panel>
        </div>

        <Panel title="Sessions">
          <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
            If you signed in on a shared or lost device, sign out everywhere. You will need to sign in again here too.
          </p>
          <Button variant="secondary" icon="logout" iconPosition="start" onClick={() => setConfirmEverywhere(true)}>
            Sign out of all devices
          </Button>
        </Panel>
      </div>

      <ConfirmDialog
        open={confirmEverywhere}
        title="Sign out of all devices?"
        message="Every active session for your account will end immediately."
        confirmLabel="Sign out everywhere"
        tone="primary"
        onConfirm={signOutEverywhere}
        onCancel={() => setConfirmEverywhere(false)}
      />
    </>
  );
}
