export type SessionType =
  | 'Fasting (Morning)'
  | 'Pre-Lunch'
  | '1-Hr Post-Lunch'
  | '2-Hr Post-Lunch'
  | 'Pre-Dinner'
  | 'Bedtime'
  | 'Overnight';

export const SESSIONS: SessionType[] = [
  'Fasting (Morning)',
  'Pre-Lunch',
  '1-Hr Post-Lunch',
  '2-Hr Post-Lunch',
  'Pre-Dinner',
  'Bedtime',
  'Overnight',
];

export interface GlucoseReading {
  id: string;
  date: string; // YYYY-MM-DD
  session: SessionType;
  reading: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GlucoseRetest {
  id: string;
  date: string; // YYYY-MM-DD
  reading: number;
  notes: string | null;
  recorded_at: string;
}

export type HealthStatus = 'severe-low' | 'low' | 'normal' | 'elevated' | 'high' | 'none';

export interface ColorConfig {
  status: HealthStatus;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}
