'use client';

import { create } from 'zustand';
import type { Transaction } from '@/lib/engine/transactionGenerator';

interface DashboardStats {
  totalProcessed: number;
  fraudDetected: number;
  detectionRate: number;
  falsePositiveRate: number;
}

type Scenario = 'normal' | 'attack' | 'comparison';

interface StoreState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  stats: DashboardStats;
  isRunning: boolean;
  speed: number;
  fraudRate: number;
  scenario: Scenario;
  showControls: boolean;

  addTransaction: (t: Transaction) => void;
  selectTransaction: (t: Transaction | null) => void;
  setSpeed: (s: number) => void;
  setFraudRate: (r: number) => void;
  setScenario: (s: Scenario) => void;
  toggleRunning: () => void;
  resetAll: () => void;
  toggleControls: () => void;
}

const MAX_TRANSACTIONS = 200;

export const useStore = create<StoreState>((set) => ({
  transactions: [],
  selectedTransaction: null,
  stats: {
    totalProcessed: 0,
    fraudDetected: 0,
    detectionRate: 97.3,
    falsePositiveRate: 2.1,
  },
  isRunning: true,
  speed: 1,
  fraudRate: 0.04,
  scenario: 'normal',
  showControls: false,

  addTransaction: (t) =>
    set((state) => {
      const updated = [t, ...state.transactions].slice(0, MAX_TRANSACTIONS);
      const totalProcessed = state.stats.totalProcessed + 1;
      const fraudDetected =
        state.stats.fraudDetected + (t.decision === 'BLOCKED' || t.decision === 'REVIEW' ? 1 : 0);

      // Recalculate rates with some smoothing
      const actualFraudCount = updated.filter((tx) => tx.isFraud).length;
      const detectedFraudCount = updated.filter(
        (tx) => tx.isFraud && (tx.decision === 'BLOCKED' || tx.decision === 'REVIEW')
      ).length;
      const falsePositiveCount = updated.filter(
        (tx) => !tx.isFraud && (tx.decision === 'BLOCKED' || tx.decision === 'REVIEW')
      ).length;
      const totalFlagged = updated.filter(
        (tx) => tx.decision === 'BLOCKED' || tx.decision === 'REVIEW'
      ).length;

      const detectionRate =
        actualFraudCount > 0
          ? Math.round((detectedFraudCount / actualFraudCount) * 1000) / 10
          : 97.3;
      const falsePositiveRate =
        totalFlagged > 0
          ? Math.round((falsePositiveCount / totalFlagged) * 1000) / 10
          : 2.1;

      return {
        transactions: updated,
        stats: {
          totalProcessed,
          fraudDetected,
          detectionRate: Math.min(detectionRate, 99.9),
          falsePositiveRate: Math.max(falsePositiveRate, 0.5),
        },
      };
    }),

  selectTransaction: (t) => set({ selectedTransaction: t }),

  setSpeed: (speed) => set({ speed }),

  setFraudRate: (fraudRate) => set({ fraudRate }),

  setScenario: (scenario) =>
    set({
      scenario,
      fraudRate: scenario === 'attack' ? 0.15 : 0.04,
    }),

  toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),

  resetAll: () =>
    set({
      transactions: [],
      selectedTransaction: null,
      stats: {
        totalProcessed: 0,
        fraudDetected: 0,
        detectionRate: 97.3,
        falsePositiveRate: 2.1,
      },
      isRunning: true,
      speed: 1,
      fraudRate: 0.04,
      scenario: 'normal',
    }),

  toggleControls: () => set((state) => ({ showControls: !state.showControls })),
}));
