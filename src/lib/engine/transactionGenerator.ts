// Transaction generation engine — creates realistic Ghanaian banking transactions

import type { AccountProfile } from '@/lib/data/accountProfiles';
import {
  MERCHANTS,
  MERCHANT_CATEGORIES,
  LOCATIONS,
  TRANSACTION_TYPES,
  CARD_NETWORKS,
  AMOUNT_RANGES,
} from '@/lib/data/ghanaData';
import { FRAUD_PATTERNS } from '@/lib/engine/fraudPatterns';
import {
  calculateRiskScore,
  type RecentTransaction,
  type TransactionInput,
} from '@/lib/engine/riskScoring';
import { generateExplanation } from '@/lib/engine/explanationGenerator';

export interface Transaction {
  id: string;
  timestamp: Date;
  accountId: string;
  senderName: string;
  receiverName: string;
  amount: number;
  type: string;
  channel: string;
  location: { city: string; area: string };
  bank: string;
  riskScore: number;
  riskFactors: { name: string; score: number; weight: number; contribution: number }[];
  decision: 'APPROVED' | 'REVIEW' | 'BLOCKED';
  explanation: string;
  matchedPattern: string | null;
  isFraud: boolean;
  merchantCategory: string;
  processingTime: number;
}

let transactionCounter = 0;

function randomItem<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function generateTransactionId(): string {
  transactionCounter++;
  return `TXN-GH-2026-${String(transactionCounter).padStart(5, '0')}`;
}

function pickLocation(): { city: string; area: string } {
  const loc = randomItem(LOCATIONS);
  return { city: loc.city, area: randomItem(loc.areas) };
}

function pickMerchant(category: string): string {
  const merchants = MERCHANTS[category];
  if (!merchants || merchants.length === 0) {
    // Fallback to retail
    return randomItem(MERCHANTS.Retail);
  }
  return randomItem(merchants);
}

function generateNormalAmount(type: string, merchantCategory: string): number {
  // Use merchant-specific ranges when applicable
  const merchantTypeMap: Record<string, string> = {
    Fuel: 'Fuel',
    Restaurants: 'Restaurant',
    Retail: 'Grocery',
  };
  const amountKey = merchantTypeMap[merchantCategory] ?? type;
  const range = AMOUNT_RANGES[amountKey] ?? AMOUNT_RANGES['Card Payment'];

  // 80% chance of common range, 20% full range
  if (Math.random() < 0.8) {
    return Math.round(randomInRange(range.commonMin, range.commonMax) * 100) / 100;
  }
  return Math.round(randomInRange(range.min, range.max) * 100) / 100;
}

function generateFraudAmount(pattern: string, profile: AccountProfile): number {
  switch (pattern) {
    case 'UNUSUAL_HOUR_AMOUNT':
      // Large amount, well above typical
      return Math.round(
        randomInRange(profile.typicalAmountRange.max * 2, profile.typicalAmountRange.max * 5) * 100
      ) / 100;
    case 'MICRO_TEST_LARGE_WITHDRAWAL':
      // Either the micro test or the large withdrawal
      return Math.random() < 0.3
        ? Math.round(randomInRange(1, 5) * 100) / 100
        : Math.round(randomInRange(3000, 5000) * 100) / 100;
    case 'ROUND_AMOUNT_STRUCTURING':
      return randomItem([1000, 2000, 3000, 5000, 10000]);
    case 'ACCOUNT_TAKEOVER':
      return Math.round(randomInRange(10000, 50000) * 100) / 100;
    case 'FIRST_TIME_CATEGORY':
      return Math.round(
        randomInRange(profile.typicalAmountRange.max * 1.5, profile.typicalAmountRange.max * 4) * 100
      ) / 100;
    default:
      return Math.round(randomInRange(500, 8000) * 100) / 100;
  }
}

function generateFraudLocation(
  pattern: string,
  profile: AccountProfile
): { city: string; area: string } {
  if (pattern === 'RAPID_GEO_SWITCHING') {
    // Pick a city different from the account's typical location
    const otherLocations = LOCATIONS.filter(
      (l) => l.city !== profile.typicalLocation.city
    );
    const loc = randomItem(otherLocations);
    return { city: loc.city, area: randomItem(loc.areas) };
  }
  return pickLocation();
}

