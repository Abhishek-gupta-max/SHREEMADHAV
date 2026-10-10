import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { PATHS } from '../../../constants/publicRoutes.js';
import { isEmail } from '../../../utils/validation.js';
import { Logo } from '../../../components/common/Logo.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { Icon } from '../../../components/common/Icon.jsx';
import { PageLoader } from '../../../components/common/Spinner.jsx';
import { FormAlert, TextField } from '../../../components/forms/Fields.jsx';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (status === 'checking') return <PageLoader label="Checking your session" />;
  if (status === 'authenticated') return <Navigate to={location.state?.from || PATHS.admin} replace />;

  const onChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!isEmail(values.email)) found.email = 'Enter a valid email address.';
    if (!values.password) found.password = 'Enter your password.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setFormError('');
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(location.state?.from || PATHS.admin, { replace: true });
    } catch (error) {
      setFormError(error.isNetworkError ? 'The server could not be reached. Please try again.' : error.message);
      setValues((current) => ({ ...current, password: '' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <aside className="admin-login__brand">
        <Logo tone="light" to={PATHS.home} />
        <div>
          <p className="admin-login__kicker">Back office</p>
          <p className="admin-login__statement">Applications, enquiries and website content — managed in one place.</p>
        </div>
        <p className="admin-login__legal">ShreeMadhav Overseas Solutions Private Limited · Chandigarh, India</p>
      </aside>

      <main className="admin-login__main">
        <form className="admin-login__form" onSubmit={onSubmit} noValidate>
          <div className="admin-login__mobile-logo">
            <Logo />
          </div>
          <h1>Sign in</h1>
          <p className="text-muted">Authorised staff only. Activity is logged.</p>

          {formError && <FormAlert>{formError}</FormAlert>}

          <TextField id="login-email" name="email" type="email" label="Email address" autoComplete="username" required value={values.email} error={errors.email} onChange={onChange} autoFocus />
          <div className="admin-login__password">
            <TextField
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              autoComplete="current-password"
              required
              value={values.password}
              error={errors.password}
              onChange={onChange}
            />
            <button
              type="button"
              className="admin-login__toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              <Icon name="eye" size={18} />
            </button>
          </div>

          <Button type="submit" block size="lg" loading={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <p className="admin-login__help">
            <Icon name="lock" size={14} /> Forgotten your password? Ask a super administrator to reset it.
          </p>
        </form>
      </main>
    </div>
  );
}
