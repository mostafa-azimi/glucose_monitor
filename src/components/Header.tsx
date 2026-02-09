import { Download, Calendar } from 'lucide-react';

interface HeaderProps {
  onExportClick: () => void;
  onTodayClick: () => void;
}

export function Header({ onExportClick, onTodayClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Glucose Monitor
            </h1>
            <p className="text-sm text-gray-500">Track your blood glucose readings</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onTodayClick}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Today
            </button>
            <button
              onClick={onExportClick}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
