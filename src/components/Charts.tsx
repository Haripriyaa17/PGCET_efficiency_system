import { AnalysisResult } from '../utils/mlAnalysis';

export function CourseChart({ data }: { data: AnalysisResult }) {
  const chartData = data.courseStats
    .sort((a, b) => b.fillPercentage - a.fillPercentage)
    .map(course => ({
      name: course.course,
      fill: course.fillPercentage,
      vacancy: course.vacancyRate,
    }));

  const maxValue = Math.max(...chartData.map(d => d.fill));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Course-wise Seat Utilization</h3>
      <div className="space-y-4">
        {chartData.map(course => (
          <div key={course.name}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-700">{course.name}</span>
              <span className="text-sm font-semibold text-blue-600">{course.fill.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(course.fill / maxValue) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {course.vacancy.toFixed(1)}% vacant
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function YearTrendChart({ data }: { data: AnalysisResult }) {
  const chartData = data.yearStats;

  if (chartData.length < 2) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Year-wise Efficiency Trend</h3>
        <p className="text-gray-500">Insufficient data for trend analysis (need at least 2 years)</p>
      </div>
    );
  }

  const maxFill = Math.max(...chartData.map(d => d.avgFillPercentage));
  const minFill = Math.min(...chartData.map(d => d.avgFillPercentage));
  const range = maxFill - minFill || 1;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Year-wise Efficiency Trend</h3>
      <div className="flex items-end justify-between h-64 gap-2">
        {chartData.map((year, idx) => {
          const normalizedHeight = ((year.avgFillPercentage - minFill) / range) * 100 || 50;
          const isIncreasing = idx === 0 ? false : year.avgFillPercentage > chartData[idx - 1].avgFillPercentage;

          return (
            <div key={year.year} className="flex-1 flex flex-col items-center">
              <div className="relative w-full mb-2">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isIncreasing ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ height: `${normalizedHeight}%`, minHeight: '20px' }}
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{year.year}</div>
                <div className="text-xs font-medium text-gray-600">{year.avgFillPercentage.toFixed(1)}%</div>
              </div>
            </div>
          );
        })}
      </div>
      {data.metrics.yearOverYearTrend < 0 && (
        <p className="text-red-600 text-sm mt-4">
          Declining trend: {Math.abs(data.metrics.yearOverYearTrend).toFixed(1)}% decrease
        </p>
      )}
      {data.metrics.yearOverYearTrend > 0 && (
        <p className="text-green-600 text-sm mt-4">
          Improving trend: {data.metrics.yearOverYearTrend.toFixed(1)}% increase
        </p>
      )}
    </div>
  );
}

export function VacancyDistributionChart({ data }: { data: AnalysisResult }) {
  const filled = data.metrics.overallFillRate;
  const vacant = data.metrics.overallVacancyRate;

  const getColor = (rate: number) => {
    if (rate >= 85) return 'from-green-400 to-green-600';
    if (rate >= 70) return 'from-blue-400 to-blue-600';
    if (rate >= 50) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Overall Seat Distribution</h3>
      <div className="flex items-center justify-center gap-8">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={`${(filled / 100) * 282.6} 282.6`}
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(96, 165, 250)" />
                  <stop offset="100%" stopColor="rgb(37, 99, 235)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{filled.toFixed(1)}%</div>
                <div className="text-xs text-gray-600">Filled</div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{filled.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Seats Filled</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-red-500 mb-2">{vacant.toFixed(1)}%</div>
          <div className="text-sm text-gray-600 text-center">Vacant Seats</div>
          {vacant > 20 && (
            <div className="mt-3 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              High Vacancy
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
