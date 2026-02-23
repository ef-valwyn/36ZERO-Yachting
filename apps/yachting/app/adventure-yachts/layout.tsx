import { FAQSchema } from '@/components/FAQSchema';
import { EventSchema } from '@/components/EventSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';

const ay60FAQs = [
  {
    question: 'What is the Adventure Yachts AY60?',
    answer:
      'The AY60 is a revolutionary 60-foot (18.3m) power catamaran designed for long-range ocean cruising. Built with lightweight carbon/eGlass composite construction at just 18,500 kg displacement, it offers exceptional performance, range, and comfort for extended blue-water passages.',
  },
  {
    question: 'What is the range of the AY60 catamaran?',
    answer:
      'The AY60 offers over 2,000 nautical miles range in Sport (Outboard) configuration and up to 2,500 nautical miles in the Flybridge Hybrid Inboard configuration. With optimal energy autonomy from 8 kWp of solar panels and a 1,800 Ah battery bank, the AY60 can achieve up to 3,000 nautical miles at 8 knots.',
  },
  {
    question: 'How many cabins does the AY60 have?',
    answer:
      'The AY60 features a 4+2 berths configuration with accommodation for 8-10 guests and 2 crew. Each cabin can be configured as a twin or queen layout, and the vessel includes spacious living areas including a saloon, galley, cockpit, and outdoor deck.',
  },
  {
    question: 'Where is the AY60 built?',
    answer:
      'The AY60 is built in Thailand by a team of skilled artisans who incorporate multi-generational boat-building knowledge with modern composite construction techniques. The hulls are built using carbon/epoxy and eGlass/epoxy for exceptional strength-to-weight ratio.',
  },
  {
    question: 'When is the AY60 World Premiere?',
    answer:
      'The AY60 Sport (Adventure One) will have its World Premiere at the International Multihull Show (Salon International du Multicoque) in La Grande Motte, France, from April 22-26, 2026. Visit the 36ZERO Yachting stand to see the vessel in person.',
  },
  {
    question: 'Is the AY60 nominated for any awards?',
    answer:
      'Yes, the AY60 is nominated for the prestigious Multihull of the Year (MOTY) 2026 award. Voting is open until the International Multihull Show in La Grande Motte. The AY60 competes in the Multipower category against other leading power catamarans.',
  },
  {
    question: 'What propulsion options does the AY60 offer?',
    answer:
      'The AY60 is available in three configurations: the AY60 Sport with dual outboard engines for pure performance, the AY60 Flybridge with hybrid inboard propulsion for extended range and sustainable cruising, and the AY60 SportX outboard explorer variant engineered for ocean passages.',
  },
];

export default function AdventureYachtsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FAQSchema faqs={ay60FAQs} />
      <EventSchema
        name="AY60 Power Catamaran World Premiere - International Multihull Show 2026"
        description="World Premiere of the Adventure Yachts AY60 Sport power catamaran at the International Multihull Show (Salon International du Multicoque) in La Grande Motte, France. Visit the 36ZERO Yachting stand to see the AY60 in person and explore the full range of Adventure Yachts power catamarans."
        startDate="2026-04-22"
        endDate="2026-04-26"
        location={{
          name: 'International Multihull Show (Salon International du Multicoque)',
          address: 'Port de plaisance',
          city: 'La Grande Motte',
          country: 'FR',
        }}
        url="https://www.36zeroyachting.com/adventure-yachts"
        image="https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/hero-landing.png"
        organizer={{
          name: 'Salon International du Multicoque',
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.36zeroyachting.com' },
          {
            name: 'Adventure Yachts',
            url: 'https://www.36zeroyachting.com/adventure-yachts',
          },
        ]}
      />
      {children}
    </>
  );
}
