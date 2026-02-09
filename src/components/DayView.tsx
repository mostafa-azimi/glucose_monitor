import { useState } from 'react';
import { format, isToday } from 'date-fns';
import { useReadings } from '../hooks/useReadings';
import { ReadingInput } from './ReadingInput';
import { RetestCard } from './RetestCard';
import { AddRetestButton } from './AddRetestButton';
import type { SessionType, GlucoseRetest } from '../types';
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

  const [draggedRetest, setDraggedRetest] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);

  const handleSaveReading = async (
    session: SessionType,
    reading: number | null,
    notes: string | null
  ) => {
    await saveReading(session, reading, notes);
  };

  const handleDragStart = (retestId: string) => {
    setDraggedRetest(retestId);
  };

  const handleDragEnd = () => {
    setDraggedRetest(null);
    setDragOverPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPosition(position);
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  const handleDrop = async (e: React.DragEvent, position: number) => {
    e.preventDefault();
    if (draggedRetest) {
      await updateRetestPosition(draggedRetest, position);
    }
    setDraggedRetest(null);
    setDragOverPosition(null);
  };

  const getReadingBySession = (session: SessionType) => {
    return readings.find(r => r.session === session);
  };

  // Get retests for a specific position (after session at index)
  const getRetestsAfterSession = (sessionIndex: number) => {
    return retests.filter(r => r.position === sessionIndex);
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

  // Session names for drop zone labels
  const sessionLabels = [
    'Fasting',
    'Pre-Lunch', 
    '1-Hr Post-Lunch',
    '2-Hr Post-Lunch',
    'Pre-Dinner',
    'Bedtime',
    'Overnight'
  ];

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
        {draggedRetest && (
          <p className="text-xs text-blue-500 mt-2 font-medium">
            Drop between sessions to reposition
          </p>
        )}
      </div>

      {/* Readings List with Drop Zones */}
      <div className="space-y-1">
        {SESSIONS.map((session, index) => {
          const reading = getReadingBySession(session);
          const sessionRetests = getRetestsAfterSession(index);
          const isDropActive = draggedRetest && dragOverPosition === index;
          
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
              
              {/* Drop Zone After This Session */}
              <div
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  transition-all duration-200 rounded-lg mx-2 my-1
                  ${draggedRetest ? 'min-h-[40px] border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center' : 'h-1'}
                  ${isDropActive ? 'min-h-[60px] bg-blue-100 border-blue-400 border-2' : ''}
                `}
              >
                {draggedRetest && (
                  <span className={`text-xs ${isDropActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                    {isDropActive ? `Drop here (after ${sessionLabels[index]})` : `After ${sessionLabels[index]}`}
                  </span>
                )}
              </div>

              {/* Retests Positioned After This Session */}
              {sessionRetests.map((retest) => (
                <div key={retest.id} className="ml-4">
                  <RetestCard
                    retest={retest}
                    onDelete={() => deleteRetest(retest.id)}
                    onDragStart={() => handleDragStart(retest.id)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedRetest === retest.id}
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
