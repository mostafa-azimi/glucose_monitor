import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { GlucoseReading, GlucoseRetest, SessionType } from '../types';
import { SESSIONS } from '../types';

export function useReadings(date: string) {
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [retests, setRetests] = useState<GlucoseRetest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch readings for a specific date
  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch scheduled readings
      const { data: readingsData, error: readingsError } = await supabase
        .from('glucose_readings')
        .select('*')
        .eq('date', date)
        .order('created_at', { ascending: true });

      if (readingsError) throw readingsError;

      // Fetch retests
      const { data: retestsData, error: retestsError } = await supabase
        .from('glucose_retests')
        .select('*')
        .eq('date', date)
        .order('recorded_at', { ascending: true });

      if (retestsError) throw retestsError;

      // Create a map of existing readings
      const readingsMap = new Map<SessionType, GlucoseReading>();
      (readingsData || []).forEach((r: GlucoseReading) => {
        readingsMap.set(r.session as SessionType, r);
      });

      // Ensure all sessions have an entry (create placeholders for missing ones)
      const fullReadings: GlucoseReading[] = SESSIONS.map((session) => {
        const existing = readingsMap.get(session);
        if (existing) {
          return existing;
        }
        // Return a placeholder (not saved to DB yet)
        return {
          id: `placeholder-${session}`,
          date,
          session,
          reading: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      setReadings(fullReadings);
      setRetests(retestsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch readings');
      console.error('Error fetching readings:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  // Save or update a reading
  const saveReading = async (
    session: SessionType,
    reading: number | null,
    notes: string | null
  ) => {
    try {
      const { data, error } = await supabase
        .from('glucose_readings')
        .upsert(
          {
            date,
            session,
            reading,
            notes,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'date,session',
          }
        )
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setReadings((prev) =>
        prev.map((r) => (r.session === session ? { ...r, ...data } : r))
      );

      return data;
    } catch (err) {
      console.error('Error saving reading:', err);
      throw err;
    }
  };

  // Add a retest
  const addRetest = async (reading: number, notes: string | null, position: number = 7) => {
    try {
      const { data, error } = await supabase
        .from('glucose_retests')
        .insert({
          date,
          reading,
          notes,
          recorded_at: new Date().toISOString(),
          position,
        })
        .select()
        .single();

      if (error) throw error;

      setRetests((prev) => [...prev, data].sort((a, b) => a.position - b.position));
      return data;
    } catch (err) {
      console.error('Error adding retest:', err);
      throw err;
    }
  };

  // Update retest position (optimistic update - instant UI, then sync to DB)
  const updateRetestPosition = async (id: string, position: number) => {
    // Optimistic update - update UI immediately
    setRetests((prev) => 
      prev.map((r) => (r.id === id ? { ...r, position } : r))
        .sort((a, b) => a.position - b.position)
    );

    // Then sync to database in background
    try {
      const { error } = await supabase
        .from('glucose_retests')
        .update({ position })
        .eq('id', id);

      if (error) {
        // Revert on error - refetch from DB
        console.error('Error updating retest position:', error);
        fetchReadings();
      }
    } catch (err) {
      console.error('Error updating retest position:', err);
      fetchReadings(); // Revert by refetching
    }
  };

  // Update retest notes (optimistic update)
  const updateRetestNotes = async (id: string, notes: string | null) => {
    // Optimistic update
    setRetests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, notes } : r))
    );

    try {
      const { error } = await supabase
        .from('glucose_retests')
        .update({ notes })
        .eq('id', id);

      if (error) {
        console.error('Error updating retest notes:', error);
        fetchReadings();
      }
    } catch (err) {
      console.error('Error updating retest notes:', err);
      fetchReadings();
    }
  };

  // Delete a retest
  const deleteRetest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('glucose_retests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRetests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Error deleting retest:', err);
      throw err;
    }
  };

  return {
    readings,
    retests,
    loading,
    error,
    saveReading,
    addRetest,
    updateRetestPosition,
    updateRetestNotes,
    deleteRetest,
    refresh: fetchReadings,
  };
}

// Hook to fetch all readings for export
export function useAllReadings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllReadings = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);

    try {
      let readingsQuery = supabase
        .from('glucose_readings')
        .select('*')
        .order('date', { ascending: true })
        .order('created_at', { ascending: true });

      let retestsQuery = supabase
        .from('glucose_retests')
        .select('*')
        .order('date', { ascending: true })
        .order('recorded_at', { ascending: true });

      if (startDate) {
        readingsQuery = readingsQuery.gte('date', startDate);
        retestsQuery = retestsQuery.gte('date', startDate);
      }
      if (endDate) {
        readingsQuery = readingsQuery.lte('date', endDate);
        retestsQuery = retestsQuery.lte('date', endDate);
      }

      const [readingsResult, retestsResult] = await Promise.all([
        readingsQuery,
        retestsQuery,
      ]);

      if (readingsResult.error) throw readingsResult.error;
      if (retestsResult.error) throw retestsResult.error;

      return {
        readings: readingsResult.data as GlucoseReading[],
        retests: retestsResult.data as GlucoseRetest[],
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch readings');
      console.error('Error fetching all readings:', err);
      return { readings: [], retests: [] };
    } finally {
      setLoading(false);
    }
  };

  return { fetchAllReadings, loading, error };
}
