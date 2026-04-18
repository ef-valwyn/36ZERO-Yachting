/**
 * Canonical country dataset for the IMHS 2026 onboard-registration form.
 *
 * Keyed by ISO 3166-1 alpha-2. Hand-built, proofread; NO runtime title-casing.
 * Source for the French column: user-supplied Drupal webform list (239 entries).
 * Source for the English column: standard ISO 3166-1 common English names.
 *
 * This dataset is deliberately standalone and MUST NOT be merged with the legacy
 * packages/ui/lib/countryCodes.ts `countries` array. The legacy list has only
 * 196 entries, uses informal names ("Antigua & Deps", "Ireland {Republic}"),
 * and still backs other production forms. Keep both lists alive, independent.
 */

export interface CountryEntryOnboard {
  /** ISO 3166-1 alpha-2 code, e.g. 'SG' */
  code: string;
  /** Canonical English display name (what gets stored in the DB and HubSpot) */
  en: string;
  /** Canonical French display name (what French-speaking users see) */
  fr: string;
}

export const countryEntriesOnboard: CountryEntryOnboard[] = [
  { code: 'AF', en: 'Afghanistan', fr: 'Afghanistan' },
  { code: 'ZA', en: 'South Africa', fr: 'Afrique du Sud' },
  { code: 'AX', en: 'Åland Islands', fr: 'Åland, Îles' },
  { code: 'AL', en: 'Albania', fr: 'Albanie' },
  { code: 'DZ', en: 'Algeria', fr: 'Algérie' },
  { code: 'DE', en: 'Germany', fr: 'Allemagne' },
  { code: 'AD', en: 'Andorra', fr: 'Andorre' },
  { code: 'AO', en: 'Angola', fr: 'Angola' },
  { code: 'AI', en: 'Anguilla', fr: 'Anguilla' },
  { code: 'AQ', en: 'Antarctica', fr: 'Antarctique' },
  { code: 'AG', en: 'Antigua and Barbuda', fr: 'Antigua-et-Barbuda' },
  { code: 'AN', en: 'Netherlands Antilles', fr: 'Antilles Néerlandaises' },
  { code: 'SA', en: 'Saudi Arabia', fr: 'Arabie Saoudite' },
  { code: 'AR', en: 'Argentina', fr: 'Argentine' },
  { code: 'AM', en: 'Armenia', fr: 'Arménie' },
  { code: 'AW', en: 'Aruba', fr: 'Aruba' },
  { code: 'AU', en: 'Australia', fr: 'Australie' },
  { code: 'AT', en: 'Austria', fr: 'Autriche' },
  { code: 'AZ', en: 'Azerbaijan', fr: 'Azerbaïdjan' },
  { code: 'BS', en: 'Bahamas', fr: 'Bahamas' },
  { code: 'BH', en: 'Bahrain', fr: 'Bahreïn' },
  { code: 'BD', en: 'Bangladesh', fr: 'Bangladesh' },
  { code: 'BB', en: 'Barbados', fr: 'Barbade' },
  { code: 'BY', en: 'Belarus', fr: 'Bélarus' },
  { code: 'BE', en: 'Belgium', fr: 'Belgique' },
  { code: 'BZ', en: 'Belize', fr: 'Belize' },
  { code: 'BJ', en: 'Benin', fr: 'Bénin' },
  { code: 'BM', en: 'Bermuda', fr: 'Bermudes' },
  { code: 'BT', en: 'Bhutan', fr: 'Bhoutan' },
  { code: 'BO', en: 'Bolivia, Plurinational State of', fr: 'Bolivie, l\'État Plurinational de' },
  { code: 'BA', en: 'Bosnia and Herzegovina', fr: 'Bosnie-Herzégovine' },
  { code: 'BW', en: 'Botswana', fr: 'Botswana' },
  { code: 'BV', en: 'Bouvet Island', fr: 'Bouvet, Île' },
  { code: 'BR', en: 'Brazil', fr: 'Brésil' },
  { code: 'BN', en: 'Brunei Darussalam', fr: 'Brunéi Darussalam' },
  { code: 'BG', en: 'Bulgaria', fr: 'Bulgarie' },
  { code: 'BF', en: 'Burkina Faso', fr: 'Burkina Faso' },
  { code: 'BI', en: 'Burundi', fr: 'Burundi' },
  { code: 'KY', en: 'Cayman Islands', fr: 'Caïmanes, Îles' },
  { code: 'KH', en: 'Cambodia', fr: 'Cambodge' },
  { code: 'CM', en: 'Cameroon', fr: 'Cameroun' },
  { code: 'CA', en: 'Canada', fr: 'Canada' },
  { code: 'CV', en: 'Cape Verde', fr: 'Cap-Vert' },
  { code: 'CF', en: 'Central African Republic', fr: 'Centrafricaine, République' },
  { code: 'CL', en: 'Chile', fr: 'Chili' },
  { code: 'CN', en: 'China', fr: 'Chine' },
  { code: 'CX', en: 'Christmas Island', fr: 'Christmas, Île' },
  { code: 'CY', en: 'Cyprus', fr: 'Chypre' },
  { code: 'CC', en: 'Cocos (Keeling) Islands', fr: 'Cocos (Keeling), Îles' },
  { code: 'CO', en: 'Colombia', fr: 'Colombie' },
  { code: 'KM', en: 'Comoros', fr: 'Comores' },
  { code: 'CG', en: 'Congo', fr: 'Congo' },
  { code: 'CD', en: 'Congo, the Democratic Republic of the', fr: 'Congo, la République Démocratique du' },
  { code: 'CK', en: 'Cook Islands', fr: 'Cook, Îles' },
  { code: 'KR', en: 'Korea, Republic of', fr: 'Corée, République de' },
  { code: 'KP', en: 'Korea, Democratic People\'s Republic of', fr: 'Corée, République Populaire Démocratique de' },
  { code: 'CR', en: 'Costa Rica', fr: 'Costa Rica' },
  { code: 'CI', en: 'Côte d\'Ivoire', fr: 'Côte d\'Ivoire' },
  { code: 'HR', en: 'Croatia', fr: 'Croatie' },
  { code: 'CU', en: 'Cuba', fr: 'Cuba' },
  { code: 'DK', en: 'Denmark', fr: 'Danemark' },
  { code: 'DJ', en: 'Djibouti', fr: 'Djibouti' },
  { code: 'DO', en: 'Dominican Republic', fr: 'Dominicaine, République' },
  { code: 'DM', en: 'Dominica', fr: 'Dominique' },
  { code: 'EG', en: 'Egypt', fr: 'Égypte' },
  { code: 'SV', en: 'El Salvador', fr: 'El Salvador' },
  { code: 'AE', en: 'United Arab Emirates', fr: 'Émirats Arabes Unis' },
  { code: 'EC', en: 'Ecuador', fr: 'Équateur' },
  { code: 'ER', en: 'Eritrea', fr: 'Érythrée' },
  { code: 'ES', en: 'Spain', fr: 'Espagne' },
  { code: 'EE', en: 'Estonia', fr: 'Estonie' },
  { code: 'US', en: 'United States', fr: 'États-Unis' },
  { code: 'ET', en: 'Ethiopia', fr: 'Éthiopie' },
  { code: 'FK', en: 'Falkland Islands (Malvinas)', fr: 'Falkland, Îles (Malvinas)' },
  { code: 'FO', en: 'Faroe Islands', fr: 'Féroé, Îles' },
  { code: 'FJ', en: 'Fiji', fr: 'Fidji' },
  { code: 'FI', en: 'Finland', fr: 'Finlande' },
  { code: 'FR', en: 'France', fr: 'France' },
  { code: 'GA', en: 'Gabon', fr: 'Gabon' },
  { code: 'GM', en: 'Gambia', fr: 'Gambie' },
  { code: 'GE', en: 'Georgia', fr: 'Géorgie' },
  { code: 'GS', en: 'South Georgia and the South Sandwich Islands', fr: 'Géorgie du Sud et les Îles Sandwich du Sud' },
  { code: 'GH', en: 'Ghana', fr: 'Ghana' },
  { code: 'GI', en: 'Gibraltar', fr: 'Gibraltar' },
  { code: 'GR', en: 'Greece', fr: 'Grèce' },
  { code: 'GD', en: 'Grenada', fr: 'Grenade' },
  { code: 'GL', en: 'Greenland', fr: 'Groenland' },
  { code: 'GP', en: 'Guadeloupe', fr: 'Guadeloupe' },
  { code: 'GU', en: 'Guam', fr: 'Guam' },
  { code: 'GT', en: 'Guatemala', fr: 'Guatemala' },
  { code: 'GG', en: 'Guernsey', fr: 'Guernesey' },
  { code: 'GN', en: 'Guinea', fr: 'Guinée' },
  { code: 'GW', en: 'Guinea-Bissau', fr: 'Guinée-Bissau' },
  { code: 'GQ', en: 'Equatorial Guinea', fr: 'Guinée Équatoriale' },
  { code: 'GY', en: 'Guyana', fr: 'Guyana' },
  { code: 'GF', en: 'French Guiana', fr: 'Guyane Française' },
  { code: 'HT', en: 'Haiti', fr: 'Haïti' },
  { code: 'HM', en: 'Heard Island and McDonald Islands', fr: 'Heard, Île et McDonald, Îles' },
  { code: 'HN', en: 'Honduras', fr: 'Honduras' },
  { code: 'HK', en: 'Hong Kong', fr: 'Hong-Kong' },
  { code: 'HU', en: 'Hungary', fr: 'Hongrie' },
  { code: 'IM', en: 'Isle of Man', fr: 'Île de Man' },
  { code: 'UM', en: 'United States Minor Outlying Islands', fr: 'Îles Mineures Éloignées des États-Unis' },
  { code: 'VG', en: 'Virgin Islands, British', fr: 'Îles Vierges Britanniques' },
  { code: 'VI', en: 'Virgin Islands, U.S.', fr: 'Îles Vierges des États-Unis' },
  { code: 'IN', en: 'India', fr: 'Inde' },
  { code: 'ID', en: 'Indonesia', fr: 'Indonésie' },
  { code: 'IR', en: 'Iran, Islamic Republic of', fr: 'Iran, République Islamique d\'' },
  { code: 'IQ', en: 'Iraq', fr: 'Iraq' },
  { code: 'IE', en: 'Ireland', fr: 'Irlande' },
  { code: 'IS', en: 'Iceland', fr: 'Islande' },
  { code: 'IL', en: 'Israel', fr: 'Israël' },
  { code: 'IT', en: 'Italy', fr: 'Italie' },
  { code: 'JM', en: 'Jamaica', fr: 'Jamaïque' },
  { code: 'JP', en: 'Japan', fr: 'Japon' },
  { code: 'JE', en: 'Jersey', fr: 'Jersey' },
  { code: 'JO', en: 'Jordan', fr: 'Jordanie' },
  { code: 'KZ', en: 'Kazakhstan', fr: 'Kazakhstan' },
  { code: 'KE', en: 'Kenya', fr: 'Kenya' },
  { code: 'KG', en: 'Kyrgyzstan', fr: 'Kirghizistan' },
  { code: 'KI', en: 'Kiribati', fr: 'Kiribati' },
  { code: 'KW', en: 'Kuwait', fr: 'Koweït' },
  { code: 'LA', en: 'Lao People\'s Democratic Republic', fr: 'Lao, République Démocratique Populaire' },
  { code: 'LS', en: 'Lesotho', fr: 'Lesotho' },
  { code: 'LV', en: 'Latvia', fr: 'Lettonie' },
  { code: 'LB', en: 'Lebanon', fr: 'Liban' },
  { code: 'LR', en: 'Liberia', fr: 'Libéria' },
  { code: 'LY', en: 'Libyan Arab Jamahiriya', fr: 'Libyenne, Jamahiriya Arabe' },
  { code: 'LI', en: 'Liechtenstein', fr: 'Liechtenstein' },
  { code: 'LT', en: 'Lithuania', fr: 'Lituanie' },
  { code: 'LU', en: 'Luxembourg', fr: 'Luxembourg' },
  { code: 'MO', en: 'Macao', fr: 'Macao' },
  { code: 'MK', en: 'Macedonia, the former Yugoslav Republic of', fr: 'Macédoine, l\'ex-République Yougoslave de' },
  { code: 'MG', en: 'Madagascar', fr: 'Madagascar' },
  { code: 'MY', en: 'Malaysia', fr: 'Malaisie' },
  { code: 'MW', en: 'Malawi', fr: 'Malawi' },
  { code: 'MV', en: 'Maldives', fr: 'Maldives' },
  { code: 'ML', en: 'Mali', fr: 'Mali' },
  { code: 'MT', en: 'Malta', fr: 'Malte' },
  { code: 'MP', en: 'Northern Mariana Islands', fr: 'Mariannes du Nord, Îles' },
  { code: 'MA', en: 'Morocco', fr: 'Maroc' },
  { code: 'MH', en: 'Marshall Islands', fr: 'Marshall, Îles' },
  { code: 'MQ', en: 'Martinique', fr: 'Martinique' },
  { code: 'MU', en: 'Mauritius', fr: 'Maurice' },
  { code: 'MR', en: 'Mauritania', fr: 'Mauritanie' },
  { code: 'YT', en: 'Mayotte', fr: 'Mayotte' },
  { code: 'MX', en: 'Mexico', fr: 'Mexique' },
  { code: 'FM', en: 'Micronesia, Federated States of', fr: 'Micronésie, États Fédérés de' },
  { code: 'MD', en: 'Moldova, Republic of', fr: 'Moldova, République de' },
  { code: 'MC', en: 'Monaco', fr: 'Monaco' },
  { code: 'MN', en: 'Mongolia', fr: 'Mongolie' },
  { code: 'ME', en: 'Montenegro', fr: 'Monténégro' },
  { code: 'MS', en: 'Montserrat', fr: 'Montserrat' },
  { code: 'MZ', en: 'Mozambique', fr: 'Mozambique' },
  { code: 'MM', en: 'Myanmar', fr: 'Myanmar' },
  { code: 'NA', en: 'Namibia', fr: 'Namibie' },
  { code: 'NR', en: 'Nauru', fr: 'Nauru' },
  { code: 'NP', en: 'Nepal', fr: 'Népal' },
  { code: 'NI', en: 'Nicaragua', fr: 'Nicaragua' },
  { code: 'NE', en: 'Niger', fr: 'Niger' },
  { code: 'NG', en: 'Nigeria', fr: 'Nigéria' },
  { code: 'NU', en: 'Niue', fr: 'Niué' },
  { code: 'NF', en: 'Norfolk Island', fr: 'Norfolk, Île' },
  { code: 'NO', en: 'Norway', fr: 'Norvège' },
  { code: 'NC', en: 'New Caledonia', fr: 'Nouvelle-Calédonie' },
  { code: 'NZ', en: 'New Zealand', fr: 'Nouvelle-Zélande' },
  { code: 'IO', en: 'British Indian Ocean Territory', fr: 'Océan Indien, Territoire Britannique de l\'' },
  { code: 'OM', en: 'Oman', fr: 'Oman' },
  { code: 'UG', en: 'Uganda', fr: 'Ouganda' },
  { code: 'UZ', en: 'Uzbekistan', fr: 'Ouzbékistan' },
  { code: 'PK', en: 'Pakistan', fr: 'Pakistan' },
  { code: 'PW', en: 'Palau', fr: 'Palaos' },
  { code: 'PS', en: 'Palestinian Territory, Occupied', fr: 'Palestinien Occupé, Territoire' },
  { code: 'PA', en: 'Panama', fr: 'Panama' },
  { code: 'PG', en: 'Papua New Guinea', fr: 'Papouasie-Nouvelle-Guinée' },
  { code: 'PY', en: 'Paraguay', fr: 'Paraguay' },
  { code: 'NL', en: 'Netherlands', fr: 'Pays-Bas' },
  { code: 'PE', en: 'Peru', fr: 'Pérou' },
  { code: 'PH', en: 'Philippines', fr: 'Philippines' },
  { code: 'PN', en: 'Pitcairn', fr: 'Pitcairn' },
  { code: 'PL', en: 'Poland', fr: 'Pologne' },
  { code: 'PF', en: 'French Polynesia', fr: 'Polynésie Française' },
  { code: 'PR', en: 'Puerto Rico', fr: 'Porto Rico' },
  { code: 'PT', en: 'Portugal', fr: 'Portugal' },
  { code: 'QA', en: 'Qatar', fr: 'Qatar' },
  { code: 'RE', en: 'Réunion', fr: 'Réunion' },
  { code: 'RO', en: 'Romania', fr: 'Roumanie' },
  { code: 'GB', en: 'United Kingdom', fr: 'Royaume-Uni' },
  { code: 'RU', en: 'Russian Federation', fr: 'Russie, Fédération de' },
  { code: 'RW', en: 'Rwanda', fr: 'Rwanda' },
  { code: 'EH', en: 'Western Sahara', fr: 'Sahara Occidental' },
  { code: 'BL', en: 'Saint Barthélemy', fr: 'Saint-Barthélemy' },
  { code: 'SH', en: 'Saint Helena, Ascension and Tristan da Cunha', fr: 'Sainte-Hélène, Ascension et Tristan da Cunha' },
  { code: 'LC', en: 'Saint Lucia', fr: 'Sainte-Lucie' },
  { code: 'KN', en: 'Saint Kitts and Nevis', fr: 'Saint-Kitts-et-Nevis' },
  { code: 'SM', en: 'San Marino', fr: 'Saint-Marin' },
  { code: 'MF', en: 'Saint Martin (French part)', fr: 'Saint-Martin' },
  { code: 'PM', en: 'Saint Pierre and Miquelon', fr: 'Saint-Pierre-et-Miquelon' },
  { code: 'VA', en: 'Holy See (Vatican City State)', fr: 'Saint-Siège (État de la Cité du Vatican)' },
  { code: 'VC', en: 'Saint Vincent and the Grenadines', fr: 'Saint-Vincent-et-les Grenadines' },
  { code: 'SB', en: 'Solomon Islands', fr: 'Salomon, Îles' },
  { code: 'WS', en: 'Samoa', fr: 'Samoa' },
  { code: 'AS', en: 'American Samoa', fr: 'Samoa Américaines' },
  { code: 'ST', en: 'Sao Tome and Principe', fr: 'Sao Tomé-et-Principe' },
  { code: 'SN', en: 'Senegal', fr: 'Sénégal' },
  { code: 'RS', en: 'Serbia', fr: 'Serbie' },
  { code: 'SC', en: 'Seychelles', fr: 'Seychelles' },
  { code: 'SL', en: 'Sierra Leone', fr: 'Sierra Leone' },
  { code: 'SG', en: 'Singapore', fr: 'Singapour' },
  { code: 'SK', en: 'Slovakia', fr: 'Slovaquie' },
  { code: 'SI', en: 'Slovenia', fr: 'Slovénie' },
  { code: 'SO', en: 'Somalia', fr: 'Somalie' },
  { code: 'SD', en: 'Sudan', fr: 'Soudan' },
  { code: 'LK', en: 'Sri Lanka', fr: 'Sri Lanka' },
  { code: 'SE', en: 'Sweden', fr: 'Suède' },
  { code: 'CH', en: 'Switzerland', fr: 'Suisse' },
  { code: 'SR', en: 'Suriname', fr: 'Suriname' },
  { code: 'SJ', en: 'Svalbard and Jan Mayen', fr: 'Svalbard et Île Jan Mayen' },
  { code: 'SZ', en: 'Swaziland', fr: 'Swaziland' },
  { code: 'SY', en: 'Syrian Arab Republic', fr: 'Syrienne, République Arabe' },
  { code: 'TJ', en: 'Tajikistan', fr: 'Tadjikistan' },
  { code: 'TW', en: 'Taiwan, Province of China', fr: 'Taïwan, Province de Chine' },
  { code: 'TZ', en: 'Tanzania, United Republic of', fr: 'Tanzanie, République-Unie de' },
  { code: 'TD', en: 'Chad', fr: 'Tchad' },
  { code: 'CZ', en: 'Czech Republic', fr: 'Tchèque, République' },
  { code: 'TF', en: 'French Southern Territories', fr: 'Terres Australes Françaises' },
  { code: 'TH', en: 'Thailand', fr: 'Thaïlande' },
  { code: 'TL', en: 'Timor-Leste', fr: 'Timor-Leste' },
  { code: 'TG', en: 'Togo', fr: 'Togo' },
  { code: 'TK', en: 'Tokelau', fr: 'Tokelau' },
  { code: 'TO', en: 'Tonga', fr: 'Tonga' },
  { code: 'TT', en: 'Trinidad and Tobago', fr: 'Trinité-et-Tobago' },
  { code: 'TN', en: 'Tunisia', fr: 'Tunisie' },
  { code: 'TM', en: 'Turkmenistan', fr: 'Turkménistan' },
  { code: 'TC', en: 'Turks and Caicos Islands', fr: 'Turks et Caïques, Îles' },
  { code: 'TR', en: 'Turkey', fr: 'Turquie' },
  { code: 'TV', en: 'Tuvalu', fr: 'Tuvalu' },
  { code: 'UA', en: 'Ukraine', fr: 'Ukraine' },
  { code: 'UY', en: 'Uruguay', fr: 'Uruguay' },
  { code: 'VU', en: 'Vanuatu', fr: 'Vanuatu' },
  { code: 'VE', en: 'Venezuela, Bolivarian Republic of', fr: 'Venezuela, République Bolivarienne du' },
  { code: 'VN', en: 'Viet Nam', fr: 'Viet Nam' },
  { code: 'WF', en: 'Wallis and Futuna', fr: 'Wallis et Futuna' },
  { code: 'YE', en: 'Yemen', fr: 'Yémen' },
  { code: 'ZM', en: 'Zambia', fr: 'Zambie' },
  { code: 'ZW', en: 'Zimbabwe', fr: 'Zimbabwe' },
];

