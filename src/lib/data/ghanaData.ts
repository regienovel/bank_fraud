// Ghana-specific data for realistic banking transaction simulation

export const MALE_FIRST_NAMES = [
  'Kwame', 'Kofi', 'Kwesi', 'Yaw', 'Kwadwo', 'Kwabena', 'Akwasi', 'Nana',
  'Kojo', 'Fiifi', 'Papa', 'Ebo', 'Edem', 'Selorm', 'Delali', 'Senyo',
  'Bright', 'Emmanuel', 'Samuel', 'Daniel', 'Isaac', 'Joseph', 'Michael',
  'Richard', 'Francis', 'Bernard', 'Augustine', 'Felix', 'Raymond', 'Stephen',
] as const;

export const FEMALE_FIRST_NAMES = [
  'Ama', 'Akua', 'Abena', 'Yaa', 'Adwoa', 'Afia', 'Esi', 'Efua', 'Akosua',
  'Araba', 'Naana', 'Adjoa', 'Serwa', 'Maame', 'Comfort', 'Grace', 'Felicia',
  'Patience', 'Gifty', 'Mercy', 'Joyce', 'Linda', 'Sarah', 'Rebecca',
  'Priscilla', 'Agnes', 'Cecilia', 'Lydia', 'Vida', 'Millicent',
] as const;

export const LAST_NAMES = [
  'Mensah', 'Asante', 'Boateng', 'Owusu', 'Agyemang', 'Osei', 'Amoah',
  'Bonsu', 'Darko', 'Appiah', 'Ofori', 'Sarpong', 'Adjei', 'Badu',
  'Frimpong', 'Acheampong', 'Antwi', 'Gyamfi', 'Nuamah', 'Tetteh',
  'Nkrumah', 'Asamoah', 'Adu', 'Amponsah', 'Quaye', 'Lartey', 'Kufuor',
  'Armah', 'Addo', 'Ankrah', 'Boakye', 'Opoku',
] as const;

export const MERCHANTS: Record<string, string[]> = {
  Retail: [
    'Shoprite Accra Mall', 'Melcom Kaneshie', 'Palace Supermarket',
    'Koala Supermarket', 'MaxMart Achimota', 'Marina Mall',
    'Game Stores West Hills', 'Citydia East Legon',
  ],
  Fuel: [
    'Shell Dzorwulu', 'TotalEnergies Circle', 'Goil Tema',
    'Star Oil Spintex', 'Engen Madina', 'Allied Oil Kasoa',
  ],
  Restaurants: [
    'KFC Osu', 'Papaye Airport', 'Burger King Junction Mall',
    'ChopBar Labone', 'Buka Restaurant Kumasi', 'Vida e Caffe Cantonments',
    'Marwako Abelemkpe',
  ],
  Online: [
    'Jumia Ghana', 'Tonaton', 'Hubtel', 'ExpressPay', 'MTN Online',
    'Vodafone Digital', 'Glovo Ghana',
  ],
  Hotels: [
    'Kempinski Gold Coast', 'Labadi Beach Hotel', 'Movenpick Ambassador',
    'Tang Palace', 'African Regent', 'Alisa Hotel',
  ],
  Transport: [
    'Uber Ghana', 'Bolt Accra', 'STC Intercity', 'VIP Bus Service',
  ],
  Healthcare: [
    'Korle-Bu Teaching Hospital', '37 Military Hospital',
    'Nyaho Medical Centre', 'Lister Hospital', 'Medlab Ghana',
  ],
  Telecoms: [
    'MTN Ghana', 'Vodafone Ghana', 'AirtelTigo', 'Surfline Communications',
  ],
};

export const MERCHANT_CATEGORIES = Object.keys(MERCHANTS);

export interface LocationData {
  city: string;
  areas: string[];
}

