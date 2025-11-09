export interface PGCETData {
  year: number;
  course: string;
  totalSeats: number;
  seatsFilled: number;
  vacantSeats: number;
  avgExamCost?: number;
  studentStressIndex?: number;
}

export function parseCSV(fileContent: string): PGCETData[] {
  const lines = fileContent.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());

  const yearIdx = header.findIndex(h => h.includes('year'));
  const courseIdx = header.findIndex(h => h.includes('course'));
  const totalIdx = header.findIndex(h => h.includes('total') && h.includes('seat'));
  const filledIdx = header.findIndex(h => h.includes('fill'));
  const vacantIdx = header.findIndex(h => h.includes('vacant'));
  const costIdx = header.findIndex(h => h.includes('exam') && h.includes('cost'));
  const stressIdx = header.findIndex(h => h.includes('stress'));

  if (yearIdx === -1 || courseIdx === -1 || totalIdx === -1 || filledIdx === -1) {
    throw new Error('CSV must contain: Year, Course, Total_Seats, Seats_Filled columns');
  }

  const data: PGCETData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length === 1 && values[0] === '') continue;

    try {
      const year = parseInt(values[yearIdx]);
      const totalSeats = parseInt(values[totalIdx]);
      const seatsFilled = parseInt(values[filledIdx]);
      const vacantSeats = vacantIdx !== -1 ? parseInt(values[vacantIdx]) : totalSeats - seatsFilled;

      if (isNaN(year) || isNaN(totalSeats) || isNaN(seatsFilled)) {
        throw new Error(`Invalid numeric data in row ${i + 1}`);
      }

      data.push({
        year,
        course: values[courseIdx],
        totalSeats,
        seatsFilled,
        vacantSeats,
        avgExamCost: costIdx !== -1 ? parseFloat(values[costIdx]) : undefined,
        studentStressIndex: stressIdx !== -1 ? parseFloat(values[stressIdx]) : undefined,
      });
    } catch (error) {
      console.warn(`Skipping invalid row ${i + 1}`);
    }
  }

  return data;
}
