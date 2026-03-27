'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  X,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Zap,
  Shield,
} from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { ACCOUNT_PROFILES } from '@/lib/data/accountProfiles';
import { injectFraudTransaction } from '@/lib/engine/transactionGenerator';
import { FRAUD_PATTERNS } from '@/lib/engine/fraudPatterns';
import { fraudFlash } from '@/lib/utils/animations';

const SPEED_STEPS = [0.5, 1, 2, 5];

export default function DemoControls() {
  const {
    showControls,
    toggleControls,
    isRunning,
    toggleRunning,
    speed,
    setSpeed,
    fraudRate,
    setFraudRate,
    setScenario,
    resetAll,
    transactions,
    addTransaction,
  } = useStore();

  const [flashOverlay, setFlashOverlay] = useState(false);

  // Keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleControls();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleControls]);

  const handleInjectFraud = useCallback(() => {
    const patternId =
      FRAUD_PATTERNS[Math.floor(Math.random() * FRAUD_PATTERNS.length)].id;
    const fraudTxn = injectFraudTransaction(
      ACCOUNT_PROFILES,
      transactions,
      patternId
    );

    // Trigger dramatic red flash FIRST, then add transaction after a beat
    setFlashOverlay(true);
    setTimeout(() => {
      addTransaction(fraudTxn);
    }, 150);
    setTimeout(() => setFlashOverlay(false), 1400);
  }, [transactions, addTransaction]);

  const handleScenarioNormal = useCallback(() => {
    setFraudRate(0.03);
    setSpeed(1);
    setScenario('normal');
  }, [setFraudRate, setSpeed, setScenario]);

  const handleScenarioAttack = useCallback(() => {
    setFraudRate(0.15);
    setSpeed(2);
    setScenario('attack');
  }, [setFraudRate, setSpeed, setScenario]);

  const handleScenarioComparison = useCallback(() => {
    setScenario('comparison');
  }, [setScenario]);

  const currentSpeedIndex = SPEED_STEPS.indexOf(speed);
  const speedSliderValue =
    currentSpeedIndex >= 0 ? currentSpeedIndex : 1; // default to 1x

  return (
    <>
      {/* Dramatic red flash overlay for fraud injection */}
      <AnimatePresence>
        {flashOverlay && (
          <>
            {/* Multi-phase red flash */}
            <motion.div
              className="fixed inset-0 z-[9999] pointer-events-none"
              variants={fraudFlash}
              initial="hidden"
              animate="flash"
              exit="hidden"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.4) 50%, rgba(239, 68, 68, 0.1) 100%)',
              }}
            />
            {/* Vignette border glow */}
            <motion.div
              className="fixed inset-0 z-[9998] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, times: [0, 0.1, 1] }}
              style={{
                boxShadow: 'inset 0 0 120px 40px rgba(239, 68, 68, 0.5)',
              }}
            />
            {/* FRAUD DETECTED text flash */}
            <motion.div
              className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.1, 1.0, 0.95],
              }}
              transition={{
                duration: 1.2,
                times: [0, 0.1, 0.4, 1],
                ease: 'easeOut',
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle size={48} className="text-red-400" />
                <span className="text-2xl font-bold text-red-400 tracking-wider uppercase">
                  Fraud Detected
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating control panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[100] w-[360px] rounded-xl border backdrop-blur-xl shadow-2xl"
            style={{
              backgroundColor: 'rgba(19, 29, 51, 0.95)',
              borderColor: '#2A3A5A',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: '#2A3A5A' }}
            >
              <div className="flex items-center gap-2">
                <Settings size={16} style={{ color: '#D4A843' }} />
                <span
                  className="text-sm font-semibold tracking-wide"
                  style={{ color: '#F1F5F9' }}
                >
                  Demo Controls
                </span>
              </div>
              <button
                onClick={toggleControls}
                className="p-1 rounded-md transition-colors hover:bg-white/10"
              >
                <X size={16} style={{ color: '#94A3B8' }} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Speed Control */}
              <div>
                <label
                  className="text-[11px] font-medium uppercase tracking-wider mb-2 block"
                  style={{ color: '#94A3B8' }}
                >
                  Speed:{' '}
                  <span style={{ color: '#D4A843' }}>{speed}x</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={SPEED_STEPS.length - 1}
                  step={1}
                  value={speedSliderValue}
                  onChange={(e) =>
                    setSpeed(SPEED_STEPS[parseInt(e.target.value)])
                  }
                  className="w-full accent-[#D4A843] h-1.5 cursor-pointer"
                  style={{ accentColor: '#D4A843' }}
                />
                <div className="flex justify-between mt-1">
                  {SPEED_STEPS.map((s) => (
                    <span
                      key={s}
                      className="text-[10px]"
                      style={{
                        color: s === speed ? '#D4A843' : '#64748B',
                      }}
                    >
                      {s}x
                    </span>
                  ))}
                </div>
              </div>

              {/* Transaction Feed Controls */}
              <div
                className="flex items-center gap-2"
              >
                <button
                  onClick={toggleRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: isRunning
                      ? 'rgba(14, 165, 160, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                    color: isRunning ? '#0EA5A0' : '#F59E0B',
                    border: `1px solid ${isRunning ? 'rgba(14, 165, 160, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  }}
                >
                  {isRunning ? (
                    <>
                      <Pause size={13} /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={13} /> Resume
                    </>
                  )}
                </button>
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: 'rgba(100, 116, 139, 0.15)',
                    color: '#94A3B8',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                  }}
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>

              {/* Inject Fraud Button */}
              <motion.button
                onClick={handleInjectFraud}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)',
                }}
              >
                <AlertTriangle size={16} />
                Inject Fraud Transaction
              </motion.button>

              {/* Fraud Rate Slider */}
              <div>
                <label
                  className="text-[11px] font-medium uppercase tracking-wider mb-2 block"
                  style={{ color: '#94A3B8' }}
                >
                  Fraud Rate:{' '}
                  <span style={{ color: '#EF4444' }}>
                    {Math.round(fraudRate * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={Math.round(fraudRate * 100)}
                  onChange={(e) =>
                    setFraudRate(parseInt(e.target.value) / 100)
                  }
                  className="w-full h-1.5 cursor-pointer"
                  style={{ accentColor: '#EF4444' }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px]" style={{ color: '#64748B' }}>
                    0%
                  </span>
                  <span className="text-[10px]" style={{ color: '#64748B' }}>
                    10%
                  </span>
                  <span className="text-[10px]" style={{ color: '#64748B' }}>
                    20%
                  </span>
                </div>
              </div>

              {/* Scenario Buttons */}
              <div>
                <label
                  className="text-[11px] font-medium uppercase tracking-wider mb-2 block"
                  style={{ color: '#94A3B8' }}
                >
                  Scenarios
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleScenarioNormal}
                    className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-colors"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <Shield size={14} />
                    Normal Day
                  </button>
                  <button
                    onClick={handleScenarioAttack}
                    className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-colors"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    <Zap size={14} />
                    Under Attack
                  </button>
                  <button
                    onClick={handleScenarioComparison}
                    className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-colors"
                    style={{
                      backgroundColor: 'rgba(212, 168, 67, 0.12)',
                      color: '#D4A843',
                      border: '1px solid rgba(212, 168, 67, 0.25)',
                    }}
                  >
                    <Settings size={14} />
                    Comparison
                  </button>
                </div>
              </div>
            </div>

            {/* Footer hint */}
            <div
              className="px-5 py-2 border-t text-center"
              style={{ borderColor: '#2A3A5A' }}
            >
              <span className="text-[10px]" style={{ color: '#64748B' }}>
                Toggle with{' '}
                <kbd
                  className="px-1 py-0.5 rounded text-[9px] font-mono"
                  style={{
                    backgroundColor: 'rgba(100, 116, 139, 0.2)',
                    color: '#94A3B8',
                  }}
                >
                  Ctrl+Shift+D
                </kbd>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
