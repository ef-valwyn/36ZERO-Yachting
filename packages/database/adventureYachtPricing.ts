export type AdventureYachtSlug =
  | 'adventure-one'
  | 'adventure-two'
  | 'adventure-three'
  | 'adventure-four';

export type AdventureYachtCurrency = 'EUR' | 'USD';

export interface AdventureYachtPriceEntry {
  label?: string;
  prefix?: string;
  eur: number;
  usd: number;
}

export interface AdventureYachtPricingConfig {
  card: AdventureYachtPriceEntry;
  detail?: AdventureYachtPriceEntry[];
}

export interface ResolvedAdventureYachtPriceEntry {
  label?: string;
  prefix?: string;
  currency: AdventureYachtCurrency;
  amount: number;
}

const hasPriceEntryShape = (value: unknown): value is AdventureYachtPriceEntry => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AdventureYachtPriceEntry>;

  return typeof candidate.eur === 'number' && typeof candidate.usd === 'number';
};

export const adventureYachtPricingBySlug: Record<AdventureYachtSlug, AdventureYachtPricingConfig> = {
  'adventure-one': {
    card: {
      eur: 2800000,
      usd: 3245000,
    },
  },
  'adventure-two': {
    card: {
      prefix: 'From',
      eur: 2700000,
      usd: 3150000,
    },
  },
  'adventure-three': {
    card: {
      prefix: 'From',
      eur: 2450000,
      usd: 2850000,
    },
    detail: [
      {
        label: 'Charter Model',
        prefix: 'From',
        eur: 2450000,
        usd: 2850000,
      },
      {
        label: 'Owner-Operator Model',
        prefix: 'From',
        eur: 2600000,
        usd: 3000000,
      },
      {
        label: 'SportX Off-Grid Infinity Model',
        prefix: 'From',
        eur: 2800000,
        usd: 3245000,
      },
    ],
  },
  'adventure-four': {
    card: {
      prefix: 'From',
      eur: 2800000,
      usd: 3245000,
    },
  },
};

export function getAdventureYachtPricingConfig(
  slug: string,
  seededPricing?: unknown
): AdventureYachtPricingConfig | null {
  if (seededPricing && typeof seededPricing === 'object') {
    const candidate = seededPricing as Partial<AdventureYachtPricingConfig>;

    if (candidate.card && hasPriceEntryShape(candidate.card)) {
      const detail =
        Array.isArray(candidate.detail) && candidate.detail.every(hasPriceEntryShape)
          ? candidate.detail
          : undefined;

      return {
        card: candidate.card,
        detail,
      };
    }
  }

  return adventureYachtPricingBySlug[slug as AdventureYachtSlug] ?? null;
}

export function resolveAdventureYachtPrice(
  entry: AdventureYachtPriceEntry,
  currency: AdventureYachtCurrency
): ResolvedAdventureYachtPriceEntry {
  return {
    label: entry.label,
    prefix: entry.prefix,
    currency,
    amount: currency === 'EUR' ? entry.eur : entry.usd,
  };
}

export function resolveAdventureYachtPricing(
  pricing: AdventureYachtPricingConfig,
  currency: AdventureYachtCurrency
): {
  card: ResolvedAdventureYachtPriceEntry;
  detail: ResolvedAdventureYachtPriceEntry[];
} {
  return {
    card: resolveAdventureYachtPrice(pricing.card, currency),
    detail: (pricing.detail?.length ? pricing.detail : [pricing.card]).map((entry) =>
      resolveAdventureYachtPrice(entry, currency)
    ),
  };
}
