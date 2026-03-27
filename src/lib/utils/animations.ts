// Framer Motion animation variants for the fraud detection dashboard

import type { Variants, Transition } from 'framer-motion';

// --- Spring configs ---

/** Snappy spring for cards and UI elements */
export const snappySpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

/** Gentle spring for larger movements */
export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 24,
};

/** Bouncy spring for emphasis */
export const bouncySpring: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 0.8,
};

// --- Variants ---

/** Staggered card reveal — fade + slide up with spring */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
      delay: i * 0.1,
    },
  }),
};

/** Slide in from the right — for new transactions, with spring + stagger */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 80, scale: 0.95 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 28,
      mass: 0.8,
      delay: i * 0.06,
    },
  }),
  exit: {
    opacity: 0,
    x: -40,
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

/** Simple fade in */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/** Scale up from 0.95 with spring */
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

/** Pulse glow for fraud alerts — used on high-risk transaction cards */
export const pulseGlow: Variants = {
  idle: {
    boxShadow: '0 0 0px rgba(239, 68, 68, 0)',
  },
  pulse: {
    boxShadow: [
      '0 0 0px rgba(239, 68, 68, 0)',
      '0 0 24px rgba(239, 68, 68, 0.7)',
      '0 0 8px rgba(239, 68, 68, 0.25)',
    ],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Risk bar fill — spring-based width animation */
export const riskBarFill = {
  type: 'spring' as const,
  stiffness: 120,
  damping: 18,
  mass: 0.6,
};

/** Animation config for number count-up effect.
 *  Use with a counter library or custom hook — this provides spring config. */
export const numberCount = {
  type: 'spring' as const,
  stiffness: 50,
  damping: 20,
  duration: 1.2,
};

/** Stagger container — wrap children that use cardReveal or similar */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/** Tab / view transition */
export const tabTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

/** Expand/collapse for transaction detail */
export const expandCollapse: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    overflow: 'hidden',
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
};

/** Dramatic fraud injection flash — multi-phase */
export const fraudFlash: Variants = {
  hidden: { opacity: 0 },
  flash: {
    opacity: [0, 0.6, 0.15, 0.4, 0],
    transition: {
      duration: 1.2,
      times: [0, 0.08, 0.25, 0.4, 1],
      ease: 'easeOut',
    },
  },
};

/** Screen shake for fraud injection */
export const screenShake: Variants = {
  idle: { x: 0, y: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, -2, 0],
    y: [0, 2, -2, 1, -1, 0, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};
