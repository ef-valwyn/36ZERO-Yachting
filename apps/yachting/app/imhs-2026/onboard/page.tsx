'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import {
  Button,
  cn,
  countryEntriesOnboard,
  enToFr,
  honeypotCx,
  inputCx,
} from '@36zero/ui';
import Logo from '@/components/Logo';

// =========================================
// Constants
// =========================================

const IMHS_LOGO_URL =
  'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/multicoque-logo-white.svg';
const AY_LOGO_URL =
  'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/imhs/ayimhs.png';
const SHIFT_LOGO_URL =
  'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/imhs/shiftlogo.svg';

const NAME_REGEX = /^[\p{L}\p{M} .'\-]{2,100}$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BOT_GUARD_MS = 3000;
const REDIRECT_MS = 2500;

const COPY = {
  en: {
    heading: 'Welcome aboard the AY60',
    subheading:
      "Register your visit — we'll follow up after the show.",
    interestLabel: 'I am interested in',
    interestAY: 'Adventure Yachts',
    interestShift: 'Shift Yachts',
    interestError: 'Please select at least one.',
    fullName: 'Full name',
    email: 'Email',
    country: 'Country of residence',
    nameError: 'Please enter a valid name.',
    emailError: 'Please enter a valid email address.',
    countryError: 'Please pick a country from the list.',
    countryPlaceholder: 'Start typing or tap to see the list',
    submit: 'Register',
    submitting: 'Registering…',
    disclaimer:
      'By submitting, you agree to be contacted by 36ZERO Yachting about the options selected above.',
    privacyLink: 'Privacy policy',
    successHeading: 'Thank you — registration received',
    successSub: 'Redirecting you to Adventure Yachts…',
    duplicateError: 'You have already registered with this email.',
    genericError: 'Something went wrong. Please try again.',
    langLabelEn: 'EN',
    langLabelFr: 'FR',
  },
  fr: {
    heading: 'Bienvenue à bord du AY60',
    subheading:
      'Enregistrez votre visite — nous vous recontacterons après le salon.',
    interestLabel: 'Je suis intéressé par',
    interestAY: 'Adventure Yachts',
    interestShift: 'Shift Yachts',
    interestError: 'Veuillez sélectionner au moins une option.',
    fullName: 'Nom complet',
    email: 'E-mail',
    country: 'Pays de résidence',
    nameError: 'Veuillez saisir un nom valide.',
    emailError: 'Veuillez saisir une adresse e-mail valide.',
    countryError: 'Veuillez choisir un pays dans la liste.',
    countryPlaceholder: 'Tapez ou touchez pour voir la liste',
    submit: "S'inscrire",
    submitting: 'Inscription…',
    disclaimer:
      "En soumettant ce formulaire, vous acceptez d'être contacté par 36ZERO Yachting concernant les options sélectionnées ci-dessus.",
    privacyLink: 'Politique de confidentialité',
    successHeading: 'Merci — inscription enregistrée',
    successSub: 'Redirection vers Adventure Yachts…',
    duplicateError: 'Vous êtes déjà inscrit avec cet e-mail.',
    genericError: 'Une erreur est survenue. Veuillez réessayer.',
    langLabelEn: 'EN',
    langLabelFr: 'FR',
  },
} as const;

type Lang = 'en' | 'fr';

// Accent-fold + lowercase for diacritic-insensitive search.
// e.g. "corée" and "coree" both fold to "coree".
function fold(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

// =========================================
// Country combobox
// =========================================

interface CountryComboboxProps {
  valueEn: string;
  onChangeEn: (en: string) => void;
  invalid: boolean;
  lang: Lang;
  placeholder: string;
  id: string;
}

function CountryCombobox({
  valueEn,
  onChangeEn,
  invalid,
  lang,
  placeholder,
  id,
}: CountryComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const rows = useMemo(
    () =>
      countryEntriesOnboard
        .map((e) => ({ en: e.en, label: lang === 'fr' ? e.fr : e.en }))
        .sort((a, b) => a.label.localeCompare(b.label, lang)),
    [lang]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = fold(query);
    return rows.filter((r) => fold(r.label).includes(q));
  }, [rows, query]);

  const displayValue = valueEn
    ? lang === 'fr'
      ? enToFr(valueEn)
      : valueEn
    : '';

  // Close on outside click (mobile-friendly).
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        type="text"
        value={open ? query : displayValue}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="country-name"
        inputMode="text"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        className={cn(inputCx, invalid && 'border-red-500')}
      />
      {open && filtered.length > 0 && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-white/10 bg-brand-navy/95 backdrop-blur shadow-2xl"
        >
          {filtered.map((r) => (
            <li
              key={r.en}
              role="option"
              aria-selected={valueEn === r.en}
              // onMouseDown so the click lands before the input blurs.
              onMouseDown={(e) => {
                e.preventDefault();
                onChangeEn(r.en);
                setOpen(false);
                setQuery('');
              }}
              className={cn(
                'px-4 py-2.5 text-sm cursor-pointer text-white/90 hover:bg-white/10 active:bg-white/15',
                valueEn === r.en && 'bg-white/5'
              )}
            >
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =========================================
// Interest card (multi-select tile)
// =========================================

interface InterestCardProps {
  selected: boolean;
  onToggle: () => void;
  label: string;
  imageUrl: string;
  imageAlt: string;
}

function InterestCard({
  selected,
  onToggle,
  label,
  imageUrl,
  imageAlt,
}: InterestCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'relative flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all',
        'bg-white/5 text-white/90',
        selected
          ? 'border-brand-blue ring-2 ring-brand-blue/40 shadow-[0_0_20px_-4px_rgba(47,151,221,0.45)]'
          : 'border-white/10 hover:border-white/20'
      )}
    >
      <div className="flex h-10 items-center justify-center">
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={80}
          height={40}
          className="h-10 w-auto object-contain"
          unoptimized
        />
      </div>
      <span className="text-xs font-medium">{label}</span>
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue">
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// =========================================
// Language toggle pill
// =========================================

interface LangToggleProps {
  lang: Lang;
  onSwitch: (next: Lang) => void;
}

function LangToggle({ lang, onSwitch }: LangToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-xs">
      <button
        type="button"
        aria-pressed={lang === 'en'}
        onClick={() => onSwitch('en')}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors',
          lang === 'en' ? 'bg-brand-blue text-white' : 'text-white/60 hover:text-white/80'
        )}
      >
        <span aria-hidden>🇬🇧</span>
        <span>EN</span>
      </button>
      <button
        type="button"
        aria-pressed={lang === 'fr'}
        onClick={() => onSwitch('fr')}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors',
          lang === 'fr' ? 'bg-brand-blue text-white' : 'text-white/60 hover:text-white/80'
        )}
      >
        <span aria-hidden>🇫🇷</span>
        <span>FR</span>
      </button>
    </div>
  );
}

