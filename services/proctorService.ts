import { ProctorEvent } from '../types';

export const analyzeBehavior = (currentCheatScore: number): { scoreDelta: number, event: ProctorEvent | null } => {
  // Ultra-Low Sensitivity Simulation
  // We drastically reduced probabilities to avoid false positives for honest students.
  const random = Math.random();

  // Very Rare: Phone Detection (Approx 1 in 1000 checks)
  if (random > 0.999) {
    return {
      scoreDelta: 10, // Lower impact
      event: {
        id: Math.random().toString(),
        timestamp: new Date(),
        type: 'PHONE_DETECTED',
        severity: 'high'
      }
    };
  }

  // Very Rare: Multiple Faces
  if (random > 0.998 && random <= 0.999) {
    return {
      scoreDelta: 10,
      event: {
        id: Math.random().toString(),
        timestamp: new Date(),
        type: 'MULTIPLE_FACES',
        severity: 'high',
      }
    };
  }

  // Occasional: Looking Away - Only if very prolonged (simulated by rarity)
  if (random > 0.996 && random <= 0.998) {
    return {
      scoreDelta: 5,
      event: {
        id: Math.random().toString(),
        timestamp: new Date(),
        type: 'FACE_MISSING',
        severity: 'medium'
      }
    };
  }

  // Noise - Extremely rare now
  if (random > 0.994 && random <= 0.995) {
    return {
      scoreDelta: 2,
      event: {
        id: Math.random().toString(),
        timestamp: new Date(),
        type: 'NOISE_DETECTED',
        severity: 'low',
      }
    };
  }

  // Stronger Healing: Quickly recover score if behaving well
  // This compensates for any accidental false positives
  if (currentCheatScore > 0) {
    return { scoreDelta: -1.0, event: null }; // Heals 5x faster than before
  }

  return { scoreDelta: 0, event: null };
};