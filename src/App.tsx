import { useState } from 'react';
import { Header } from './components/Header';
import { Calendar } from './components/Calendar';
import { DayView } from './components/DayView';
import { ExportModal } from './components/ExportModal';

// Get the "effective" date - if before 5am, use yesterday
function getEffectiveDate(): Date {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 5) {
    // Before 5am, show yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }
  return now;
}

function App() {
  const effectiveToday = getEffectiveDate();
  const [selectedDate, setSelectedDate] = useState(effectiveToday);
  const [currentMonth, setCurrentMonth] = useState(effectiveToday);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleTodayClick = () => {
    const effectiveToday = getEffectiveDate();
    setSelectedDate(effectiveToday);
    setCurrentMonth(effectiveToday);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onExportClick={() => setShowExportModal(true)}
        onTodayClick={handleTodayClick}
      />

      <main className="max-w-4xl mx-auto px-2 py-3 sm:px-4 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
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
