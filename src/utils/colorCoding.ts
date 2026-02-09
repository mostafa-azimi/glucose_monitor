import type { SessionType, HealthStatus, ColorConfig } from '../types';

type SessionCategory = 'fasting' | 'pre-meal' | 'post-meal';

function getSessionCategory(session: SessionType): SessionCategory {
  if (session === 'Fasting (Morning)') {
    return 'fasting';
  }
  if (session === 'Pre-Lunch' || session === 'Pre-Dinner') {
    return 'pre-meal';
  }
  if (session === '1-Hr Post-Lunch' || session === '2-Hr Post-Lunch') {
    return 'post-meal';
  }
  // Bedtime and Overnight use pre-meal ranges
  return 'pre-meal';
}

export function getHealthStatus(reading: number | null, session: SessionType): HealthStatus {
  if (reading === null || reading === undefined) {
    return 'none';
  }

  // Universal thresholds (any session)
  if (reading < 55) {
    return 'severe-low';
  }
  if (reading < 70) {
    return 'low';
  }
  if (reading >= 200) {
    return 'high';
  }

  const category = getSessionCategory(session);

  // Fasting ranges
  if (category === 'fasting') {
    if (reading >= 70 && reading <= 99) {
      return 'normal';
    }
    if (reading >= 100 && reading <= 125) {
      return 'elevated';
    }
    if (reading >= 126) {
      return 'high';
    }
  }

  // Pre-meal ranges (also used for Bedtime/Overnight)
  if (category === 'pre-meal') {
    if (reading >= 70 && reading <= 130) {
      return 'normal';
    }
    if (reading > 130 && reading < 200) {
      return 'elevated';
    }
  }

  // Post-meal ranges
  if (category === 'post-meal') {
    if (reading < 140) {
      return 'normal';
    }
    if (reading >= 140 && reading <= 199) {
      return 'elevated';
    }
  }

  return 'normal';
}

// For retests, we use general ranges (similar to pre-meal)
export function getRetestHealthStatus(reading: number | null): HealthStatus {
  if (reading === null || reading === undefined) {
    return 'none';
  }

  if (reading < 55) {
    return 'severe-low';
  }
  if (reading < 70) {
    return 'low';
  }
  if (reading >= 200) {
    return 'high';
  }
  if (reading >= 70 && reading <= 130) {
    return 'normal';
  }
  if (reading > 130 && reading < 200) {
    return 'elevated';
  }

  return 'normal';
}

export function getColorConfig(status: HealthStatus): ColorConfig {
  switch (status) {
    case 'severe-low':
      return {
        status,
        label: 'Severe Low',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-400',
      };
    case 'low':
      return {
        status,
        label: 'Low',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-400',
      };
    case 'normal':
      return {
        status,
        label: 'Normal',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-400',
      };
    case 'elevated':
      return {
        status,
        label: 'Elevated',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-400',
      };
    case 'high':
      return {
        status,
        label: 'High',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-400',
      };
    default:
      return {
        status: 'none',
        label: '',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-200',
      };
  }
}
