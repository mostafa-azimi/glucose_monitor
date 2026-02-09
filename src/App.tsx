import { useState } from 'react';
import { Header } from './components/Header';
import { Calendar } from './components/Calendar';
import { DayView } from './components/DayView';
import { ExportModal } from './components/ExportModal';

function App() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onExportClick={() => setShowExportModal(true)}
        onTodayClick={handleTodayClick}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </div>

          {/* Day View */}
          <div className="lg:col-span-2">
            <DayView date={selectedDate} />
          </div>
        </div>
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}

export default App;
