import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import type { SessionType } from '../types';
import { getHealthStatus, getColorConfig } from '../utils/colorCoding';
import { MessageSquare } from 'lucide-react';

interface ReadingInputProps {
  session: SessionType;
  reading: number | null;
  notes: string | null;
  updatedAt: string | null;
  onSave: (reading: number | null, notes: string | null) => Promise<void>;
  disabled?: boolean;
}

export function ReadingInput({ 
  session, 
  reading: initialReading, 
  notes: initialNotes, 
  updatedAt,
  onSave,
  disabled = false,
}: ReadingInputProps) {
  const [reading, setReading] = useState<string>(
    initialReading !== null ? String(initialReading) : ''
  );
  const [notes, setNotes] = useState<string>(initialNotes || '');
  const [showNotes, setShowNotes] = useState(!!initialNotes);
  const [saving, setSaving] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setReading(initialReading !== null ? String(initialReading) : '');
    setNotes(initialNotes || '');
    setShowNotes(!!initialNotes);
  }, [initialReading, initialNotes]);

  const readingValue = reading ? parseInt(reading, 10) : null;
  const status = getHealthStatus(readingValue, session);
  const colorConfig = getColorConfig(status);

  // Debounced save
  const handleSave = useCallback(async () => {
    if (disabled) return;
    
    const numReading = reading ? parseInt(reading, 10) : null;
    if (numReading === initialReading && notes === (initialNotes || '')) {
      return; // No changes
    }

    setSaving(true);
    try {
      await onSave(numReading, notes || null);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }, [reading, notes, initialReading, initialNotes, onSave, disabled]);

  // Auto-save on blur
  const handleBlur = () => {
    handleSave();
  };

  return (
    <div
      className={`
        px-3 py-2 rounded-lg border-2 transition-all
        ${colorConfig.bgColor} ${colorConfig.borderColor}
      `}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Session name + timestamp */}
        <div className="min-w-0 flex-shrink">
          <span className="text-sm font-medium text-gray-900 truncate block">
            {session}
          </span>
          {updatedAt && initialReading !== null && (
            <span className="text-[10px] text-gray-400">
              {format(new Date(updatedAt), 'h:mm a')}
            </span>
          )}
        </div>

        {/* Status badge */}
        {status !== 'none' && (
          <span
            className={`
              text-xs font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0
              ${colorConfig.bgColor} ${colorConfig.textColor}
            `}
          >
            {colorConfig.label}
          </span>
        )}

        {saving && (
          <span className="text-xs text-gray-400 flex-shrink-0">Saving...</span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Input + unit */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <input
            type="number"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            onBlur={handleBlur}
            placeholder="--"
            disabled={disabled}
            className={`
              w-16 px-2 py-1 text-base font-semibold text-center
              border rounded focus:outline-none focus:ring-2 focus:ring-blue-500
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            `}
            min="0"
            max="600"
          />
          <span className="text-xs text-gray-500">mg/dL</span>
        </div>

        {/* Notes button */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`
            p-1.5 rounded transition-colors flex-shrink-0
            ${showNotes || notes ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
          `}
          title="Add notes"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>

      {showNotes && (
        <div className="mt-2">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleBlur}
            placeholder="Add notes..."
            disabled={disabled}
            className={`
              w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            `}
          />
        </div>
      )}
    </div>
  );
}
