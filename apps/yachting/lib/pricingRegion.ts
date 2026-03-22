import type { AdventureYachtCurrency } from '@36zero/database';

const EUROPEAN_COUNTRY_CODES = new Set([
  'AD',
  'AL',
  'AT',
  'AX',
  'BA',
  'BE',
  'BG',
  'BY',
  'CH',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FO',
  'FR',
  'GB',
  'GG',
  'GI',
  'GR',
  'HR',
  'HU',
  'IE',
  'IM',
  'IS',
  'IT',
  'JE',
  'LI',
  'LT',
  'LU',
  'LV',
  'MC',
  'MD',
  'ME',
  'MK',
  'MT',
  'NL',
  'NO',
  'PL',
  'PT',
  'RO',
  'RS',
  'SE',
  'SI',
  'SJ',
  'SK',
  'SM',
  'TR',
  'UA',
  'VA',
  'XK',
]);

interface HeaderReader {
  get(name: string): string | null;
}

export function resolveAdventureYachtCurrency({
  countryCode,
  continentCode,
}: {
  countryCode?: string | null;
  continentCode?: string | null;
}): AdventureYachtCurrency {
  const normalizedCountryCode = countryCode?.toUpperCase() ?? null;
  const normalizedContinentCode = continentCode?.toUpperCase() ?? null;

  if (
    normalizedCountryCode && EUROPEAN_COUNTRY_CODES.has(normalizedCountryCode)
  ) {
    return 'EUR';
  }

  if (normalizedContinentCode === 'EU') {
    return 'EUR';
  }

  return 'USD';
}

export function getAdventureYachtCurrencyFromHeaders(headers: HeaderReader): AdventureYachtCurrency {
  return resolveAdventureYachtCurrency({
    countryCode:
      headers.get('x-vercel-ip-country') ??
      headers.get('cf-ipcountry') ??
      headers.get('x-country-code'),
    continentCode:
      headers.get('x-vercel-ip-continent') ??
      headers.get('x-continent-code'),
  });
}
