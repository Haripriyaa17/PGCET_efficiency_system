import { PGCETData } from './csvParser';

export interface AnalysisResult {
  efficiencyScore: number;
  verdict: 'Efficient' | 'Moderately Efficient' | 'Not Efficient';
  reasons: string[];
  courseStats: CourseStats[];
  yearStats: YearStats[];
  metrics: EfficiencyMetrics;
}

export interface CourseStats {
  course: string;
  totalSeats: number;
  seatsFilled: number;
  fillPercentage: number;
  vacancyRate: number;
}

export interface YearStats {
  year: number;
  avgFillPercentage: number;
  totalSeats: number;
  totalFilled: number;
  vacantSeats: number;
}

export interface EfficiencyMetrics {
  overallFillRate: number;
  overallVacancyRate: number;
  avgExamCost: number;
  avgStressIndex: number;
  yearOverYearTrend: number;
}

export function analyzeEfficiency(data: PGCETData[]): AnalysisResult {
  if (data.length === 0) {
    throw new Error('No data to analyze');
  }

  const courseStats = calculateCourseStats(data);
  const yearStats = calculateYearStats(data);
  const metrics = calculateMetrics(data, yearStats);
  const reasons = generateReasons(data, metrics, courseStats);
  const efficiencyScore = calculateEfficiencyScore(metrics, courseStats);
  const verdict = getVerdict(efficiencyScore);

  return {
    efficiencyScore,
    verdict,
    reasons,
    courseStats,
    yearStats,
    metrics,
  };
}

function calculateCourseStats(data: PGCETData[]): CourseStats[] {
  const courseMap = new Map<string, { total: number; filled: number }>();

  data.forEach(record => {
    const key = record.course;
    if (!courseMap.has(key)) {
      courseMap.set(key, { total: 0, filled: 0 });
    }
    const current = courseMap.get(key)!;
    current.total += record.totalSeats;
    current.filled += record.seatsFilled;
  });

  return Array.from(courseMap.entries()).map(([course, { total, filled }]) => ({
    course,
    totalSeats: total,
    seatsFilled: filled,
    fillPercentage: (filled / total) * 100,
    vacancyRate: ((total - filled) / total) * 100,
  }));
}

function calculateYearStats(data: PGCETData[]): YearStats[] {
  const yearMap = new Map<number, { records: PGCETData[] }>();

  data.forEach(record => {
    if (!yearMap.has(record.year)) {
      yearMap.set(record.year, { records: [] });
    }
    yearMap.get(record.year)!.records.push(record);
  });

  return Array.from(yearMap.entries())
    .map(([year, { records }]) => {
      const totalSeats = records.reduce((sum, r) => sum + r.totalSeats, 0);
      const totalFilled = records.reduce((sum, r) => sum + r.seatsFilled, 0);
      const vacantSeats = records.reduce((sum, r) => sum + r.vacantSeats, 0);

      return {
        year,
        avgFillPercentage: (totalFilled / totalSeats) * 100,
        totalSeats,
        totalFilled,
        vacantSeats,
      };
    })
    .sort((a, b) => a.year - b.year);
}

function calculateMetrics(data: PGCETData[], yearStats: YearStats[]): EfficiencyMetrics {
  const totalSeats = data.reduce((sum, r) => sum + r.totalSeats, 0);
  const totalFilled = data.reduce((sum, r) => sum + r.seatsFilled, 0);
  const overallFillRate = (totalFilled / totalSeats) * 100;
  const overallVacancyRate = 100 - overallFillRate;

  const avgExamCost = data.filter(r => r.avgExamCost).length > 0
    ? data.reduce((sum, r) => sum + (r.avgExamCost || 0), 0) / data.filter(r => r.avgExamCost).length
    : 0;

  const avgStressIndex = data.filter(r => r.studentStressIndex).length > 0
    ? data.reduce((sum, r) => sum + (r.studentStressIndex || 0), 0) / data.filter(r => r.studentStressIndex).length
    : 0;

  let yearOverYearTrend = 0;
  if (yearStats.length >= 2) {
    const firstYear = yearStats[0].avgFillPercentage;
    const lastYear = yearStats[yearStats.length - 1].avgFillPercentage;
    yearOverYearTrend = lastYear - firstYear;
  }

  return {
    overallFillRate,
    overallVacancyRate,
    avgExamCost,
    avgStressIndex,
    yearOverYearTrend,
  };
}

function generateReasons(data: PGCETData[], metrics: EfficiencyMetrics, courseStats: CourseStats[]): string[] {
  const reasons: string[] = [];

  if (metrics.overallVacancyRate > 30) {
    reasons.push(`High seat vacancy: ${metrics.overallVacancyRate.toFixed(1)}% seats remain unfilled`);
  }

  if (metrics.overallVacancyRate > 20 && metrics.overallVacancyRate <= 30) {
    reasons.push(`Moderate seat vacancy: ${metrics.overallVacancyRate.toFixed(1)}% of seats are vacant`);
  }

  const highVacancyCourses = courseStats.filter(c => c.vacancyRate > 35);
  if (highVacancyCourses.length > 0) {
    reasons.push(`Courses with low demand: ${highVacancyCourses.map(c => c.course).join(', ')}`);
  }

  if (metrics.avgExamCost > 5000) {
    reasons.push(`High examination costs (₹${metrics.avgExamCost.toFixed(0)}) may deter students`);
  }

  if (metrics.avgStressIndex > 0.7) {
    reasons.push(`High student stress index (${metrics.avgStressIndex.toFixed(2)}/1.0) affecting participation`);
  }

  if (metrics.yearOverYearTrend < -5) {
    reasons.push(`Declining trend: Seat fill rate dropped by ${Math.abs(metrics.yearOverYearTrend).toFixed(1)}% year-over-year`);
  }

  if (metrics.overallFillRate >= 85 && reasons.length === 0) {
    reasons.push('System is performing well with good seat utilization');
  }

  return reasons;
}

function calculateEfficiencyScore(metrics: EfficiencyMetrics, courseStats: CourseStats[]): number {
  let score = 100;

  score -= metrics.overallVacancyRate * 0.8;
  score -= Math.max(0, metrics.avgExamCost - 3000) / 100;
  score -= Math.max(0, metrics.avgStressIndex - 0.5) * 20;

  if (metrics.yearOverYearTrend < 0) {
    score -= Math.abs(metrics.yearOverYearTrend) * 2;
  }

  const coursesWithLowFill = courseStats.filter(c => c.fillPercentage < 70).length;
  score -= coursesWithLowFill * 5;

  return Math.max(0, Math.min(100, score));
}

function getVerdict(score: number): 'Efficient' | 'Moderately Efficient' | 'Not Efficient' {
  if (score >= 75) return 'Efficient';
  if (score >= 60) return 'Moderately Efficient';
  return 'Not Efficient';
}
