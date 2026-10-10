import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { COUNTRIES, EXPERIENCE_LEVELS, GENDERS, OPPORTUNITY_TYPES, QUALIFICATIONS, SECTORS } from '../../constants/options.js';
import { CV_ACCEPT, DOC_ACCEPT } from '../../utils/validation.js';
import { CheckboxField, SelectField, TextField, TextareaField } from '../../components/forms/Fields.jsx';
import { FileDrop } from '../../components/forms/FileDrop.jsx';
import { ApplyReview } from './ApplyReview.jsx';

function isoDateYearsAgo(years) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
}

/** Renders the inputs for one step of the application form. */
export function StepFields({ stepKey, values, files, errors, onChange, onFilesChange, onEditStep, maxSize, maxFiles }) {
  const { t } = useLanguage();
  const options = (group, list) => list.map((value) => ({ value, label: t(`options.${group}.${value}`) }));

  const bind = (name) => ({
    id: `apply-${name}`,
    name,
    value: values[name],
    error: errors[name],
    onChange: (event) => onChange(name, event.target.value),
  });

  switch (stepKey) {
    case 'personal':
      return (
        <div className="form-grid">
          <TextField {...bind('fullName')} className="span-2" label={t('apply.fields.fullName')} hint={t('apply.fields.fullNameHint')} required autoComplete="name" maxLength={150} />
          <TextField {...bind('email')} type="email" label={t('apply.fields.email')} required autoComplete="email" inputMode="email" maxLength={190} />
          <TextField {...bind('phone')} type="tel" label={t('apply.fields.phone')} hint={t('apply.fields.phoneHint')} required autoComplete="tel" inputMode="tel" maxLength={20} />
          <TextField {...bind('dateOfBirth')} type="date" label={t('apply.fields.dateOfBirth')} required autoComplete="bday" min={isoDateYearsAgo(70)} max={isoDateYearsAgo(16)} />
          <SelectField {...bind('gender')} label={t('apply.fields.gender')} required placeholder={t('apply.select')} options={options('gender', GENDERS)} />
        </div>
      );

    case 'location':
      return (
        <div className="form-grid">
          <TextField {...bind('city')} label={t('apply.fields.city')} required autoComplete="address-level2" maxLength={100} />
          <TextField {...bind('state')} label={t('apply.fields.state')} required autoComplete="address-level1" maxLength={100} />
          <TextField {...bind('country')} className="span-2" label={t('apply.fields.country')} required autoComplete="country-name" list="country-list" maxLength={100} />
          <CountryList />
        </div>
      );

    case 'background':
      return (
        <div className="form-grid">
          <SelectField {...bind('qualification')} label={t('apply.fields.qualification')} required placeholder={t('apply.select')} options={options('qualification', QUALIFICATIONS)} />
          <SelectField {...bind('experience')} label={t('apply.fields.experience')} required placeholder={t('apply.select')} options={options('experience', EXPERIENCE_LEVELS)} />
          <TextField {...bind('profession')} className="span-2" label={t('apply.fields.profession')} hint={t('apply.fields.professionHint')} required autoComplete="organization-title" maxLength={150} />
          <SelectField {...bind('preferredOpportunity')} className="span-2" label={t('apply.fields.preferredOpportunity')} required placeholder={t('apply.select')} options={options('opportunity', OPPORTUNITY_TYPES)} />
        </div>
      );

    case 'preferences':
      return (
        <div className="form-grid">
          <TextField {...bind('preferredCountry')} label={t('apply.fields.preferredCountry')} hint={t('apply.fields.preferredCountryHint')} required list="preferred-country-list" maxLength={100} autoComplete="off" />
          <datalist id="preferred-country-list">
            <option value={t('apply.openToSuggestions')} />
            {COUNTRIES.map((country) => (
              <option key={country} value={country} />
            ))}
          </datalist>
          <SelectField {...bind('preferredSector')} label={t('apply.fields.preferredSector')} required placeholder={t('apply.select')} options={options('sector', SECTORS)} />
          <TextField {...bind('preferredPosition')} className="span-2" label={t('apply.fields.preferredPosition')} hint={t('apply.fields.preferredPositionHint')} required maxLength={150} />
        </div>
      );

    case 'documents':
      return (
        <div className="form-grid">
          <div className="span-2">
            <FileDrop
              id="apply-cv"
              label={t('apply.fields.cv')}
              hint={t('apply.fields.cvHint', { size: maxSize })}
              error={errors.cv}
              required
              accept={CV_ACCEPT}
              files={files.cv}
              onChange={(list) => onFilesChange('cv', list)}
              chooseLabel={t('apply.upload.choose')}
              dropLabel={t('apply.upload.drop')}
              removeLabel={(name) => t('apply.upload.remove', { name })}
            />
          </div>
          <div className="span-2">
            <FileDrop
              id="apply-documents"
              label={t('apply.fields.documents')}
              hint={t('apply.fields.documentsHint', { count: maxFiles, size: maxSize })}
              error={errors.documents}
              optionalLabel={t('common.optional')}
              multiple
              accept={DOC_ACCEPT}
              files={files.documents}
              onChange={(list) => onFilesChange('documents', list)}
              chooseLabel={t('apply.upload.chooseMany')}
              dropLabel={t('apply.upload.drop')}
              removeLabel={(name) => t('apply.upload.remove', { name })}
            />
          </div>
          <TextareaField
            {...bind('message')}
            className="span-2"
            label={t('apply.fields.message')}
            hint={t('apply.fields.messageHint')}
            optionalLabel={t('common.optional')}
            maxLength={2000}
            rows={5}
          />

          <div className="span-2">
            <ApplyReview values={values} files={files} onEdit={onEditStep} />
          </div>

          <CheckboxField
            id="apply-consent"
            name="consent"
            className="span-2"
            checked={values.consent}
            error={errors.consent}
            onChange={(event) => onChange('consent', event.target.checked)}
            label={
              <>
                {t('apply.fields.consent')}{' '}
                <Link to={PATHS.privacy} target="_blank" rel="noopener">
                  {t('apply.fields.consentLink')}
                </Link>
                .
              </>
            }
          />

          {/* Honeypot: hidden from people and assistive technology. */}
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="apply-website">Website</label>
            <input id="apply-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => onChange('website', event.target.value)} />
          </div>
        </div>
      );

    default:
      return null;
  }
}

function CountryList() {
  return (
    <datalist id="country-list">
      {COUNTRIES.map((country) => (
        <option key={country} value={country} />
      ))}
    </datalist>
  );
}