export const LOCATIONS: LocationData[] = [
  {
    city: 'Accra',
    areas: [
      'Osu', 'East Legon', 'Airport Residential', 'Cantonments', 'Labone',
      'Dzorwulu', 'Achimota', 'Spintex', 'Madina', 'Tema Community 1',
      'Nungua', 'Dansoman', 'Kaneshie', 'Adabraka', 'Ridge', 'Roman Ridge',
    ],
  },
  {
    city: 'Kumasi',
    areas: [
      'Adum', 'Bantama', 'Asokwa', 'Nhyiaeso', 'Suame', 'Tafo',
      'Manhyia', 'Ayigya', 'Kejetia',
    ],
  },
  {
    city: 'Tamale',
    areas: ['Lamashegu', 'Nyohini', 'Sakasaka', 'Changli', 'Vittin'],
  },
  {
    city: 'Cape Coast',
    areas: ['Pedu', 'Abura', 'Kotokuraba', 'UCC Campus'],
  },
  {
    city: 'Takoradi',
    areas: ['Market Circle', 'Beach Road', 'Anaji', 'Effia', 'Sekondi'],
  },
  {
    city: 'Tema',
    areas: ['Community 1', 'Community 5', 'Harbour Area', 'Tema New Town'],
  },
  {
    city: 'Ho',
    areas: ['Bankoe', 'Dome', 'Hliha'],
  },
  {
    city: 'Sunyani',
    areas: ['Nkwabeng', 'Penkwase', 'New Dormaa'],
  },
  {
    city: 'Koforidua',
    areas: ['Adweso', 'Old Estate', 'New Juaben'],
  },
];

export const BANKS = [
  'GCB Bank', 'Ecobank Ghana', 'Absa Ghana', 'Stanbic Bank', 'CalBank',
  'Fidelity Bank', 'Republic Bank', 'Access Bank Ghana', 'Zenith Bank Ghana',
  'Prudential Bank', 'First National Bank Ghana', 'Société Générale Ghana',
  'UBA Ghana', 'First Atlantic Bank', 'ADB',
] as const;

export const CARD_NETWORKS = [
  'Visa Debit', 'Mastercard', 'GhIPSS Instant Pay', 'gh-link',
] as const;

export const TRANSACTION_TYPES = [
  'Card Payment', 'Bank Transfer', 'ATM Withdrawal', 'Online Purchase', 'POS Terminal',
] as const;

export interface AmountRange {
  min: number;
  max: number;
  commonMin: number;
  commonMax: number;
}

export const AMOUNT_RANGES: Record<string, AmountRange> = {
  'ATM Withdrawal': { min: 50, max: 5000, commonMin: 200, commonMax: 1000 },
  'Card Payment': { min: 10, max: 15000, commonMin: 50, commonMax: 500 },
  'Online Purchase': { min: 20, max: 8000, commonMin: 100, commonMax: 2000 },
  'Bank Transfer': { min: 100, max: 500000, commonMin: 500, commonMax: 20000 },
  'POS Terminal': { min: 10, max: 15000, commonMin: 50, commonMax: 500 },
  Fuel: { min: 80, max: 1500, commonMin: 150, commonMax: 400 },
  Restaurant: { min: 30, max: 800, commonMin: 50, commonMax: 200 },
  Grocery: { min: 50, max: 2000, commonMin: 100, commonMax: 500 },
};

/** Approximate straight-line distances (km) between major Ghanaian cities */
export const CITY_DISTANCES: Record<string, Record<string, number>> = {
  Accra: { Kumasi: 248, Tamale: 604, 'Cape Coast': 144, Takoradi: 218, Tema: 30, Ho: 160, Sunyani: 350, Koforidua: 82 },
  Kumasi: { Accra: 248, Tamale: 379, 'Cape Coast': 194, Takoradi: 260, Tema: 270, Ho: 270, Sunyani: 124, Koforidua: 196 },
  Tamale: { Accra: 604, Kumasi: 379, 'Cape Coast': 540, Takoradi: 580, Tema: 620, Ho: 440, Sunyani: 320, Koforidua: 520 },
  'Cape Coast': { Accra: 144, Kumasi: 194, Tamale: 540, Takoradi: 80, Tema: 170, Ho: 290, Sunyani: 310, Koforidua: 210 },
  Takoradi: { Accra: 218, Kumasi: 260, Tamale: 580, 'Cape Coast': 80, Tema: 245, Ho: 360, Sunyani: 370, Koforidua: 290 },
  Tema: { Accra: 30, Kumasi: 270, Tamale: 620, 'Cape Coast': 170, Takoradi: 245, Ho: 175, Sunyani: 375, Koforidua: 100 },
  Ho: { Accra: 160, Kumasi: 270, Tamale: 440, 'Cape Coast': 290, Takoradi: 360, Tema: 175, Sunyani: 400, Koforidua: 140 },
  Sunyani: { Accra: 350, Kumasi: 124, Tamale: 320, 'Cape Coast': 310, Takoradi: 370, Tema: 375, Ho: 400, Koforidua: 300 },
  Koforidua: { Accra: 82, Kumasi: 196, Tamale: 520, 'Cape Coast': 210, Takoradi: 290, Tema: 100, Ho: 140, Sunyani: 300 },
};
