// Pre-generated account profiles for realistic transaction simulation

import {
  MALE_FIRST_NAMES,
  FEMALE_FIRST_NAMES,
  LAST_NAMES,
  BANKS,
  CARD_NETWORKS,
  LOCATIONS,
  MERCHANT_CATEGORIES,
} from '@/lib/data/ghanaData';

export interface AccountProfile {
  id: string;
  accountNumber: string;
  name: string;
  bank: string;
  cardNetwork: string;
  typicalLocation: { city: string; area: string };
  typicalMerchantCategories: string[];
  typicalAmountRange: { min: number; max: number };
  typicalHours: { start: number; end: number };
  accountAge: number; // months
  monthlyTransactionCount: number;
  riskLevel: 'low' | 'medium' | 'high';
}

function pickItem<T>(arr: readonly T[] | T[], index: number): T {
  return arr[index % arr.length];
}

function generateProfiles(): AccountProfile[] {
  const profiles: AccountProfile[] = [];

  for (let i = 0; i < 50; i++) {
    const isMale = i % 2 === 0;
    const firstName = isMale
      ? pickItem(MALE_FIRST_NAMES, i)
      : pickItem(FEMALE_FIRST_NAMES, i);
    const lastName = pickItem(LAST_NAMES, i * 3 + 7);

    const locationData = pickItem(LOCATIONS, i);
    const area = pickItem(locationData.areas, i * 2 + 1);

    // Pick 2-3 merchant categories
    const catCount = (i % 3 === 0) ? 3 : 2;
    const cats: string[] = [];
    for (let c = 0; c < catCount; c++) {
      const cat = pickItem(MERCHANT_CATEGORIES, i + c * 5);
      if (!cats.includes(cat)) cats.push(cat);
    }
    if (cats.length < 2) cats.push(pickItem(MERCHANT_CATEGORIES, i + 11));

    // Typical amount ranges vary by "profile wealth"
    const wealthTier = i % 5;
    const amountRanges = [
      { min: 20, max: 500 },
      { min: 50, max: 1500 },
      { min: 100, max: 5000 },
      { min: 200, max: 15000 },
      { min: 500, max: 50000 },
    ];

    // Typical hours — most people 8-20, some 6-22, a few 7-18
    const hourPatterns = [
      { start: 8, end: 20 },
      { start: 6, end: 22 },
      { start: 7, end: 18 },
      { start: 9, end: 21 },
      { start: 8, end: 17 },
    ];

    const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'low', 'low', 'medium', 'high'];

    profiles.push({
      id: `ACC-${String(1000 + i).padStart(5, '0')}`,
      accountNumber: `${String(2000000000 + i * 137591)}`,
      name: `${firstName} ${lastName}`,
      bank: pickItem(BANKS, i * 2 + 3),
      cardNetwork: pickItem(CARD_NETWORKS, i),
      typicalLocation: { city: locationData.city, area },
      typicalMerchantCategories: cats,
      typicalAmountRange: amountRanges[wealthTier],
      typicalHours: hourPatterns[i % hourPatterns.length],
      accountAge: 6 + ((i * 7) % 108), // 6 to 114 months
      monthlyTransactionCount: 10 + ((i * 3) % 80),
      riskLevel: riskLevels[i % riskLevels.length],
    });
  }

  return profiles;
}

export const ACCOUNT_PROFILES: AccountProfile[] = generateProfiles();
