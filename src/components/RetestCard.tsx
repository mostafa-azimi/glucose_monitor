import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Clock, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import type { GlucoseRetest } from '../types';
import { getRetestHealthStatus, getColorConfig } from '../utils/colorCoding';

interface RetestCardProps {
  retest: GlucoseRetest;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateNotes: (notes: string | null) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function RetestCard({ 
  retest, 
  onDelete, 
  onMoveUp,
  onMoveDown,
  onUpdateNotes,
  canMoveUp,
  canMoveDown,
}: RetestCardProps) {
  const [showNotes, setShowNotes] = useState(!!retest.notes);
  const [notes, setNotes] = useState(retest.notes || '');
  
  const status = getRetestHealthStatus(retest.reading);
  const colorConfig = getColorConfig(status);

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

  return (
    <div
      className={`
        p-3 rounded-lg border-2 transition-all
        ${colorConfig.bgColor} ${colorConfig.borderColor}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Move Buttons */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className={`p-0.5 rounded transition-colors ${canMoveUp ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className={`p-0.5 rounded transition-colors ${canMoveDown ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Retest Badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
          <Clock className="w-3 h-3" />
          Retest
        </div>

        {/* Time */}
        <div className="text-xs text-gray-500">
          {format(new Date(retest.recorded_at), 'h:mm a')}
        </div>

        {/* Reading */}
        <span className="text-lg font-semibold text-gray-900">
          {retest.reading}
          <span className="text-sm font-normal text-gray-500 ml-1">mg/dL</span>
        </span>

        {/* Status */}
        <span
          className={`
            text-xs font-medium px-2 py-0.5 rounded-full
            ${colorConfig.bgColor} ${colorConfig.textColor}
          `}
        >
          {colorConfig.label}
        </span>

        {/* Notes Toggle Button */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`
            p-1.5 rounded-lg transition-colors
            ${showNotes || retest.notes ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
          `}
          title="Add notes"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-auto"
          title="Delete retest"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Notes Input */}
      {showNotes && (
        <div className="mt-3 ml-8">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add notes (e.g., 15 min after juice)..."
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      )}
    </div>
  );
}
