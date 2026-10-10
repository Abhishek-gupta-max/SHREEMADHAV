import { useEffect, useId, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Icon } from './Icon.jsx';
import './LanguageSelector.css';

/**
 * Language picker following the WAI-ARIA "select-only combobox / listbox"
 * pattern: Enter, Space or ↓ opens; ↑/↓, Home/End move; Enter/Space chooses;
 * Escape or Tab closes and returns focus to the button.
 *
 * `tone`: 'dark' (on light backgrounds) or 'light' (on navy, e.g. footer).
 * `placement`: 'bottom' (header) or 'top' (footer).
 */
export function LanguageSelector({ tone = 'dark', placement = 'bottom', align = 'end' }) {
  const { language, setLanguage, languages, current, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const id = useId();
  const listId = `${id}-list`;

  const selectedIndex = Math.max(0, languages.findIndex((item) => item.code === language));

  useEffect(() => {
    if (!open) return undefined;
    setActiveIndex(selectedIndex);
    listRef.current?.focus();

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, selectedIndex]);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const choose = (index) => {
    setLanguage(languages[index].code);
    close();
  };

  const onButtonKeyDown = (event) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (event) => {
    const last = languages.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => (index >= last ? 0 : index + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => (index <= 0 ? last : index - 1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(last);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        close(false);
        break;
      default: {
        // Type-ahead on the English name.
        const char = event.key.toLowerCase();
        const match = languages.findIndex((item) => item.name.toLowerCase().startsWith(char));
        if (match >= 0) setActiveIndex(match);
      }
    }
  };

  return (
    <div className={`lang lang--${tone} lang--${placement} lang--align-${align}`} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="lang__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${t('language.select')}. ${t('language.current', { name: current.name })}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onButtonKeyDown}
      >
        <Icon name="globe" size={18} />
        <span className="lang__current" lang={current.code}>
          {current.native}
        </span>
        <Icon name="chevron-down" size={16} className="lang__chevron" />
      </button>

      {open && (
        <div className="lang__panel">
          <p className="lang__heading" id={`${id}-label`}>
            {t('language.select')}
          </p>
          <ul
            ref={listRef}
            id={listId}
            className="lang__list"
            role="listbox"
            tabIndex={-1}
            aria-labelledby={`${id}-label`}
            aria-activedescendant={`${id}-opt-${languages[activeIndex].code}`}
            onKeyDown={onListKeyDown}
          >
            {languages.map((item, index) => {
              const selected = item.code === language;
              return (
                <li
                  key={item.code}
                  id={`${id}-opt-${item.code}`}
                  role="option"
                  aria-selected={selected}
                  className={`lang__option ${index === activeIndex ? 'is-active' : ''} ${selected ? 'is-selected' : ''}`}
                  onClick={() => choose(index)}
                  onMouseMove={() => setActiveIndex(index)}
                >
                  <span className="lang__code" aria-hidden="true">
                    {item.short}
                  </span>
                  <span className="lang__names">
                    <span className="lang__native" lang={item.code}>
                      {item.native}
                    </span>
                    {item.native !== item.name && <span className="lang__english">{item.name}</span>}
                  </span>
                  {selected && <Icon name="check" size={18} className="lang__check" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Always-visible variant for the mobile menu: a native radio group. */
export function LanguageSegmented() {
  const { language, setLanguage, languages, t } = useLanguage();
  const name = useId();
  return (
    <fieldset className="lang-seg">
      <legend className="lang-seg__legend">
        <Icon name="globe" size={16} />
        {t('language.label')}
      </legend>
      <div className="lang-seg__options">
        {languages.map((item) => (
          <label key={item.code} className={`lang-seg__option ${item.code === language ? 'is-selected' : ''}`}>
            <input
              type="radio"
              name={name}
              value={item.code}
              checked={item.code === language}
              onChange={() => setLanguage(item.code)}
            />
            <span lang={item.code}>{item.native}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
