// AI risk scoring engine — simulates weighted multi-factor scoring

import type { AccountProfile } from '@/lib/data/accountProfiles';
import { CITY_DISTANCES } from '@/lib/data/ghanaData';
import { FRAUD_PATTERNS } from '@/lib/engine/fraudPatterns';

export interface RiskFactor {
  name: string;
  score: number;   // 0-100
  weight: number;   // 0-1
  contribution: number; // score * weight
}

export interface RiskResult {
  totalScore: number;
  factors: RiskFactor[];
  decision: 'APPROVED' | 'REVIEW' | 'BLOCKED';
  matchedPattern: string | null;
}

export interface TransactionInput {
  amount: number;
  type: string;
  channel: string;
  location: { city: string; area: string };
  merchantCategory: string;
  timestamp: Date;
  isFraud: boolean;
  forcedPatternId?: string;
}

export interface RecentTransaction {
  timestamp: Date;
  location: { city: string; area: string };
  amount: number;
  merchantCategory: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Calculate velocity score based on how many recent transactions exist */
function calcVelocityScore(
  recentTransactions: RecentTransaction[],
  timestamp: Date
): number {
  const threeMinAgo = new Date(timestamp.getTime() - 3 * 60 * 1000);
  const tenMinAgo = new Date(timestamp.getTime() - 10 * 60 * 1000);

  const countIn3Min = recentTransactions.filter(
    (t) => t.timestamp >= threeMinAgo
  ).length;
  const countIn10Min = recentTransactions.filter(
    (t) => t.timestamp >= tenMinAgo
  ).length;

  if (countIn3Min >= 5) return 95;
  if (countIn3Min >= 3) return 70;
  if (countIn10Min >= 5) return 55;
  if (countIn10Min >= 3) return 35;
  if (countIn10Min >= 2) return 15;
  return 5;
}

/** Calculate geographic anomaly based on distance vs time since last transaction */
function calcGeoAnomalyScore(
  transaction: TransactionInput,
  recentTransactions: RecentTransaction[]
): number {
  if (recentTransactions.length === 0) return 5;

  const last = recentTransactions[recentTransactions.length - 1];
  const currentCity = transaction.location.city;
  const lastCity = last.location.city;

  if (currentCity === lastCity) return 0;

  const distance =
    CITY_DISTANCES[lastCity]?.[currentCity] ??
    CITY_DISTANCES[currentCity]?.[lastCity] ??
    150; // default moderate distance

  const timeDiffMinutes =
    (transaction.timestamp.getTime() - last.timestamp.getTime()) / (1000 * 60);

  // Average driving speed ~80km/h in Ghana
  const feasibleDistanceInTime = (timeDiffMinutes / 60) * 80;

  if (distance > feasibleDistanceInTime * 2) return 95; // physically impossible
  if (distance > feasibleDistanceInTime * 1.2) return 70; // very unlikely
  if (distance > feasibleDistanceInTime * 0.8) return 40; // suspicious
  return 10;
}

/** How far the amount deviates from typical for this account */
function calcAmountDeviationScore(
  amount: number,
  profile: AccountProfile
): number {
  const { min, max } = profile.typicalAmountRange;
  const midpoint = (min + max) / 2;
  const range = max - min;

  if (amount >= min && amount <= max) {
    // Within typical range
    return 5;
  }

  const deviation = amount > max ? amount - max : min - amount;
  const ratio = deviation / (range || 1);

  if (ratio > 5) return 95;
  if (ratio > 3) return 80;
  if (ratio > 1.5) return 60;
  if (ratio > 0.5) return 35;
  return 15;
}

/** Is this transaction at an unusual hour for this account? */
function calcTimeOfDayScore(
  timestamp: Date,
  profile: AccountProfile
): number {
  const hour = timestamp.getHours();
  const { start, end } = profile.typicalHours;

  if (hour >= start && hour <= end) return 5;

  // Calculate how far outside typical hours
  const distOutside =
    hour < start
      ? Math.min(start - hour, hour + 24 - end)
      : Math.min(hour - end, start + 24 - hour);

  if (distOutside >= 5) return 90;
  if (distOutside >= 3) return 65;
  if (distOutside >= 2) return 40;
  return 20;
}

/** Is this a new merchant category for the account? */
function calcMerchantCategoryScore(
  merchantCategory: string,
  profile: AccountProfile
): number {
  if (profile.typicalMerchantCategories.includes(merchantCategory)) return 5;
  return 55; // first-time category gets moderate score
}

/** Device/channel risk — simplified simulation */
function calcDeviceChannelScore(
  channel: string,
  _profile: AccountProfile
): number {
  // Online/CNP transactions are inherently riskier
  if (channel === 'GhIPSS Instant Pay') return 10;
  if (channel === 'gh-link') return 15;
  if (channel === 'Visa Debit') return 20;
  if (channel === 'Mastercard') return 20;
  // Add some randomness to simulate device mismatch
  return 10 + Math.floor(Math.random() * 25);
}

/** Try to match a specific fraud pattern */
function detectPattern(
  transaction: TransactionInput,
  profile: AccountProfile,
  recentTransactions: RecentTransaction[],
  factors: RiskFactor[]
): string | null {
  // If the transaction was forced with a pattern, return it
  if (transaction.forcedPatternId) return transaction.forcedPatternId;

  if (!transaction.isFraud) return null;

  const velocityFactor = factors.find((f) => f.name === 'Transaction Velocity');
  const geoFactor = factors.find((f) => f.name === 'Geographic Anomaly');
  const amountFactor = factors.find((f) => f.name === 'Amount Deviation');
  const timeFactor = factors.find((f) => f.name === 'Time of Day');
  const merchantFactor = factors.find((f) => f.name === 'Merchant Category');

  if (geoFactor && geoFactor.score >= 80) return 'RAPID_GEO_SWITCHING';
  if (velocityFactor && velocityFactor.score >= 80) return 'VELOCITY_ATTACK';
  if (timeFactor && timeFactor.score >= 60 && amountFactor && amountFactor.score >= 50)
    return 'UNUSUAL_HOUR_AMOUNT';
  if (merchantFactor && merchantFactor.score >= 50 && amountFactor && amountFactor.score >= 40)
    return 'FIRST_TIME_CATEGORY';
  if (amountFactor && amountFactor.score >= 70) return 'ROUND_AMOUNT_STRUCTURING';

  // Fallback to a random pattern for variety
  const patterns = FRAUD_PATTERNS;
  return patterns[Math.floor(Math.random() * patterns.length)].id;
}

export function calculateRiskScore(
  transaction: TransactionInput,
  profile: AccountProfile,
  recentTransactions: RecentTransaction[]
): RiskResult {
  const velocityScore = calcVelocityScore(recentTransactions, transaction.timestamp);
  const geoAnomalyScore = calcGeoAnomalyScore(transaction, recentTransactions);
  const amountDeviationScore = calcAmountDeviationScore(transaction.amount, profile);
  const timeOfDayScore = calcTimeOfDayScore(transaction.timestamp, profile);
  const merchantCategoryScore = calcMerchantCategoryScore(
    transaction.merchantCategory,
    profile
  );
  const deviceChannelScore = calcDeviceChannelScore(transaction.channel, profile);

  const factors: RiskFactor[] = [
    {
      name: 'Transaction Velocity',
      score: velocityScore,
      weight: 0.2,
      contribution: velocityScore * 0.2,
    },
    {
      name: 'Geographic Anomaly',
      score: geoAnomalyScore,
      weight: 0.25,
      contribution: geoAnomalyScore * 0.25,
    },
    {
      name: 'Amount Deviation',
      score: amountDeviationScore,
      weight: 0.2,
      contribution: amountDeviationScore * 0.2,
    },
    {
      name: 'Time of Day',
      score: timeOfDayScore,
      weight: 0.1,
      contribution: timeOfDayScore * 0.1,
    },
    {
      name: 'Merchant Category',
      score: merchantCategoryScore,
      weight: 0.1,
      contribution: merchantCategoryScore * 0.1,
    },
    {
      name: 'Device/Channel',
      score: deviceChannelScore,
      weight: 0.15,
      contribution: deviceChannelScore * 0.15,
    },
  ];

  let totalScore = Math.round(
    factors.reduce((sum, f) => sum + f.contribution, 0)
  );

  // If this is a fraud transaction, boost the score to ensure detection
  if (transaction.isFraud) {
    totalScore = clamp(totalScore + 30 + Math.floor(Math.random() * 20), 65, 99);
  } else {
    // For legit transactions, dampen the score
    totalScore = clamp(totalScore, 0, 100);
    // Occasionally allow a moderate score for realism (potential false positive)
    if (totalScore > 60 && Math.random() > 0.05) {
      totalScore = Math.floor(totalScore * 0.5);
    }
  }

  const matchedPattern = detectPattern(transaction, profile, recentTransactions, factors);

  let decision: 'APPROVED' | 'REVIEW' | 'BLOCKED';
  if (totalScore <= 30) {
    decision = 'APPROVED';
  } else if (totalScore <= 60) {
    decision = 'APPROVED'; // approved with monitoring
  } else if (totalScore <= 80) {
    decision = 'REVIEW';
  } else {
    decision = 'BLOCKED';
  }

  return { totalScore, factors, decision, matchedPattern };
}
