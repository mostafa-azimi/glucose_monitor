import { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddRetestButtonProps {
  onAddRetest: (reading: number, notes: string | null, position?: number) => Promise<void>;
}

export function AddRetestButton({ onAddRetest }: AddRetestButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newReading, setNewReading] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newReading) return;

    setSaving(true);
    try {
      await onAddRetest(parseInt(newReading, 10), newNotes || null, 7);
      setNewReading('');
      setNewNotes('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add retest:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-2 border-dashed border-blue-200"
      >
        <Plus className="w-5 h-5" />
        Add Retest
      </button>
    );
  }

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
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
      <p className="text-xs text-gray-400 mt-2">
        After adding, drag the retest to position it between sessions
      </p>
    </div>
  );
}
