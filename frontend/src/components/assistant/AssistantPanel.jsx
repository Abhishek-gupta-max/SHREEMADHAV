import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadDictionary, fallbackDictionary } from '../../i18n/index.js';
import { useSiteSettings } from '../../context/SettingsContext.jsx';
import { useServices } from '../../hooks/useServices.js';
import { session, storage } from '../../utils/storage.js';
import { Icon } from '../common/Icon.jsx';
import { Button } from '../common/Button.jsx';
import { AssistantAvatar } from './AssistantAvatar.jsx';
import { ConsultationForm } from './ConsultationForm.jsx';
import { ASSISTANT_LANGUAGES, assistantStrings } from './assistantStrings.js';
import { buildKnowledge } from './knowledge.js';
import { answerQuestion, getServerStatus, spokenText } from './engine.js';
import { useSpeechRecognition, useSpeechSynthesis } from './useSpeech.js';

const CHAT_KEY = 'smos.assistant.chat';
const MUTE_KEY = 'smos.assistant.muted';
const LANG_KEY = 'smos.assistant.lang';
const DEVANAGARI = /[ऀ-ॿ]/;
const MAX_MESSAGES = 40;

let nextId = Date.now();
const uid = () => (nextId += 1);

function useDictionary(lang) {
  const [dict, setDict] = useState(fallbackDictionary);
  useEffect(() => {
    let cancelled = false;
    loadDictionary(lang)
      .then((d) => !cancelled && setDict(d))
      .catch(() => !cancelled && setDict(fallbackDictionary));
    return () => {
      cancelled = true;
    };
  }, [lang]);
  return dict;
}

