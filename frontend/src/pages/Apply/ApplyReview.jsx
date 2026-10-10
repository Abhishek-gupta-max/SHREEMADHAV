import { useLanguage } from '../../context/LanguageContext.jsx';
import { formatDate } from '../../utils/format.js';

/** Read-only summary of the earlier steps, with links back to edit each one. */
export function ApplyReview({ values, files, onEdit }) {
  const { t, language } = useLanguage();
  const label = (group, value) => (value ? t(`options.${group}.${value}`) : '');

  const groups = [
    {
      step: 0,
      title: t('apply.steps.personal'),
      rows: [
        [t('apply.fields.fullName'), values.fullName],
        [t('apply.fields.email'), values.email],
        [t('apply.fields.phone'), values.phone],
        [t('apply.fields.dateOfBirth'), values.dateOfBirth ? formatDate(values.dateOfBirth, language) : ''],
        [t('apply.fields.gender'), label('gender', values.gender)],
      ],
    },
    {
      step: 1,
      title: t('apply.steps.location'),
      rows: [[t('apply.fields.city'), [values.city, values.state, values.country].filter(Boolean).join(', ')]],
    },
    {
      step: 2,
      title: t('apply.steps.background'),
      rows: [
        [t('apply.fields.qualification'), label('qualification', values.qualification)],
        [t('apply.fields.experience'), label('experience', values.experience)],
        [t('apply.fields.profession'), values.profession],
        [t('apply.fields.preferredOpportunity'), label('opportunity', values.preferredOpportunity)],
      ],
    },
    {
      step: 3,
      title: t('apply.steps.preferences'),
      rows: [
        [t('apply.fields.preferredCountry'), values.preferredCountry],
        [t('apply.fields.preferredSector'), label('sector', values.preferredSector)],
        [t('apply.fields.preferredPosition'), values.preferredPosition],
      ],
    },
  ];

  const fileCount = files.cv.length + files.documents.length;

  return (
    <section className="apply-review" aria-labelledby="apply-review-title">
      <h3 id="apply-review-title">{t('apply.review.title')}</h3>
      {groups.map((group) => (
        <div key={group.step} className="apply-review__group">
          <div className="apply-review__head">
            <h4>{group.title}</h4>
            <button type="button" onClick={() => onEdit(group.step)}>
              {t('apply.review.edit')}
              <span className="visually-hidden"> {group.title}</span>
            </button>
          </div>
          <dl>
            {group.rows.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value || <span className="apply-review__empty">{t('apply.review.notProvided')}</span>}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      <p className="apply-review__files">{t('apply.review.files', { count: fileCount })}</p>
    </section>
  );
}
