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
  position: number; // Position in the day's sequence (0-13, where 0-6 are after each session)
}

// Combined entry type for unified display
export type DayEntry = 
  | { type: 'reading'; data: GlucoseReading; position: number }
  | { type: 'retest'; data: GlucoseRetest; position: number };

export type HealthStatus = 'severe-low' | 'low' | 'normal' | 'elevated' | 'high' | 'none';

export interface ColorConfig {
  status: HealthStatus;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}
