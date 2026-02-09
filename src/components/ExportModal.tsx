import { useState } from 'react';
import { format, startOfYear, endOfYear } from 'date-fns';
import { X, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useAllReadings } from '../hooks/useReadings';
import { exportToCSV } from '../utils/exportCSV';
import { exportToPDF } from '../utils/exportPDF';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const currentYear = 2026;
  const [startDate, setStartDate] = useState(
    format(startOfYear(new Date(currentYear, 0, 1)), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(
    format(endOfYear(new Date(currentYear, 0, 1)), 'yyyy-MM-dd')
  );
  const [exporting, setExporting] = useState(false);
  const { fetchAllReadings, error } = useAllReadings();

  if (!isOpen) return null;

  const handleExport = async (type: 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const { readings, retests } = await fetchAllReadings(startDate, endDate);

      const filename = `glucose-readings-${startDate}-to-${endDate}`;

      if (type === 'csv') {
        exportToCSV(readings, retests, filename);
      } else {
        exportToPDF(readings, retests, startDate, endDate, filename);
      }

      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // Quick date range presets
  const setPreset = (preset: 'week' | 'month' | 'year') => {
    const today = new Date();
    const end = format(today, 'yyyy-MM-dd');

    if (preset === 'week') {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(end);
    } else if (preset === 'month') {
      const start = new Date(today);
      start.setMonth(start.getMonth() - 1);
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(end);
    } else {
      setStartDate(format(startOfYear(new Date(currentYear, 0, 1)), 'yyyy-MM-dd'));
      setEndDate(format(endOfYear(new Date(currentYear, 0, 1)), 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Export Data</h2>
        <p className="text-sm text-gray-500 mb-6">
          Download your glucose readings as CSV or PDF
        </p>

        {/* Date Range */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Presets */}
          <div className="flex gap-2">
            <button
              onClick={() => setPreset('week')}
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              Last 7 days
            </button>
            <button
              onClick={() => setPreset('month')}
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              Last 30 days
            </button>
            <button
              onClick={() => setPreset('year')}
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              Full Year 2026
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3
              text-sm font-medium text-gray-700 bg-gray-100 rounded-lg
              hover:bg-gray-200 transition-colors
              ${exporting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-5 h-5" />
            )}
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3
              text-sm font-medium text-white bg-blue-600 rounded-lg
              hover:bg-blue-700 transition-colors
              ${exporting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
