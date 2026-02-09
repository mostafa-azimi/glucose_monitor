-- Glucose Monitor Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Table for scheduled daily readings (7 sessions per day)
CREATE TABLE IF NOT EXISTS glucose_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  session TEXT NOT NULL,
  reading INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one reading per session per day
  UNIQUE(date, session)
);

-- Table for ad-hoc retests (follow-up readings)
CREATE TABLE IF NOT EXISTS glucose_retests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  reading INTEGER NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Fast lookups by date
CREATE INDEX IF NOT EXISTS idx_readings_date ON glucose_readings(date);
CREATE INDEX IF NOT EXISTS idx_retests_date ON glucose_retests(date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- For now, we'll allow all operations (no authentication required)
-- You can add authentication later if needed

ALTER TABLE glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_retests ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users
CREATE POLICY "Allow all operations on glucose_readings" 
  ON glucose_readings 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations on glucose_retests" 
  ON glucose_retests 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- HELPER FUNCTION (optional)
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on glucose_readings
CREATE TRIGGER update_glucose_readings_updated_at
  BEFORE UPDATE ON glucose_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
