import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GlucoseReading, GlucoseRetest } from '../types';
import { format } from 'date-fns';
import { getHealthStatus, getRetestHealthStatus, getColorConfig } from './colorCoding';

export function exportToPDF(
  readings: GlucoseReading[],
  retests: GlucoseRetest[],
  startDate: string,
  endDate: string,
  filename: string = 'glucose-readings'
) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text('Blood Glucose Report', 14, 22);

  // Date range
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Period: ${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`,
    14,
    32
  );

  // Generated date
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 14, 40);

  // Prepare table data
  type TableRow = (string | { content: string; styles: { fillColor: [number, number, number] } })[];
  const tableData: TableRow[] = [];

  // Combine and sort readings and retests by date
  const allEntries: {
    date: string;
    session: string;
    time: string;
    reading: number;
    status: string;
    statusColor: [number, number, number];
    notes: string;
    sortKey: string;
  }[] = [];

  readings.forEach((r) => {
    if (r.reading !== null) {
      const status = getHealthStatus(r.reading, r.session);
      const colorConfig = getColorConfig(status);
      allEntries.push({
        date: r.date,
        session: r.session,
        time: format(new Date(r.updated_at), 'h:mm a'),
        reading: r.reading,
        status: colorConfig.label || '',
        statusColor: getStatusRGB(status),
        notes: r.notes || '',
        sortKey: `${r.date}-${r.updated_at}`,
      });
    }
  });

  retests.forEach((r) => {
    const status = getRetestHealthStatus(r.reading);
    const colorConfig = getColorConfig(status);
    allEntries.push({
      date: r.date,
      session: 'Retest',
      time: format(new Date(r.recorded_at), 'h:mm a'),
      reading: r.reading,
      status: colorConfig.label || '',
      statusColor: getStatusRGB(status),
      notes: r.notes || '',
      sortKey: `${r.date}-${r.recorded_at}`,
    });
  });

  // Sort by date and time
  allEntries.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  // Convert to table rows
  allEntries.forEach((entry) => {
    tableData.push([
      format(new Date(entry.date), 'MMM d'),
      entry.session,
      entry.time,
      String(entry.reading),
      {
        content: entry.status,
        styles: { fillColor: entry.statusColor },
      },
      entry.notes,
    ]);
  });

  // Add table
  autoTable(doc, {
    startY: 48,
    head: [['Date', 'Session', 'Time', 'Reading', 'Status', 'Notes']],
    body: tableData,
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 32 },
      2: { cellWidth: 20 },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    didParseCell: (data) => {
      // Apply status colors (column 4 is now Status)
      if (data.column.index === 4 && data.section === 'body') {
        const cellData = data.cell.raw as { styles?: { fillColor: [number, number, number] } };
        if (cellData && typeof cellData === 'object' && cellData.styles?.fillColor) {
          data.cell.styles.fillColor = cellData.styles.fillColor;
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Add legend at the bottom
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 200;
  
  if (finalY < 250) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Legend:', 14, finalY + 15);

    const legends: { label: string; color: [number, number, number] }[] = [
      { label: 'Severe Low (<55)', color: [59, 130, 246] },
      { label: 'Low (55-69)', color: [251, 146, 60] },
      { label: 'Normal', color: [34, 197, 94] },
      { label: 'Elevated', color: [250, 204, 21] },
      { label: 'High (≥200)', color: [239, 68, 68] },
    ];

    let xPos = 14;
    legends.forEach((legend) => {
      doc.setFillColor(legend.color[0], legend.color[1], legend.color[2]);
      doc.rect(xPos, finalY + 20, 8, 4, 'F');
      doc.setTextColor(60, 60, 60);
      doc.text(legend.label, xPos + 10, finalY + 23);
      xPos += 38;
    });
  }

  // Save the PDF
  doc.save(`${filename}.pdf`);
}

function getStatusRGB(status: string): [number, number, number] {
  switch (status) {
    case 'severe-low':
      return [59, 130, 246]; // Blue
    case 'low':
      return [251, 146, 60]; // Orange
    case 'normal':
      return [34, 197, 94]; // Green
    case 'elevated':
      return [250, 204, 21]; // Yellow
    case 'high':
      return [239, 68, 68]; // Red
    default:
      return [156, 163, 175]; // Gray
  }
}
