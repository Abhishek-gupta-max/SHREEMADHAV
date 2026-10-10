import { useId, useRef, useState } from 'react';
import { Icon } from '../common/Icon.jsx';
import { formatFileSize } from '../../utils/format.js';
import './Forms.css';

/**
 * File picker with drag-and-drop and a list of selected files.
 * Validation is done by the caller (see utils/validation.js) so messages can
 * be translated and shown in the standard field error slot.
 */
export function FileDrop({
  id,
  label,
  hint,
  error,
  required,
  optionalLabel,
  accept,
  multiple = false,
  files = [],
  onChange,
  chooseLabel,
  dropLabel,
  removeLabel,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const autoId = useId();
  const inputId = id || autoId;

  const addFiles = (list) => {
    const incoming = [...list];
    if (!incoming.length) return;
    onChange(multiple ? [...files, ...incoming] : incoming.slice(0, 1));
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const remove = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <span className="field__label" id={`${inputId}-label`}>
        {label}
        {required ? (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        ) : (
          optionalLabel && <span className="field__optional">{optionalLabel}</span>
        )}
      </span>

      {(multiple || files.length === 0) && (
        <div
          className={`dropzone ${dragging ? 'is-dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <Icon name="upload" size={22} />
          <div className="dropzone__text">
            <label htmlFor={inputId} className="dropzone__choose">
              {chooseLabel}
            </label>
            <span>{dropLabel}</span>
          </div>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="dropzone__input"
            accept={accept}
            multiple={multiple}
            aria-labelledby={`${inputId}-label`}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            aria-invalid={error ? true : undefined}
            aria-required={required || undefined}
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </div>
      )}

      {files.length > 0 && (
        <ul role="list" className="file-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${index}`}>
              <Icon name="file" size={18} />
              <span className="file-list__name">{file.name}</span>
              <span className="file-list__size">{formatFileSize(file.size)}</span>
              <button type="button" onClick={() => remove(index)} aria-label={removeLabel(file.name)}>
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {hint && !error && (
        <p className="field__hint" id={`${inputId}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${inputId}-error`}>
          <Icon name="alert-circle" size={16} />
          {error}
        </p>
      )}
    </div>
  );
}
