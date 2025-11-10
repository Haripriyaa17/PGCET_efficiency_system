import { AnalysisResult } from '../utils/mlAnalysis';
import { CourseChart, YearTrendChart, VacancyDistributionChart } from './Charts';
import { AlertCircle, CheckCircle, TrendingDown, AlertTriangle } from 'lucide-react';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const getVerdictIcon = () => {
    switch (result.verdict) {
      case 'Efficient':
        return <CheckCircle className="text-green-600" size={28} />;
      case 'Moderately Efficient':
        return <AlertTriangle className="text-yellow-600" size={28} />;
      default:
        return <AlertCircle className="text-red-600" size={28} />;
    }
  };

  const getVerdictColor = () => {
    switch (result.verdict) {
      case 'Efficient':
        return 'bg-green-50 border-green-200';
      case 'Moderately Efficient':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getScoreColor = () => {
    if (result.efficiencyScore >= 75) return 'text-green-600';
    if (result.efficiencyScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = () => {
    if (result.efficiencyScore >= 75) return 'bg-green-100';
    if (result.efficiencyScore >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with verdict */}
        <div className={`rounded-lg border-2 p-8 mb-8 ${getVerdictColor()}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {getVerdictIcon()}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PGCET Efficiency Analysis</h1>
                <p className="text-gray-600 mt-1">System Performance Report</p>
              </div>
            </div>
            <button
              onClick={onReset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Upload New File
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Efficiency Score */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-600 mb-2">Efficiency Score</p>
              <div className={`inline-block px-4 py-2 rounded-lg ${getScoreBg()}`}>
                <span className={`text-4xl font-bold ${getScoreColor()}`}>
                  {result.efficiencyScore.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Verdict */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-600 mb-2">Verdict</p>
              <p className={`text-2xl font-bold ${
                result.verdict === 'Efficient' ? 'text-green-600' :
                result.verdict === 'Moderately Efficient' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {result.verdict}
              </p>
            </div>

            {/* Fill Rate */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-600 mb-2">Overall Fill Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {result.metrics.overallFillRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {result.metrics.overallVacancyRate.toFixed(1)}% vacant
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Year-over-Year Trend</p>
            <div className="flex items-center gap-2">
              {result.metrics.yearOverYearTrend >= 0 ? (
                <>
                  <TrendingDown className="text-green-600 rotate-180" size={24} />
                  <span className="text-2xl font-bold text-green-600">
                    +{result.metrics.yearOverYearTrend.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="text-red-600" size={24} />
                  <span className="text-2xl font-bold text-red-600">
                    {result.metrics.yearOverYearTrend.toFixed(1)}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">System Status</p>
            <p className="text-gray-700">
              {result.verdict === 'Efficient'
                ? '✓ System operating at optimal efficiency levels'
                : result.verdict === 'Moderately Efficient'
                ? '⚠ System requires optimization in key areas'
                : '✗ System needs significant improvements'}
            </p>
          </div>
        </div>

        {/* Reasons Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Findings</h2>
          <div className="space-y-3">
            {result.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  result.verdict === 'Efficient' ? 'bg-green-600' :
                  result.verdict === 'Moderately Efficient' ? 'bg-yellow-600' :
                  'bg-blue-600'
                }`}>
                  •
                </div>
                <p className="text-gray-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <VacancyDistributionChart data={result} />
          <CourseChart data={result} />
        </div>

        <div className="mb-8">
          <YearTrendChart data={result} />
        </div>

        {/* Summary Statistics Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Metric</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Total Courses Analyzed</td>
                  <td className="text-right py-3 px-4 font-medium text-gray-900">{result.courseStats.length}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Years Covered</td>
                  <td className="text-right py-3 px-4 font-medium text-gray-900">
                    {result.yearStats.length} ({result.yearStats[0]?.year} - {result.yearStats[result.yearStats.length - 1]?.year})
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Total Seats Analyzed</td>
                  <td className="text-right py-3 px-4 font-medium text-gray-900">
                    {result.yearStats.reduce((sum, y) => sum + y.totalSeats, 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Seats Filled</td>
                  <td className="text-right py-3 px-4 font-medium text-gray-900">
                    {result.yearStats.reduce((sum, y) => sum + y.totalFilled, 0).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Vacant Seats</td>
                  <td className="text-right py-3 px-4 font-medium text-red-600 font-bold">
                    {result.yearStats.reduce((sum, y) => sum + y.vacantSeats, 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Executive Summary */}
        <div className={`rounded-lg border-2 p-8 ${
          result.verdict === 'Efficient' ? 'bg-green-50 border-green-200' :
          result.verdict === 'Moderately Efficient' ? 'bg-blue-50 border-blue-200' :
          'bg-orange-50 border-orange-200'
        }`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Overall Assessment</h3>
              <p className="text-gray-700">
                {result.verdict === 'Efficient'
                  ? 'The PGCET system is functioning efficiently with strong seat utilization across courses. The current operational framework demonstrates effective management of seat allocation and course demand matching.'
                  : result.verdict === 'Moderately Efficient'
                  ? 'The PGCET system operates with moderate efficiency. While the core seat allocation system functions adequately, there are notable areas where improvements can enhance overall performance and resource utilization.'
                  : 'The PGCET system currently faces efficiency challenges that require strategic intervention. Significant improvements in seat management, course demand assessment, and capacity planning are recommended.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cost Optimization Recommendations</h3>
              <p className="text-gray-700">
                To optimize operational costs, consider the following strategies:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Streamline exam administration processes to reduce per-candidate costs</li>
                <li>Consolidate courses with low enrollment to eliminate redundancy</li>
                <li>Implement digital infrastructure to reduce infrastructure and venue costs</li>
                <li>Develop targeted marketing for undersubscribed programs to improve seat fill rates</li>
                <li>Review course capacity allocations based on historical demand patterns</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Key Recommendations</h3>
              <p className="text-gray-700">
                {result.verdict === 'Efficient'
                  ? 'Maintain current operational standards while exploring opportunities to further enhance student satisfaction and system responsiveness to market changes.'
                  : result.verdict === 'Moderately Efficient'
                  ? 'Address the identified inefficiencies through targeted interventions. Prioritize monitoring courses with declining demand and adjusting seat allocations accordingly.'
                  : 'Implement immediate corrective measures to address seat vacancy issues. Conduct comprehensive analysis of program demand and consider restructuring course offerings based on market requirements.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
