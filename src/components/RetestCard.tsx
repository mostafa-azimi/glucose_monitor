import { format } from 'date-fns';
import { Trash2, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import type { GlucoseRetest } from '../types';
import { getRetestHealthStatus, getColorConfig } from '../utils/colorCoding';

interface RetestCardProps {
  retest: GlucoseRetest;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function RetestCard({ 
  retest, 
  onDelete, 
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: RetestCardProps) {
  const status = getRetestHealthStatus(retest.reading);
  const colorConfig = getColorConfig(status);

  const handleDelete = () => {
    if (confirm('Delete this retest?')) {
      onDelete();
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg border-2 transition-all
        ${colorConfig.bgColor} ${colorConfig.borderColor}
      `}
    >
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

      {/* Notes */}
      {retest.notes && (
        <span className="text-sm text-gray-600 italic flex-1 truncate">
          "{retest.notes}"
        </span>
      )}

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-auto"
        title="Delete retest"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
