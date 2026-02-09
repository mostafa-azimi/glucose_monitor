import { GlucoseReading, GlucoseRetest } from '../types';
import { format } from 'date-fns';
import { getHealthStatus, getRetestHealthStatus, getColorConfig } from './colorCoding';

export function exportToCSV(
  readings: GlucoseReading[],
  retests: GlucoseRetest[],
  filename: string = 'glucose-readings'
) {
  const rows: string[][] = [];

  // Header row
  rows.push(['Date', 'Session/Time', 'Reading (mg/dL)', 'Status', 'Notes']);

  // Add readings
  readings.forEach((reading) => {
    if (reading.reading !== null) {
      const status = getHealthStatus(reading.reading, reading.session);
      const colorConfig = getColorConfig(status);
      rows.push([
        reading.date,
        reading.session,
        String(reading.reading),
        colorConfig.label || 'N/A',
        reading.notes || '',
      ]);
    }
  });

  // Add retests
  retests.forEach((retest) => {
    const status = getRetestHealthStatus(retest.reading);
    const colorConfig = getColorConfig(status);
    rows.push([
      retest.date,
      `Retest @ ${format(new Date(retest.recorded_at), 'h:mm a')}`,
      String(retest.reading),
      colorConfig.label || 'N/A',
      retest.notes || '',
    ]);
  });

  // Convert to CSV string
  const csvContent = rows
    .map((row) =>
      row.map((cell) => {
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = cell.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
