import { format, isToday } from 'date-fns';
import { useReadings } from '../hooks/useReadings';
import { ReadingInput } from './ReadingInput';
import { RetestCard } from './RetestCard';
import { AddRetestButton } from './AddRetestButton';
import type { SessionType } from '../types';
import { SESSIONS } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

interface DayViewProps {
  date: Date;
}

export function DayView({ date }: DayViewProps) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { 
    readings, 
    retests, 
    loading, 
    error, 
    saveReading, 
    addRetest,
    updateRetestPosition,
    updateRetestNotes,
    deleteRetest 
  } = useReadings(dateStr);

  const handleSaveReading = async (
    session: SessionType,
    reading: number | null,
    notes: string | null
  ) => {
    await saveReading(session, reading, notes);
  };

  const getReadingBySession = (session: SessionType) => {
    return readings.find(r => r.session === session);
  };

  // Get retests for a specific position (after session at index)
  const getRetestsAfterSession = (sessionIndex: number) => {
    return retests.filter(r => r.position === sessionIndex);
  };

  const handleMoveUp = (retestId: string, currentPosition: number) => {
    if (currentPosition > 0) {
      updateRetestPosition(retestId, currentPosition - 1);
    }
  };

  const handleMoveDown = (retestId: string, currentPosition: number) => {
    if (currentPosition < 6) {
      updateRetestPosition(retestId, currentPosition + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
      {/* Date Header */}
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          {format(date, 'EEE, MMM d')}
        </h2>
        {isToday(date) && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            Today
          </span>
        )}
      </div>

      {/* Readings List */}
      <div className="space-y-2">
        {SESSIONS.map((session, index) => {
          const reading = getReadingBySession(session);
          const sessionRetests = getRetestsAfterSession(index);
          
          return (
            <div key={session}>
              {/* The Session Reading */}
              {reading && (
                <ReadingInput
                  session={reading.session}
                  reading={reading.reading}
                  notes={reading.notes}
                  updatedAt={reading.updated_at}
                  onSave={(r, n) => handleSaveReading(reading.session, r, n)}
                />
              )}

              {/* Retests Positioned After This Session */}
              {sessionRetests.map((retest) => (
                <div key={retest.id} className="mt-1.5 ml-3">
                  <RetestCard
                    retest={retest}
                    onDelete={() => deleteRetest(retest.id)}
                    onMoveUp={() => handleMoveUp(retest.id, retest.position)}
                    onMoveDown={() => handleMoveDown(retest.id, retest.position)}
                    onUpdateNotes={(notes) => updateRetestNotes(retest.id, notes)}
                    canMoveUp={retest.position > 0}
                    canMoveDown={retest.position < 6}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Add Retest Button */}
      <AddRetestButton onAddRetest={addRetest} />

      {/* Legend - Compact on mobile */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />Severe Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" />Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />Normal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />Elevated</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />High</span>
        </div>
      </div>
    </div>
  );
}
