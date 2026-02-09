import { Download, Calendar } from 'lucide-react';

interface HeaderProps {
  onExportClick: () => void;
  onTodayClick: () => void;
}

export function Header({ onExportClick, onTodayClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
              Glucose Monitor
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">Track your blood glucose readings</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={onTodayClick}
              className="inline-flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Today</span>
            </button>
            <button
              onClick={onExportClick}
              className="inline-flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
