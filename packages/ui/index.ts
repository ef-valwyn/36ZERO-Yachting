// Components
export { Button, type ButtonProps } from './components/Button';
export { GlassCard, type GlassCardProps } from './components/GlassCard';
export { HeroVideo, type HeroVideoProps } from './components/HeroVideo';
export { Navigation, type NavigationProps, type NavItem } from './components/Navigation';
export { VesselCard, type VesselCardProps } from './components/VesselCard';
export { StepForm, type StepFormProps, type Passage, type LapUserInfo } from './components/StepForm';
export { RouteMap, type RouteMapProps, type RouteStage } from './components/RouteMap';
export { Footer, type FooterProps, type FooterSection, type FooterLink } from './components/Footer';

// Utilities
export { cn, formatPrice, formatDate, slugify, truncate } from './lib/utils';
export { countryCodes, countries } from './lib/countryCodes';
export {
  countryEntriesOnboard,
  countriesOnboardEn,
  countriesOnboardFr,
  enToFr,
  frToEn,
  isCanonicalEnCountry,
  type CountryEntryOnboard,
} from './lib/countriesOnboard';
