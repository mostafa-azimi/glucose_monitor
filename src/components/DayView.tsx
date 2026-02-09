import { useState, useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { useReadings } from '../hooks/useReadings';
import { ReadingInput } from './ReadingInput';
import { RetestCard } from './RetestCard';
import { AddRetestButton } from './AddRetestButton';
import type { SessionType, GlucoseRetest } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

interface DayViewProps {
  date: Date;
}

type DayEntry = 
  | { type: 'reading'; session: SessionType; position: number }
  | { type: 'retest'; data: GlucoseRetest; position: number }
  | { type: 'drop-zone'; position: number };

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

  // Build unified list with drop zones between each session
  const entries = useMemo(() => {
    const result: DayEntry[] = [];
    
    readings.forEach((reading, index) => {
      // Add drop zone before this session
      result.push({ type: 'drop-zone', position: index });
      
      // Add the reading
      result.push({ type: 'reading', session: reading.session, position: index });
      
      // Add retests that belong after this session
      const sessionRetests = retests.filter(r => r.position === index);
      sessionRetests.forEach(retest => {
        result.push({ type: 'retest', data: retest, position: index });
      });
    });
    
    // Final drop zone after all sessions
    result.push({ type: 'drop-zone', position: 7 });
    
    // Add retests at the end (position 7 or higher)
    const endRetests = retests.filter(r => r.position >= 7);
    endRetests.forEach(retest => {
      result.push({ type: 'retest', data: retest, position: retest.position });
    });

    return result;
  }, [readings, retests]);

  const handleDragStart = (retestId: string) => {
    setDraggedRetest(retestId);
  };

  const handleDragEnd = () => {
    setDraggedRetest(null);
    setDragOverPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDragOverPosition(position);
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
        <p className="text-xs text-gray-400 mt-2">
          Drag retests to reorder them between sessions
        </p>
      </div>

      {/* Unified Readings List */}
      <div className="space-y-2">
        {entries.map((entry, idx) => {
          if (entry.type === 'drop-zone') {
            const isActive = draggedRetest && dragOverPosition === entry.position;
            return (
              <div
                key={`drop-${entry.position}-${idx}`}
                onDragOver={(e) => handleDragOver(e, entry.position)}
                onDrop={(e) => handleDrop(e, entry.position)}
                className={`
                  transition-all duration-200 rounded-lg
                  ${draggedRetest ? 'h-3 my-1' : 'h-0'}
                  ${isActive ? 'h-16 bg-blue-100 border-2 border-dashed border-blue-400' : ''}
                `}
              />
            );
          }
          
          if (entry.type === 'reading') {
            const reading = getReadingBySession(entry.session);
            if (!reading) return null;
            
            return (
              <ReadingInput
                key={reading.session}
                session={reading.session}
                reading={reading.reading}
                notes={reading.notes}
                onSave={(r, n) => handleSaveReading(reading.session, r, n)}
              />
            );
          }
          
          if (entry.type === 'retest') {
            return (
              <RetestCard
                key={entry.data.id}
                retest={entry.data}
                onDelete={() => deleteRetest(entry.data.id)}
                onDragStart={() => handleDragStart(entry.data.id)}
                onDragEnd={handleDragEnd}
                isDragging={draggedRetest === entry.data.id}
              />
            );
          }
          
          return null;
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