// =========================================
// Page
// =========================================

function OnboardPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang: Lang = searchParams.get('lang') === 'fr' ? 'fr' : 'en';
  const t = COPY[lang];

  // --- Form state (canonical English for country) ---
  const [interestAY, setInterestAY] = useState(false);
  const [interestShift, setInterestShift] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryEn, setCountryEn] = useState('');

  // --- Errors ---
  const [interestError, setInterestError] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [countryError, setCountryError] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // --- Submit / success ---
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- Anti-bot ---
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef<number>(Date.now());

  // --- Cleanup setTimeout on unmount ---
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const switchLang = (next: Lang) => {
    const p = new URLSearchParams(searchParams.toString());
    if (next === 'en') p.delete('lang');
    else p.set('lang', 'fr');
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  function splitName(full: string): { first: string; last: string } {
    const trimmed = full.trim().replace(/\s+/g, ' ');
    const idx = trimmed.indexOf(' ');
    if (idx === -1) return { first: trimmed, last: '' };
    return {
      first: trimmed.slice(0, idx),
      last: trimmed.slice(idx + 1),
    };
  }

  function validate(): boolean {
    let ok = true;

    if (!interestAY && !interestShift) {
      setInterestError(true);
      ok = false;
    } else {
      setInterestError(false);
    }

    const trimmedName = fullName.trim();
    if (!trimmedName || !NAME_REGEX.test(trimmedName)) {
      setNameError(t.nameError);
      ok = false;
    } else {
      setNameError('');
    }

    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError(t.emailError);
      ok = false;
    } else {
      setEmailError('');
    }

    if (
      !countryEn ||
      !countryEntriesOnboard.some((e) => e.en === countryEn)
    ) {
      setCountryError(true);
      ok = false;
    } else {
      setCountryError(false);
    }

    return ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');

    // Bot guards — silent no-op if tripped.
    if (honeypot) return;
    if (Date.now() - formLoadedAt.current < BOT_GUARD_MS) return;

    if (!validate()) return;

    setSubmitting(true);
    try {
      const { first, last } = splitName(fullName);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadSource: 'imhs_onboard_registration',
          email: email.trim(),
          firstName: first,
          lastName: last,
          country: countryEn,
          interestAdventureYachts: interestAY,
          interestShift: interestShift,
        }),
      });

      if (res.status === 409) {
        setSubmitError(t.duplicateError);
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setSuccess(true);
      redirectTimer.current = setTimeout(() => {
        router.push('/adventure-yachts');
      }, REDIRECT_MS);
    } catch (err) {
      console.error('Onboard registration failed:', err);
      setSubmitError(t.genericError);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen min-h-[100svh] min-h-[100dvh] bg-brand-navy text-white">
      <div className="mx-auto w-full max-w-md px-5 pt-6 pb-16">
        {/* Language toggle — top right */}
        <div className="mb-4 flex justify-end">
          <LangToggle lang={lang} onSwitch={switchLang} />
        </div>

        {/* Logos */}
        <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Logo variant="full" className="h-10 w-auto" />
          <Image
            src={IMHS_LOGO_URL}
            alt="International Multihull Show 2026"
            width={160}
            height={56}
            className="h-12 w-auto"
            unoptimized
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold tracking-tight">{t.heading}</h1>
        <p className="mt-1 text-sm text-white/60">{t.subheading}</p>

        {success ? (
          <div
            className="mt-8 rounded-2xl border border-brand-blue/30 bg-brand-blue/5 p-6 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue">
              <Check className="h-7 w-7 text-white" strokeWidth={3} />
            </div>
            <h2 className="mt-4 text-lg font-semibold">{t.successHeading}</h2>
            <p className="mt-2 text-sm text-white/70">{t.successSub}</p>
          </div>
        ) : (
          <form
            id="form-imhs-onboard-registration"
            name="IMHS 2026 Onboard Registration"
            data-hs-cf-bound="true"
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
            noValidate
          >
            {/* Honeypot — hidden off-screen, bots fill it */}
            <input
              type="text"
              name="company_website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className={honeypotCx}
            />

            {/* Interests */}
            <fieldset>
              <legend className="mb-2 block text-xs font-medium text-white/60">
                {t.interestLabel} <span className="text-red-400">*</span>
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <InterestCard
                  selected={interestAY}
                  onToggle={() => setInterestAY((v) => !v)}
                  label={t.interestAY}
                  imageUrl={AY_LOGO_URL}
                  imageAlt={t.interestAY}
                />
                <InterestCard
                  selected={interestShift}
                  onToggle={() => setInterestShift((v) => !v)}
                  label={t.interestShift}
                  imageUrl={SHIFT_LOGO_URL}
                  imageAlt={t.interestShift}
                />
              </div>
              {interestError && (
                <p className="mt-2 text-xs text-red-400">{t.interestError}</p>
              )}
            </fieldset>

            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-1 block text-xs font-medium text-white/60"
              >
                {t.fullName} <span className="text-red-400">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={cn(inputCx, nameError && 'border-red-500')}
                aria-invalid={!!nameError}
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-400">{nameError}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-medium text-white/60"
              >
                {t.email} <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(inputCx, emailError && 'border-red-500')}
                aria-invalid={!!emailError}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-400">{emailError}</p>
              )}
            </div>

            {/* Country combobox */}
            <div>
              <label
                htmlFor="country"
                className="mb-1 block text-xs font-medium text-white/60"
              >
                {t.country} <span className="text-red-400">*</span>
              </label>
              <CountryCombobox
                id="country"
                valueEn={countryEn}
                onChangeEn={setCountryEn}
                invalid={countryError}
                lang={lang}
                placeholder={t.countryPlaceholder}
              />
              {countryError && (
                <p className="mt-1 text-xs text-red-400">{t.countryError}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={submitting}
                className="w-full"
              >
                {submitting ? t.submitting : t.submit}
              </Button>
              {submitError && (
                <p
                  className="mt-2 text-center text-sm text-red-400"
                  role="alert"
                  aria-live="polite"
                >
                  {submitError}
                </p>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-white/50">
                {t.disclaimer}{' '}
                <a
                  href="/privacy"
                  className="underline decoration-white/30 hover:text-white/80"
                >
                  {t.privacyLink}
                </a>
                .
              </p>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default function OnboardPage() {
  // Suspense is belt-and-braces — root layout is already `force-dynamic`, but
  // next/navigation's useSearchParams still warns in some build configurations
  // without a boundary. Cheap to include.
  return (
    <Suspense fallback={<main className="min-h-screen bg-brand-navy" />}>
      <OnboardPageInner />
    </Suspense>
  );
}
