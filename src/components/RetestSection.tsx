import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Clock } from 'lucide-react';
import { GlucoseRetest } from '../types';
import { getRetestHealthStatus, getColorConfig } from '../utils/colorCoding';

interface RetestSectionProps {
  retests: GlucoseRetest[];
  onAddRetest: (reading: number, notes: string | null) => Promise<void>;
  onDeleteRetest: (id: string) => Promise<void>;
  disabled?: boolean;
}

export function RetestSection({
  retests,
  onAddRetest,
  onDeleteRetest,
  disabled = false,
}: RetestSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newReading, setNewReading] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newReading) return;

    setSaving(true);
    try {
      await onAddRetest(parseInt(newReading, 10), newNotes || null);
      setNewReading('');
      setNewNotes('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add retest:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this retest?')) return;
    try {
      await onDeleteRetest(id);
    } catch (err) {
      console.error('Failed to delete retest:', err);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Ad-hoc Retests
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            disabled={disabled}
            className={`
              inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium
              text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Plus className="w-4 h-4" />
            Add Retest
          </button>
        )}
      </div>

      {/* Add New Retest Form */}
      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Reading
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newReading}
                  onChange={(e) => setNewReading(e.target.value)}
                  placeholder="--"
                  className="w-24 px-3 py-2 text-lg font-semibold text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  min="0"
                  max="600"
                  autoFocus
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  mg/dL
                </span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g., 15 min after juice"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleAdd}
              disabled={!newReading || saving}
              className={`
                px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
                hover:bg-blue-700 transition-colors
                ${(!newReading || saving) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {saving ? 'Saving...' : 'Save Retest'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewReading('');
                setNewNotes('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Retests List */}
      {retests.length > 0 ? (
        <div className="space-y-2">
          {retests.map((retest) => {
            const status = getRetestHealthStatus(retest.reading);
            const colorConfig = getColorConfig(status);

            return (
              <div
                key={retest.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border-2
                  ${colorConfig.bgColor} ${colorConfig.borderColor}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {format(new Date(retest.recorded_at), 'h:mm a')}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {retest.reading}
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      mg/dL
                    </span>
                  </span>
                  <span
                    className={`
                      text-xs font-medium px-2 py-0.5 rounded-full
                      ${colorConfig.bgColor} ${colorConfig.textColor}
                    `}
                  >
                    {colorConfig.label}
                  </span>
                  {retest.notes && (
                    <span className="text-sm text-gray-600 italic">
                      "{retest.notes}"
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(retest.id)}
                  disabled={disabled}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Delete retest"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        !isAdding && (
          <p className="text-sm text-gray-400 text-center py-4">
            No retests recorded for this day
          </p>
        )
      )}
    </div>
  );
}
