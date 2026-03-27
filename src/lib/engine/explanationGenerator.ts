// Natural language explanation generator for AI fraud decisions

import type { AccountProfile } from '@/lib/data/accountProfiles';
import type { RiskResult } from '@/lib/engine/riskScoring';
import { formatCurrency, formatTime } from '@/lib/utils/formatters';
import { CITY_DISTANCES } from '@/lib/data/ghanaData';

export interface TransactionForExplanation {
  amount: number;
  type: string;
  location: { city: string; area: string };
  timestamp: Date;
  merchantCategory: string;
  receiverName: string;
  previousLocation?: { city: string; area: string };
  previousTimestamp?: Date;
}

export function generateExplanation(
  transaction: TransactionForExplanation,
  riskResult: RiskResult,
  profile: AccountProfile
): string {
  const { totalScore, factors, decision, matchedPattern } = riskResult;
  const loc = `${transaction.location.area}, ${transaction.location.city}`;
  const typicalLoc = `${profile.typicalLocation.area}, ${profile.typicalLocation.city}`;

  // For approved transactions
  if (decision === 'APPROVED' && totalScore <= 30) {
    return `This transaction is consistent with ${profile.name}'s typical spending behaviour. The ${formatCurrency(transaction.amount)} ${transaction.type.toLowerCase()} at ${transaction.receiverName} in ${loc} falls within normal parameters for their ${profile.bank} account. Auto-approved with a risk score of ${totalScore}/100.`;
  }

  if (decision === 'APPROVED' && totalScore <= 60) {
    const topFactor = [...factors].sort((a, b) => b.contribution - a.contribution)[0];
    return `This ${formatCurrency(transaction.amount)} ${transaction.type.toLowerCase()} at ${transaction.receiverName} in ${loc} was approved but flagged for monitoring. A minor alert was raised due to ${topFactor.name.toLowerCase()} (${Math.round(topFactor.score)}/100). ${profile.name}'s ${profile.bank} account is under active monitoring for the next 30 minutes.`;
  }

  // For flagged or blocked transactions — pattern-specific with full Ghanaian location detail
  switch (matchedPattern) {
    case 'RAPID_GEO_SWITCHING': {
      const prevArea = transaction.previousLocation?.area ?? profile.typicalLocation.area;
      const prevCity = transaction.previousLocation?.city ?? profile.typicalLocation.city;
      const currentCity = transaction.location.city;
      const distance =
        CITY_DISTANCES[prevCity]?.[currentCity] ??
        CITY_DISTANCES[currentCity]?.[prevCity] ??
        200;
      const timeDiff = transaction.previousTimestamp
        ? Math.round(
            (transaction.timestamp.getTime() - transaction.previousTimestamp.getTime()) /
              (1000 * 60)
          )
        : 12;
      const prevTimeStr = transaction.previousTimestamp
        ? formatTime(transaction.previousTimestamp)
        : `${timeDiff} minutes earlier`;
      return `This transaction was ${decision === 'BLOCKED' ? 'blocked' : 'flagged for review'} because ${profile.name}'s ${profile.cardNetwork} card was used at ${transaction.receiverName} in ${transaction.location.area}, ${currentCity} at ${formatTime(transaction.timestamp)}, but a previous transaction occurred in ${prevArea}, ${prevCity} at ${prevTimeStr} \u2014 a distance of ${distance}km in just ${timeDiff} minutes, which is physically impossible. Risk score: ${totalScore}/100.`;
    }

    case 'VELOCITY_ATTACK':
      return `This transaction was ${decision === 'BLOCKED' ? 'blocked' : 'flagged for review'} due to a velocity anomaly. Multiple transactions were detected from ${profile.name}'s ${profile.cardNetwork} card within a very short timeframe across merchants in ${transaction.location.city}. The ${formatCurrency(transaction.amount)} charge at ${transaction.receiverName} in ${loc} is the latest in a rapid sequence — consistent with a cloned card being used simultaneously at different POS terminals. Risk score: ${totalScore}/100.`;

    case 'UNUSUAL_HOUR_AMOUNT': {
      const hour = transaction.timestamp.getHours();
      const timeLabel = hour < 6 ? 'early morning' : hour < 12 ? 'morning' : 'late night';
      return `This ${formatCurrency(transaction.amount)} ${transaction.type.toLowerCase()} at ${transaction.receiverName} in ${loc} was ${decision === 'BLOCKED' ? 'blocked' : 'flagged for review'} because it occurred at ${formatTime(transaction.timestamp)} (${timeLabel}) \u2014 well outside ${profile.name}'s typical transaction window of ${profile.typicalHours.start}:00\u2013${profile.typicalHours.end}:00. The amount also exceeds their typical range of ${formatCurrency(profile.typicalAmountRange.min)}\u2013${formatCurrency(profile.typicalAmountRange.max)} on their ${profile.bank} account. Risk score: ${totalScore}/100.`;
    }

    case 'FIRST_TIME_CATEGORY':
      return `This transaction was ${decision === 'BLOCKED' ? 'blocked' : 'flagged for review'} because ${profile.name}'s ${profile.bank} account has no prior transactions in the "${transaction.merchantCategory}" category. Their typical spending in ${typicalLoc} is limited to ${profile.typicalMerchantCategories.join(' and ')}. A ${formatCurrency(transaction.amount)} purchase at ${transaction.receiverName} in ${loc} represents a significant behavioural deviation. Risk score: ${totalScore}/100.`;

    case 'MICRO_TEST_LARGE_WITHDRAWAL':
      return `This ${formatCurrency(transaction.amount)} ${transaction.type.toLowerCase()} at ${loc} was ${decision === 'BLOCKED' ? 'blocked' : 'flagged for review'} because it follows the classic stolen card pattern — a small test transaction (GH\u20B5 1\u20135) at a POS terminal in ${transaction.location.city}, followed by a large withdrawal at an ATM in ${loc} within minutes. ${profile.name}'s ${profile.cardNetwork} card may be compromised. Risk score: ${totalScore}/100.`;

    case 'CROSS_BORDER_ANOMALY':
      return `This transaction was ${decision === 'BLOCKED' ? 'blocked' : 'flagged for review'} due to a cross-border anomaly. ${profile.name}'s ${profile.cardNetwork} card was used in ${typicalLoc} recently, but this card-not-present transaction at ${transaction.receiverName} originated from a foreign IP address within the hour. This pattern is consistent with compromised card details being used for online purchases internationally while the cardholder is in ${profile.typicalLocation.city}. Risk score: ${totalScore}/100.`;

    case 'ACCOUNT_TAKEOVER':
      return `This ${formatCurrency(transaction.amount)} transfer from ${profile.name}'s ${profile.bank} account was ${decision === 'BLOCKED' ? 'blocked' : 'flagged for review'} due to account takeover indicators. A password reset was followed by an immediate large transfer to a new beneficiary \u2014 all within 30 minutes. The transaction originated from ${loc}, while ${profile.name} typically operates from ${typicalLoc}. This is a high-severity pattern indicating potential unauthorized access. Risk score: ${totalScore}/100.`;

    case 'ROUND_AMOUNT_STRUCTURING':
      return `This ${formatCurrency(transaction.amount)} transaction at ${transaction.receiverName} in ${loc} was ${decision === 'BLOCKED' ? 'blocked' : 'flagged for review'} because it is part of a series of exactly round-amount transactions from ${profile.name}'s ${profile.bank} account. Multiple round-amount transfers (GH\u20B5 1,000, GH\u20B5 2,000, GH\u20B5 5,000) in quick succession is a common structuring pattern used to circumvent automated detection thresholds in ${transaction.location.city}. Risk score: ${totalScore}/100.`;

    default: {
      // Generic explanation using top factors — still with full location detail
      const sortedFactors = [...factors].sort((a, b) => b.contribution - a.contribution);
      const topTwo = sortedFactors.slice(0, 2);
      const factorDescriptions = topTwo
        .map(
          (f) =>
            `${f.name.toLowerCase()} (${Math.round(f.score)}/100)`
        )
        .join(' and ');
      return `This ${formatCurrency(transaction.amount)} ${transaction.type.toLowerCase()} at ${transaction.receiverName} in ${loc} was ${decision === 'BLOCKED' ? 'blocked' : decision === 'REVIEW' ? 'flagged for manual review' : 'approved with monitoring'} based on elevated ${factorDescriptions}. The AI model detected a combined risk score of ${totalScore}/100 for ${profile.name}'s ${profile.bank} account (${profile.cardNetwork}).`;
    }
  }
}
