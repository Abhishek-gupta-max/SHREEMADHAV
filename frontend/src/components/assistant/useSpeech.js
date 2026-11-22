import { useCallback, useEffect, useRef, useState } from 'react';

// Browser-native voice features (Web Speech API). Free, no API keys.
// Speech recognition is only available in some browsers (Chrome, Edge,
// Safari); every caller must keep a text-input fallback.

const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const ERROR_CODES = {
  'not-allowed': 'denied',
  'service-not-allowed': 'denied',
  'audio-capture': 'noMic',
  'no-speech': 'noSpeech',
  network: 'network',
};

/** Microphone → text. The microphone starts only when `start()` is called. */
export function useSpeechRecognition({ onFinal }) {
  const supported = Boolean(Recognition);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const stop = useCallback(() => recRef.current?.stop(), []);
  const abort = useCallback(() => {
    recRef.current?.abort();
    recRef.current = null;
    setListening(false);
    setInterim('');
  }, []);

  const start = useCallback(
    (lang) => {
      setError(null);
      if (!supported) return setError('unsupported');
      if (!window.isSecureContext) return setError('insecure');
      recRef.current?.abort();

      const rec = new Recognition();
      rec.lang = lang;
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      let finalText = '';

      rec.onstart = () => setListening(true);
      rec.onresult = (event) => {
        let live = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result.isFinal) finalText += result[0].transcript;
          else live += result[0].transcript;
        }
        setInterim((finalText + live).trim());
      };
      rec.onerror = (event) => {
        if (event.error === 'aborted') return;
        setError(ERROR_CODES[event.error] || 'generic');
      };
      rec.onend = () => {
        setListening(false);
        setInterim('');
        if (recRef.current === rec) recRef.current = null;
        const text = finalText.trim();
        if (text) onFinalRef.current?.(text);
      };

      recRef.current = rec;
      try {
        rec.start();
      } catch {
        setError('generic');
        setListening(false);
      }
      return undefined;
    },
    [supported],
  );

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, interim, error, setError, start, stop, abort };
}

/* -------------------------------------------------------------------------- */

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

function pickVoice(voices, lang) {
  const base = lang.split('-')[0];
  const exact = voices.filter((v) => v.lang?.toLowerCase() === lang.toLowerCase());
  const sameBase = voices.filter((v) => v.lang?.toLowerCase().startsWith(base));
  const pool = exact.length ? exact : sameBase;
  if (!pool.length) return null;
  // Prefer natural-sounding cloud voices when the browser offers them.
  return pool.find((v) => /natural|google|online/i.test(v.name)) || pool.find((v) => v.localService) || pool[0];
}

/** Splits long text into sentence groups: Chrome stops long utterances early. */
function splitForSpeech(text, max = 180) {
  const sentences = text.match(/[^.!?।]+[.!?।]*/g) || [text];
  const parts = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > max && current) {
      parts.push(current.trim());
      current = '';
    }
    current += s;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Text → speech using the browser's built-in voices. */
export function useSpeechSynthesis() {
  const supported = Boolean(synth);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState(() => (synth ? synth.getVoices() : []));
  const runRef = useRef(0);

  useEffect(() => {
    if (!synth) return undefined;
    const update = () => setVoices(synth.getVoices());
    synth.addEventListener?.('voiceschanged', update);
    update();
    return () => synth.removeEventListener?.('voiceschanged', update);
  }, []);

  const cancel = useCallback(() => {
    runRef.current += 1;
    synth?.cancel();
    setSpeaking(false);
  }, []);

  /** Speaks `text`. Returns false when no voice exists for the language. */
  const speak = useCallback(
    (text, lang) => {
      if (!synth || !text) return false;
      cancel();
      const run = runRef.current;
      const voice = pickVoice(voices.length ? voices : synth.getVoices(), lang);
      if (!voice && !lang.startsWith('en')) return false;

      const parts = splitForSpeech(text);
      parts.forEach((part, index) => {
        const u = new SpeechSynthesisUtterance(part);
        u.lang = voice?.lang || lang;
        if (voice) u.voice = voice;
        u.rate = 1;
        u.pitch = 1;
        if (index === 0) u.onstart = () => run === runRef.current && setSpeaking(true);
        const done = () => {
          if (run === runRef.current && index === parts.length - 1) setSpeaking(false);
        };
        u.onend = done;
        u.onerror = () => run === runRef.current && setSpeaking(false);
        synth.speak(u);
      });
      return true;
    },
    [voices, cancel],
  );

  useEffect(() => () => synth?.cancel(), []);

  return { supported, speaking, speak, cancel };
}
