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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading readings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Date Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h2>
        {isToday(date) && (
          <span className="inline-block mt-1 text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Today
          </span>
        )}
      </div>

      {/* Readings List */}
      <div className="space-y-3">
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
                  onSave={(r, n) => handleSaveReading(reading.session, r, n)}
                />
              )}

              {/* Retests Positioned After This Session */}
              {sessionRetests.map((retest) => (
                <div key={retest.id} className="mt-2 ml-6">
                  <RetestCard
                    retest={retest}
                    onDelete={() => deleteRetest(retest.id)}
                    onMoveUp={() => handleMoveUp(retest.id, retest.position)}
                    onMoveDown={() => handleMoveDown(retest.id, retest.position)}
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

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Color Legend
        </h4>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-gray-600">Severe Low (&lt;55)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-gray-600">Low (55-69)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-gray-600">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-gray-600">Elevated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-gray-600">High (≥200)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