function buildRecentTransactions(
  allTransactions: Transaction[],
  accountId: string,
  limit: number = 10
): RecentTransaction[] {
  return allTransactions
    .filter((t) => t.accountId === accountId)
    .slice(-limit)
    .map((t) => ({
      timestamp: t.timestamp,
      location: t.location,
      amount: t.amount,
      merchantCategory: t.merchantCategory,
    }));
}

export function generateTransaction(
  accountProfiles: AccountProfile[],
  recentTransactions: Transaction[],
  fraudRate: number = 0.04,
  forcedPatternId?: string
): Transaction {
  const profile = randomItem(accountProfiles);
  const now = new Date();
  const isFraud = forcedPatternId != null || Math.random() < fraudRate;

  let patternId: string | undefined = forcedPatternId;
  if (isFraud && !patternId) {
    patternId = randomItem(FRAUD_PATTERNS).id;
  }

  // Generate transaction details
  const type = isFraud
    ? patternId === 'MICRO_TEST_LARGE_WITHDRAWAL'
      ? randomItem(['ATM Withdrawal', 'POS Terminal'] as const)
      : randomItem(TRANSACTION_TYPES)
    : randomItem(TRANSACTION_TYPES);

  const merchantCategory = isFraud && patternId === 'FIRST_TIME_CATEGORY'
    ? randomItem(
        MERCHANT_CATEGORIES.filter(
          (c) => !profile.typicalMerchantCategories.includes(c)
        )
      )
    : isFraud
      ? randomItem(MERCHANT_CATEGORIES)
      : randomItem(profile.typicalMerchantCategories);

  const amount = isFraud
    ? generateFraudAmount(patternId!, profile)
    : generateNormalAmount(type, merchantCategory);

  // For legitimate transactions, vary the area within the account's typical city
  let location: { city: string; area: string };
  if (isFraud) {
    location = generateFraudLocation(patternId!, profile);
  } else {
    const cityData = LOCATIONS.find((l) => l.city === profile.typicalLocation.city);
    if (cityData && cityData.areas.length > 1) {
      // 60% chance of typical area, 40% another area in the same city
      const area = Math.random() < 0.6
        ? profile.typicalLocation.area
        : randomItem(cityData.areas);
      location = { city: profile.typicalLocation.city, area };
    } else {
      location = { city: profile.typicalLocation.city, area: profile.typicalLocation.area };
    }
  }

  const channel = randomItem(CARD_NETWORKS);
  const receiverName = pickMerchant(merchantCategory);

  // For fraud timestamps, might be unusual hour
  let timestamp = now;
  if (isFraud && patternId === 'UNUSUAL_HOUR_AMOUNT') {
    // Set time to 2-5 AM
    timestamp = new Date(now);
    timestamp.setHours(2 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
  }

  // Build recent transactions for this account
  const accountRecent = buildRecentTransactions(
    recentTransactions,
    profile.id
  );

  // Calculate risk score
  const transactionInput: TransactionInput = {
    amount,
    type,
    channel: channel as string,
    location,
    merchantCategory,
    timestamp,
    isFraud,
    forcedPatternId: patternId,
  };

  const riskResult = calculateRiskScore(transactionInput, profile, accountRecent);

  // Find previous transaction for explanation context
  const prevTxn = accountRecent.length > 0 ? accountRecent[accountRecent.length - 1] : undefined;

  // Generate explanation
  const explanation = generateExplanation(
    {
      amount,
      type,
      location,
      timestamp,
      merchantCategory,
      receiverName,
      previousLocation: prevTxn?.location,
      previousTimestamp: prevTxn?.timestamp,
    },
    riskResult,
    profile
  );

  // Simulate processing time (AI is fast: 30-80ms)
  const processingTime = Math.round(30 + Math.random() * 50);

  return {
    id: generateTransactionId(),
    timestamp,
    accountId: profile.id,
    senderName: profile.name,
    receiverName,
    amount,
    type,
    channel: channel as string,
    location,
    bank: profile.bank,
    riskScore: riskResult.totalScore,
    riskFactors: riskResult.factors,
    decision: riskResult.decision,
    explanation,
    matchedPattern: riskResult.matchedPattern,
    isFraud,
    merchantCategory,
    processingTime,
  };
}

/** Generate a specific fraud scenario for demo injection */
export function injectFraudTransaction(
  accountProfiles: AccountProfile[],
  recentTransactions: Transaction[],
  patternId: string
): Transaction {
  return generateTransaction(accountProfiles, recentTransactions, 1.0, patternId);
}

/** Reset the transaction counter (for demo reset) */
export function resetTransactionCounter(): void {
  transactionCounter = 0;
}
