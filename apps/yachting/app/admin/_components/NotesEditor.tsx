'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button, cn } from '@36zero/ui';

interface NotesEditorProps {
  onSubmit: (body: string) => Promise<void>;
  placeholder?: string;
}

// Minimal TS interop for Web Speech API — not part of standard lib.d.ts.
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

function getSR(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const anyWin = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return anyWin.SpeechRecognition ?? anyWin.webkitSpeechRecognition ?? null;
}

const baseInput =
  'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors resize-none';

export default function NotesEditor({ onSubmit, placeholder }: NotesEditorProps) {
  const [body, setBody] = useState('');
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [srSupported, setSrSupported] = useState(false);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SR = getSR();
    if (!SR) {
      setSrSupported(false);
      return;
    }
    setSrSupported(true);
    const rec = new SR();
    rec.lang = 'en-GB';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0].transcript;
        if (r.isFinal) finalText += text;
        else interimText += text;
      }
      if (finalText) {
        setBody((prev) => {
          const needsSpace = prev && !prev.endsWith(' ') && !prev.endsWith('\n');
          return prev + (needsSpace ? ' ' : '') + finalText.trim() + ' ';
        });
      }
      setInterim(interimText);
    };
    rec.onend = () => {
      setListening(false);
      setInterim('');
    };
    rec.onerror = (e) => {
      console.warn('[NotesEditor] speech error:', e.error);
      setListening(false);
      setInterim('');
    };
    recogRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  function toggleListening() {
    const rec = recogRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        // Already started — noop
      }
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setBody('');
      setInterim('');
    } catch (err) {
      console.error(err);
      setError('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKeyDown}
          rows={4}
          placeholder={placeholder ?? 'Add a note… ⌘+Enter to save'}
          className={cn(baseInput, 'pr-12')}
          disabled={submitting}
        />
        {srSupported && (
          <button
            type="button"
            onClick={toggleListening}
            aria-pressed={listening}
            aria-label={listening ? 'Stop dictation' : 'Start dictation'}
            className={cn(
              'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border transition',
              listening
                ? 'border-red-400/40 bg-red-400/10 text-red-300 animate-pulse'
                : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
            )}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
      </div>

      {interim && (
        <p className="px-1 text-xs italic text-white/40">{interim}</p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-white/40">
          {srSupported
            ? 'Type or tap the mic to dictate.'
            : 'Dictation unavailable in this browser.'}
        </p>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={submitting || !body.trim()}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving
            </span>
          ) : (
            'Save note'
          )}
        </Button>
      </div>
    </form>
  );
}
