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
        className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg active:bg-blue-100 transition-colors border-2 border-dashed border-blue-200"
      >
        <Plus className="w-4 h-4" />
        Add Retest
      </button>
    );
  }

  return (
    <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={newReading}
            onChange={(e) => setNewReading(e.target.value)}
            placeholder="--"
            className="w-16 px-2 py-1.5 text-base font-semibold text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            min="0"
            max="600"
            autoFocus
          />
          <span className="text-xs text-gray-500">mg/dL</span>
        </div>
        <input
          type="text"
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="flex-1 min-w-0 px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleAdd}
          disabled={!newReading || saving}
          className={`
            flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded
            active:bg-blue-700 transition-colors
            ${(!newReading || saving) ? 'opacity-50' : ''}
          `}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => {
            setIsAdding(false);
            setNewReading('');
            setNewNotes('');
          }}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-200 rounded active:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
