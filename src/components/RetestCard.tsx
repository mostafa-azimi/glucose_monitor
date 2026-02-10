import { useState, useEffect } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { Trash2, Clock, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import type { GlucoseRetest } from '../types';
import { getRetestHealthStatus, getColorConfig } from '../utils/colorCoding';

interface RetestCardProps {
  retest: GlucoseRetest;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateNotes: (notes: string | null) => void;
  onUpdateTime: (newTime: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function RetestCard({ 
  retest, 
  onDelete, 
  onMoveUp,
  onMoveDown,
  onUpdateNotes,
  onUpdateTime,
  canMoveUp,
  canMoveDown,
}: RetestCardProps) {
  const [showNotes, setShowNotes] = useState(!!retest.notes);
  const [notes, setNotes] = useState(retest.notes || '');
  const [showTimeEdit, setShowTimeEdit] = useState(false);
  const [timeValue, setTimeValue] = useState(format(new Date(retest.recorded_at), 'HH:mm'));
  
  const status = getRetestHealthStatus(retest.reading);
  const colorConfig = getColorConfig(status);

  useEffect(() => {
    setNotes(retest.notes || '');
    setTimeValue(format(new Date(retest.recorded_at), 'HH:mm'));
  }, [retest.notes, retest.recorded_at]);

  const handleDelete = () => {
    if (confirm('Delete this retest?')) {
      onDelete();
    }
  };

  const handleNotesBlur = () => {
    const trimmedNotes = notes.trim() || null;
    if (trimmedNotes !== retest.notes) {
      onUpdateNotes(trimmedNotes);
    }
  };

  const handleTimeSave = () => {
    if (timeValue) {
      const originalDate = new Date(retest.recorded_at);
      const [hours, minutes] = timeValue.split(':').map(Number);
      let newDate = setHours(originalDate, hours);
      newDate = setMinutes(newDate, minutes);
      onUpdateTime(newDate.toISOString());
    }
    setShowTimeEdit(false);
  };

  return (
    <div
      className={`
        px-2 py-1.5 rounded-lg border-2 transition-all
        ${colorConfig.bgColor} ${colorConfig.borderColor}
      `}
    >
      <div className="flex items-center gap-1.5">
        {/* Move Buttons */}
        <div className="flex flex-col">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className={`p-0 leading-none ${canMoveUp ? 'text-gray-500 active:text-blue-600' : 'text-gray-300'}`}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className={`p-0 leading-none ${canMoveDown ? 'text-gray-500 active:text-blue-600' : 'text-gray-300'}`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Retest Badge */}
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
          <Clock className="w-3 h-3" />
          <span className="hidden xs:inline">Retest</span>
        </div>

        {/* Time - clickable to edit */}
        {!showTimeEdit ? (
          <button
            onClick={() => setShowTimeEdit(true)}
            className="text-xs text-gray-500 hover:text-blue-500"
            title="Click to edit time"
          >
            {format(new Date(retest.recorded_at), 'h:mm a')}
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="text-xs px-1 py-0.5 border rounded w-20"
              autoFocus
            />
            <button
              onClick={handleTimeSave}
              className="text-[10px] text-blue-600 font-medium"
            >
              OK
            </button>
          </div>
        )}

        {/* Reading */}
        <span className="text-base font-semibold text-gray-900">
          {retest.reading}
          <span className="text-xs font-normal text-gray-500 ml-0.5">mg/dL</span>
        </span>

        {/* Status */}
        <span
          className={`
            text-xs font-medium px-1.5 py-0.5 rounded-full
            ${colorConfig.bgColor} ${colorConfig.textColor}
          `}
        >
          {colorConfig.label}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Notes Toggle */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`
            p-1 rounded transition-colors
            ${showNotes || retest.notes ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}
          `}
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 active:text-red-500 rounded"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notes Input */}
      {showNotes && (
        <div className="mt-1.5 ml-5">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add notes..."
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      )}
    </div>
  );
}
