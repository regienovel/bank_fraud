// Fraud pattern definitions for simulation

export interface FraudPattern {
  id: string;
  name: string;
  description: string;
  severity: number; // 1-10
  riskFactors: string[];
}

export const FRAUD_PATTERNS: FraudPattern[] = [
  {
    id: 'RAPID_GEO_SWITCHING',
    name: 'Rapid Geo-Switching',
    description:
      'Card used in two distant cities within minutes — physically impossible travel.',
    severity: 9,
    riskFactors: ['Geo-anomaly', 'Velocity spike', 'Impossible travel'],
  },
  {
    id: 'VELOCITY_ATTACK',
    name: 'Velocity Attack',
    description:
      '5+ transactions in under 3 minutes from different merchants, indicating card cloning.',
    severity: 8,
    riskFactors: ['Velocity spike', 'Multiple merchants', 'Rapid succession'],
  },
  {
    id: 'UNUSUAL_HOUR_AMOUNT',
    name: 'Unusual Hour & Amount',
    description:
      'Large withdrawal between 2-5 AM from an account that typically transacts during business hours.',
    severity: 7,
    riskFactors: ['Off-hours activity', 'Unusual amount', 'Behavioural deviation'],
  },
  {
    id: 'FIRST_TIME_CATEGORY',
    name: 'First-Time Merchant Category',
    description:
      'Transaction in a merchant category the account holder has never used before, especially high-value.',
    severity: 6,
    riskFactors: ['New merchant category', 'Unusual amount', 'Behavioural deviation'],
  },
  {
    id: 'MICRO_TEST_LARGE_WITHDRAWAL',
    name: 'Micro-Test + Large Withdrawal',
    description:
      'Small test transaction (GH₵ 1-5) at a POS terminal followed by a large ATM withdrawal within 10 minutes. Classic stolen card pattern.',
    severity: 9,
    riskFactors: ['Micro-test detected', 'Velocity spike', 'Unusual amount'],
  },
  {
    id: 'CROSS_BORDER_ANOMALY',
    name: 'Cross-Border Anomaly',
    description:
      'Card used domestically in Ghana, then a card-not-present transaction from a foreign IP within the hour.',
    severity: 8,
    riskFactors: ['Geo-anomaly', 'Cross-border', 'CNP transaction'],
  },
  {
    id: 'ACCOUNT_TAKEOVER',
    name: 'Account Takeover',
    description:
      'Password reset followed by an immediate large transfer to a new beneficiary within 30 minutes.',
    severity: 10,
    riskFactors: ['Account takeover', 'New beneficiary', 'Unusual amount', 'Credential change'],
  },
  {
    id: 'ROUND_AMOUNT_STRUCTURING',
    name: 'Round Amount Structuring',
    description:
      'Multiple transactions of exactly round amounts (GH₵ 1,000, GH₵ 2,000, GH₵ 5,000) in quick succession, indicating structuring.',
    severity: 7,
    riskFactors: ['Round amounts', 'Velocity spike', 'Structuring pattern'],
  },
];

export function getPatternById(id: string): FraudPattern | undefined {
  return FRAUD_PATTERNS.find((p) => p.id === id);
}

export function getRandomPattern(): FraudPattern {
  return FRAUD_PATTERNS[Math.floor(Math.random() * FRAUD_PATTERNS.length)];
}
