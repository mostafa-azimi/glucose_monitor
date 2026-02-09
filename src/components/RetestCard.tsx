import { format } from 'date-fns';
import { GripVertical, Trash2, Clock } from 'lucide-react';
import type { GlucoseRetest } from '../types';
import { getRetestHealthStatus, getColorConfig } from '../utils/colorCoding';

interface RetestCardProps {
  retest: GlucoseRetest;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function RetestCard({ 
  retest, 
  onDelete, 
  onDragStart, 
  onDragEnd,
  isDragging 
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
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing
        ${colorConfig.bgColor} ${colorConfig.borderColor}
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
      `}
    >
      {/* Drag Handle */}
      <div className="text-gray-400 hover:text-gray-600">
        <GripVertical className="w-5 h-5" />
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
        <span className="text-xs font-normal text-gray-500 ml-1">mg/dL</span>
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
