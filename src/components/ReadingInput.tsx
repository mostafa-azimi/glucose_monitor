import { useState, useEffect, useCallback } from 'react';
import type { SessionType } from '../types';
import { getHealthStatus, getColorConfig } from '../utils/colorCoding';
import { MessageSquare } from 'lucide-react';

interface ReadingInputProps {
  session: SessionType;
  reading: number | null;
  notes: string | null;
  onSave: (reading: number | null, notes: string | null) => Promise<void>;
  disabled?: boolean;
}

export function ReadingInput({ 
  session, 
  reading: initialReading, 
  notes: initialNotes, 
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
        p-4 rounded-lg border-2 transition-all
        ${colorConfig.bgColor} ${colorConfig.borderColor}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900">{session}</h3>
            {status !== 'none' && (
              <span
                className={`
                  text-xs font-medium px-2 py-0.5 rounded-full
                  ${colorConfig.bgColor} ${colorConfig.textColor}
                `}
              >
                {colorConfig.label}
              </span>
            )}
            {saving && (
              <span className="text-xs text-gray-400">Saving...</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                onBlur={handleBlur}
                placeholder="--"
                disabled={disabled}
                className={`
                  w-20 px-2 py-2 text-lg font-semibold text-center
                  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                `}
                min="0"
                max="600"
              />
              <span className="text-sm text-gray-500">mg/dL</span>
            </div>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`
                p-2 rounded-lg transition-colors
                ${showNotes || notes ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
              `}
              title="Add notes"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          {showNotes && (
            <div className="mt-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleBlur}
                placeholder="Add notes..."
                disabled={disabled}
                className={`
                  w-full px-3 py-2 text-sm border rounded-lg resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                `}
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