function IconButton({ icon, label, onClick, pressed, className = '', disabled }) {
  return (
    <button
      type="button"
      className={`sm-ai-iconbtn ${className}`}
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

function Answer({ answer, s, onConsult, onNavigate }) {
  const paragraphs = String(answer.text || '').split(/\n{2,}/).filter(Boolean);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {answer.bullets?.length > 0 && (
        <ul>
          {answer.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      {answer.extra && (
        <>
          {answer.extra.text && <p>{answer.extra.text}</p>}
          {answer.extra.bullets?.length > 0 && (
            <ul>
              {answer.extra.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </>
      )}
      {(answer.links?.length > 0 || answer.actions?.includes('consult')) && (
        <div className="sm-ai-msg__actions">
          {answer.actions?.includes('consult') && (
            <Button size="sm" icon="calendar" iconPosition="start" onClick={onConsult}>
              {s.consultCta}
            </Button>
          )}
          {answer.links?.map((link) => (
            <Link key={link.to} to={link.to} className="sm-ai-chip" onClick={onNavigate}>
              {link.label}
              <Icon name="arrow-right" size={14} />
            </Link>
          ))}
        </div>
      )}
      <p className="sm-ai-msg__meta">
        <span className={`sm-ai-tag ${answer.mode === 'ai' ? 'is-ai' : ''}`}>
          {answer.mode === 'ai' ? s.modeAi : s.modeDemo}
        </span>
        {answer.sources?.length > 0 && (
          <span>
            {s.sources} {answer.sources.join(' · ')}
          </span>
        )}
      </p>
    </>
  );
}

export default function AssistantPanel({ initialLang, minimized, onMinimize, onExpand, onClose }) {
  const [lang, setLang] = useState(() => {
    const saved = storage.get(LANG_KEY);
    return ASSISTANT_LANGUAGES.some((l) => l.code === saved) ? saved : initialLang;
  });
  const s = assistantStrings(lang);
  const speechLang = ASSISTANT_LANGUAGES.find((l) => l.code === lang)?.speech || 'en-IN';

  const [messages, setMessages] = useState(() => {
    const saved = session.getJSON(CHAT_KEY);
    return Array.isArray(saved) ? saved.slice(-MAX_MESSAGES) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('chat'); // chat | consult
  const [muted, setMuted] = useState(() => storage.get(MUTE_KEY) === '1');
  const [serverMode, setServerMode] = useState({ enabled: false, model: '' });
  const [notice, setNotice] = useState('');

  const inputRef = useRef(null);
  const logRef = useRef(null);
  const abortRef = useRef(null);

  // Knowledge from the website content in both languages.
  const dictEn = useDictionary('en');
  const dictHi = useDictionary('hi');
  const { data: services } = useServices();
  const { settings } = useSiteSettings();
  const knowledge = useMemo(
    () => ({
      en: buildKnowledge(dictEn, { services: services || [], settings }),
      hi: buildKnowledge(dictHi, { services: services || [], settings }),
    }),
    [dictEn, dictHi, services, settings],
  );

  const tts = useSpeechSynthesis();

  useEffect(() => {
    getServerStatus().then(setServerMode);
  }, []);

  // Keep the panel below the sticky site header (see --sm-ai-top in CSS).
  useEffect(() => {
    const update = () => {
      const header = document.querySelector('.site > header');
      const bottom = header ? Math.max(0, Math.round(header.getBoundingClientRect().bottom)) : 0;
      document.documentElement.style.setProperty('--sm-ai-top', `${bottom}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    session.setJSON(CHAT_KEY, messages.slice(-MAX_MESSAGES));
  }, [messages]);

  useEffect(() => storage.set(LANG_KEY, lang), [lang]);
  useEffect(() => storage.set(MUTE_KEY, muted ? '1' : '0'), [muted]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, view]);

  useEffect(() => {
    if (!minimized && view === 'chat') window.setTimeout(() => inputRef.current?.focus(), 60);
  }, [minimized, view]);

  const ask = useCallback(
    async (raw) => {
      const question = String(raw || '').trim().slice(0, 500);
      if (!question || loading) return;
      tts.cancel();
      setNotice('');
      setView('chat');
      const answerLang = DEVANAGARI.test(question) ? 'hi' : lang;
      const userMsg = { id: uid(), role: 'user', content: question };
      setMessages((m) => [...m, userMsg].slice(-MAX_MESSAGES));
      setInput('');
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const history = messages.map((m) => ({ role: m.role, content: m.role === 'user' ? m.content : m.answer?.text || '' }));
        const answer = await answerQuestion(question, {
          chunks: knowledge[answerLang],
          lang: answerLang,
          history,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setMessages((m) => [...m, { id: uid(), role: 'assistant', answer, lang: answerLang }].slice(-MAX_MESSAGES));
        if (!muted) {
          const voiceLang = ASSISTANT_LANGUAGES.find((l) => l.code === answerLang)?.speech || 'en-IN';
          const ok = tts.speak(spokenText(answer), voiceLang);
          if (!ok && tts.supported) setNotice(assistantStrings(answerLang).errors.ttsUnavailable);
        }
      } catch (error) {
        if (error?.name !== 'AbortError') {
          setMessages((m) => [
            ...m,
            { id: uid(), role: 'assistant', answer: { text: s.errors.answer, mode: 'demo', actions: [], links: [] } },
          ]);
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setLoading(false);
      }
    },
    [loading, lang, messages, knowledge, muted, tts, s],
  );

  const mic = useSpeechRecognition({ onFinal: ask });

  const stopAll = useCallback(() => {
    tts.cancel();
    mic.abort();
    abortRef.current?.abort();
  }, [tts, mic]);

  // Stop voice and pending answers when the panel unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const toggleMic = () => {
    if (mic.listening) return mic.stop();
    tts.cancel();
    mic.start(speechLang);
    return undefined;
  };

  const toggleMute = () => {
    setMuted((m) => {
      if (!m) tts.cancel();
      return !m;
    });
  };

  const clear = () => {
    stopAll();
    setMessages([]);
    setView('chat');
    setNotice('');
    mic.setError(null);
    session.remove(CHAT_KEY);
  };

  const handleClose = () => {
    stopAll();
    onClose();
  };

  const onNavigate = () => {
    if (window.matchMedia('(max-width: 640px)').matches) onMinimize();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      handleClose();
    }
  };

  const avatarState = mic.listening ? 'listening' : tts.speaking ? 'speaking' : loading ? 'thinking' : 'idle';
  const statusText = mic.listening ? s.listening : tts.speaking ? s.speaking : loading ? s.thinking : '';
  const busy = loading || tts.speaking || mic.listening;

  if (minimized) {
    return (
      <div className="sm-ai-mini" role="region" aria-label={s.name}>
        <button type="button" className="sm-ai-mini__open" onClick={onExpand} aria-label={s.expand}>
          <AssistantAvatar state={avatarState} size={36} badge={s.aiBadge} />
          <span className="sm-ai-mini__text">
            <strong>{s.name}</strong>
            <span>{statusText || s.expand}</span>
          </span>
        </button>
        {tts.speaking && <IconButton icon="stop" label={s.stopSpeaking} onClick={tts.cancel} />}
        <IconButton icon="close" label={s.close} onClick={handleClose} />
      </div>
    );
  }

  return (
    <section
      className="sm-ai-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="sm-ai-title"
      aria-describedby="sm-ai-tagline"
      onKeyDown={onKeyDown}
    >
      <header className="sm-ai-panel__head">
        <AssistantAvatar state={avatarState} size={48} badge={s.aiBadge} />
        <div className="sm-ai-panel__title">
          <h2 id="sm-ai-title">{s.name}</h2>
          <p id="sm-ai-tagline">
            {statusText ? (
              <span className="sm-ai-status" role="status">
                <span className={`sm-ai-status__dot is-${avatarState}`} />
                {statusText}
              </span>
            ) : (
              s.tagline
            )}
          </p>
        </div>
        <div className="sm-ai-panel__controls">
          <IconButton icon="minus" label={s.minimize} onClick={onMinimize} />
          <IconButton icon="close" label={s.close} onClick={handleClose} />
        </div>
      </header>

      <div className="sm-ai-toolbar">
        <div className="sm-ai-lang" role="group" aria-label={s.voiceLang}>
          {ASSISTANT_LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              className={l.code === lang ? 'is-active' : ''}
              aria-pressed={l.code === lang}
              title={l.name}
              onClick={() => {
                mic.abort();
                setLang(l.code);
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
        <span
          className={`sm-ai-tag ${serverMode.enabled ? 'is-ai' : ''}`}
          title={serverMode.enabled ? s.modeAiHint : s.modeDemoHint}
        >
          {serverMode.enabled ? s.modeAi : s.modeDemo}
        </span>
        <div className="sm-ai-toolbar__right">
          {tts.supported && (
            <IconButton
              icon={muted ? 'volume-off' : 'volume'}
              label={muted ? s.unmute : s.mute}
              pressed={muted}
              onClick={toggleMute}
            />
          )}
          <IconButton icon="trash" label={s.clear} onClick={clear} disabled={!messages.length && view === 'chat'} />
        </div>
      </div>

      <div className="sm-ai-log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions">
        {view === 'consult' ? (
          <ConsultationForm
            s={s}
            onCancel={() => setView('chat')}
            onDone={() =>
              setMessages((m) => [
                ...m,
                { id: uid(), role: 'assistant', answer: { text: s.consult.chatConfirmed, mode: 'system', actions: [], links: [] } },
              ])
            }
          />
        ) : (
          <>
            <div className="sm-ai-msg is-assistant">
              <p>{s.welcome}</p>
              <p className="sm-ai-msg__meta">
                <span className="sm-ai-note">{serverMode.enabled ? s.modeAiHint : s.modeDemoHint}</span>
              </p>
            </div>

            {messages.length === 0 && (
              <div className="sm-ai-suggest">
                <p>{s.suggestionsTitle}</p>
                <div>
                  {s.suggestions.map((q) => (
                    <button key={q} type="button" className="sm-ai-chip" onClick={() => ask(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="sm-ai-msg is-user">
                  <span className="visually-hidden">{s.you}: </span>
                  {m.content}
                </div>
              ) : (
                <div key={m.id} className="sm-ai-msg is-assistant" lang={m.lang}>
                  {m.answer.mode === 'system' ? (
                    <p>{m.answer.text}</p>
                  ) : (
                    <Answer answer={m.answer} s={assistantStrings(m.lang || lang)} onConsult={() => setView('consult')} onNavigate={onNavigate} />
                  )}
                </div>
              ),
            )}

            {loading && (
              <div className="sm-ai-msg is-assistant is-typing" aria-label={s.thinking}>
                <span />
                <span />
                <span />
              </div>
            )}
          </>
        )}
      </div>

      {(mic.error || notice) && (
        <p className="sm-ai-alert" role="alert">
          <Icon name="info" size={16} />
          <span>{mic.error ? s.errors[mic.error] || s.errors.generic : notice}</span>
        </p>
      )}

      {mic.listening && (
        <p className="sm-ai-interim" aria-live="polite">
          <span className="sm-ai-wave" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          {mic.interim || s.listening}
        </p>
      )}

      <form
        className="sm-ai-input"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <button
          type="button"
          className={`sm-ai-mic ${mic.listening ? 'is-on' : ''}`}
          onClick={toggleMic}
          aria-label={mic.listening ? s.micStop : s.micStart}
          title={mic.supported ? (mic.listening ? s.micStop : s.micStart) : s.errors.unsupported}
          aria-pressed={mic.listening}
          disabled={loading}
        >
          <Icon name={mic.listening ? 'stop' : 'mic'} size={18} />
        </button>
        <label htmlFor="sm-ai-text" className="visually-hidden">
          {s.inputLabel}
        </label>
        <input
          ref={inputRef}
          id="sm-ai-text"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={s.inputPlaceholder}
          maxLength={500}
          autoComplete="off"
          enterKeyHint="send"
        />
        {busy && !mic.listening ? (
          <button type="button" className="sm-ai-send is-stop" onClick={stopAll} aria-label={s.stopSpeaking} title={s.stopSpeaking}>
            <Icon name="stop" size={18} />
          </button>
        ) : (
          <button type="submit" className="sm-ai-send" disabled={!input.trim()} aria-label={s.send} title={s.send}>
            <Icon name="send" size={18} />
          </button>
        )}
      </form>
      <p className="sm-ai-disclaimer">{s.disclaimer}</p>
    </section>
  );
}
