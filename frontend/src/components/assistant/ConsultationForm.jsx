import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../constants/publicRoutes.js';
import { publicService } from '../../services/publicService.js';
import { isEmail, isPhone } from '../../utils/validation.js';
import { Button } from '../common/Button.jsx';
import { FormAlert, TextField } from '../forms/Fields.jsx';

// Consultation request sent through the EXISTING contact endpoint
// (POST /api/contact, enquiryType "education") — no new backend or table.
// Success is shown only when the server explicitly confirms it.

const EMPTY = { fullName: '', email: '', phone: '', destination: '', course: '', time: '', website: '' };

export function ConsultationForm({ s, onDone, onCancel }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [failure, setFailure] = useState('');
  const formRef = useRef(null);
  const c = s.consult;

  const bind = (name) => ({
    id: `ai-consult-${name}`,
    name,
    value: values[name],
    error: errors[name],
    disabled: status === 'sending',
    onChange: (event) => {
      const { value } = event.target;
      setValues((v) => ({ ...v, [name]: value }));
      if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
    },
  });

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (values.fullName.trim().length < 3) found.fullName = c.nameError;
    if (!isEmail(values.email)) found.email = c.emailError;
    if (!isPhone(values.phone)) found.phone = c.phoneError;
    setErrors(found);
    if (Object.keys(found).length) {
      formRef.current?.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }

    const message = [
      'Consultation request submitted through the website AI assistant.',
      `Preferred study destination: ${values.destination.trim() || 'Not specified'}`,
      `Course or programme of interest: ${values.course.trim() || 'Not specified'}`,
      `Preferred counselling time: ${values.time.trim() || 'Not specified'}`,
    ].join('\n');

    setStatus('sending');
    setFailure('');
    try {
      const response = await publicService.sendEnquiry({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        enquiryType: 'education',
        subject: c.subject,
        message,
        website: values.website,
      });
      // Only an explicit success envelope from the API counts as submitted.
      if (response?.success !== true) throw Object.assign(new Error('Unconfirmed'), { isNetworkError: true });
      setStatus('sent');
      onDone?.();
    } catch (error) {
      setStatus('error');
      if (error?.errors) setErrors(error.errors);
      setFailure(error?.isNetworkError || !error?.status || error.status === 404 ? c.failedNetwork : error.message);
    }
  };

  if (status === 'sent') {
    return (
      <div className="sm-ai-consult">
        <FormAlert tone="success" title={c.successTitle}>
          {c.successText}
        </FormAlert>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {c.cancel}
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} className="sm-ai-consult" onSubmit={submit} noValidate aria-labelledby="ai-consult-title">
      <h3 id="ai-consult-title" className="sm-ai-consult__title">
        {c.title}
      </h3>
      <p className="sm-ai-consult__intro">{c.intro}</p>

      {status === 'error' && failure && (
        <FormAlert title={c.failedTitle}>
          <p>{failure}</p>
          <p>
            <Link to={PATHS.contact} onClick={onCancel}>
              {s.openContact}
            </Link>
          </p>
        </FormAlert>
      )}

      <input
        type="text"
        name="website"
        value={values.website}
        onChange={(e) => setValues((v) => ({ ...v, website: e.target.value }))}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <TextField label={c.name} required autoComplete="name" maxLength={150} {...bind('fullName')} />
      <TextField label={c.email} type="email" required autoComplete="email" maxLength={190} {...bind('email')} />
      <TextField label={c.phone} type="tel" required autoComplete="tel" hint={c.phoneHint} maxLength={20} {...bind('phone')} />
      <TextField label={c.destination} placeholder={c.destinationPlaceholder} maxLength={100} {...bind('destination')} />
      <TextField label={c.course} placeholder={c.coursePlaceholder} maxLength={150} {...bind('course')} />
      <TextField label={c.time} placeholder={c.timePlaceholder} maxLength={100} {...bind('time')} />

      <p className="sm-ai-consult__privacy">
        {c.privacy}{' '}
        <Link to={PATHS.privacy} target="_blank" rel="noopener">
          {c.privacyLink}
        </Link>
        .
      </p>

      <div className="sm-ai-consult__actions">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={status === 'sending'}>
          {c.cancel}
        </Button>
        <Button type="submit" size="sm" loading={status === 'sending'}>
          {status === 'sending' ? c.sending : c.submit}
        </Button>
      </div>
    </form>
  );
}
