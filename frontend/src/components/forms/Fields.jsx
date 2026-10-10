import { forwardRef } from 'react';
import { Icon } from '../common/Icon.jsx';
import './Forms.css';

/**
 * Label + control + hint + error, wired together with aria-describedby and
 * aria-invalid. All field components below are built on this wrapper.
 */
export function FieldShell({ id, label, hint, error, required, optionalLabel, className = '', children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required ? (
            <span className="field__required" aria-hidden="true">
              *
            </span>
          ) : (
            optionalLabel && <span className="field__optional">{optionalLabel}</span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          <Icon name="alert-circle" size={16} />
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id, hint, error) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export const TextField = forwardRef(function TextField(
  { id, label, hint, error, required, optionalLabel, className, type = 'text', ...inputProps },
  ref,
) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} optionalLabel={optionalLabel} className={className}>
      <input
        ref={ref}
        id={id}
        type={type}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...inputProps}
      />
    </FieldShell>
  );
});

export const SelectField = forwardRef(function SelectField(
  { id, label, hint, error, required, optionalLabel, className, options, placeholder, ...selectProps },
  ref,
) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} optionalLabel={optionalLabel} className={className}>
      <div className="select">
        <select
          ref={ref}
          id={id}
          className="input"
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...selectProps}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={18} className="select__chevron" />
      </div>
    </FieldShell>
  );
});

export const TextareaField = forwardRef(function TextareaField(
  { id, label, hint, error, required, optionalLabel, className, maxLength, value = '', ...textareaProps },
  ref,
) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} optionalLabel={optionalLabel} className={className}>
      <textarea
        ref={ref}
        id={id}
        className="input textarea"
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, hint, error)}
        maxLength={maxLength}
        value={value}
        {...textareaProps}
      />
      {maxLength && (
        <span className="field__counter" aria-hidden="true">
          {value.length} / {maxLength}
        </span>
      )}
    </FieldShell>
  );
});

export function CheckboxField({ id, label, error, className = '', ...inputProps }) {
  return (
    <div className={`field field--checkbox ${error ? 'has-error' : ''} ${className}`}>
      <div className="checkbox">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        <label htmlFor={id}>{label}</label>
      </div>
      {error && (
        <p className="field__error" id={`${id}-error`}>
          <Icon name="alert-circle" size={16} />
          {error}
        </p>
      )}
    </div>
  );
}

/** Small alert box used above forms for submission-level errors. */
export function FormAlert({ tone = 'error', title, children }) {
  return (
    <div className={`form-alert form-alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'} tabIndex={-1}>
      <Icon name={tone === 'error' ? 'alert-circle' : tone === 'success' ? 'check-circle' : 'info'} size={20} />
      <div>
        {title && <p className="form-alert__title">{title}</p>}
        {children && <div className="form-alert__body">{children}</div>}
      </div>
    </div>
  );
}