// Sorted display arrays. Sort by locale so French users see alphabetical French.
export const countriesOnboardEn: string[] = countryEntriesOnboard
  .map((e) => e.en)
  .sort((a, b) => a.localeCompare(b, 'en'));

export const countriesOnboardFr: string[] = countryEntriesOnboard
  .map((e) => e.fr)
  .sort((a, b) => a.localeCompare(b, 'fr'));

const enToFrMap = new Map(countryEntriesOnboard.map((e) => [e.en, e.fr]));
const frToEnMap = new Map(countryEntriesOnboard.map((e) => [e.fr, e.en]));
const enSet = new Set(countryEntriesOnboard.map((e) => e.en));

/**
 * Translate a canonical English country name to French.
 * Strict: throws on miss. Callers validate membership explicitly.
 */
export function enToFr(en: string): string {
  const v = enToFrMap.get(en);
  if (!v) throw new Error(`No French translation for country: ${en}`);
  return v;
}

/**
 * Translate a French country name back to the canonical English.
 * Strict: throws on miss.
 */
export function frToEn(fr: string): string {
  const v = frToEnMap.get(fr);
  if (!v) throw new Error(`No English translation for country: ${fr}`);
  return v;
}

/**
 * Check membership in the canonical English set. Use this on the server to
 * validate incoming country strings before writing to the DB or HubSpot.
 */
export function isCanonicalEnCountry(name: string): boolean {
  return enSet.has(name);
}
