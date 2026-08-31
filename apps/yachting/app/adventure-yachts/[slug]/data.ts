// Build variants data for Adventure Yachts AY60
export const buildVariants = [
  {
    id: 'adventure-one',
    slug: 'adventure-one',
    name: 'Adventure One',
    model: 'AY60 Sport',
    variant: 'Outboard',
    tagline: 'Pure performance meets refined luxury',
    location: 'Mediterranean',
    description: 'The AY60 Sport delivers an uncompromising blend of speed, efficiency, and sophistication. Powered by dual COX CXO300 diesel outboard engines, this configuration offers maximum manoeuvrability and easy maintenance, making it the ideal choice for those who demand performance without sacrifice.',
    additionalParagraph: 'Adventure One will make her World Premiere at the International Multi Hull Show at La Grande Motte on April 22-24, 2026. She is positioned perfectly to take advantage of the European summer, whether for private cruising or charter operations.',
    specs: {
      lengthOverall: { value: '18.3 m', imperial: "(60' 0\")" },
      beamOverall: { value: '8.47m', imperial: "(30' 0\")" },
      range: { value: '2,000', unit: 'nm' },
      cruisingSpeed: { value: '14', unit: 'kn' },
      berths: { value: '4+2', unit: '' },
      construction: { value: 'Composite', detail: '(Carbon - eGlass)' },
    },
    imageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/hero-landing.png',
  },
];

export type BuildVariant = typeof buildVariants[number];
