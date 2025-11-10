import { useState } from 'react';
import { UploadForm } from './components/UploadForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { parseCSV } from './utils/csvParser';
import { analyzeEfficiency, AnalysisResult } from './utils/mlAnalysis';
import { BarChart3 } from 'lucide-react';

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const content = await file.text();
      const data = parseCSV(content);
      const analysis = analyzeEfficiency(data);
      setResult(analysis);
    } catch (error) {
      alert(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return <ResultsDashboard result={result} onReset={() => setResult(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={40} />
            <h1 className="text-4xl font-bold">PGCET Efficiency Analyzer</h1>
          </div>
          <p className="text-lg text-blue-100 max-w-2xl">
            Analyze postgraduate course seat utilization trends using machine learning to identify inefficiencies and improve system performance
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Data</h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file with historical PGCET seat data to analyze system efficiency
          </p>
          <UploadForm onUpload={handleFileUpload} isLoading={isLoading} />

          {/* Example Data Format */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">CSV Format Example</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-700 overflow-x-auto">
              <div>Year,Course,Total_Seats,Seats_Filled,Vacant_Seats</div>
              <div>2021,MCA,7144,5623,1521</div>
              <div>2022,MBA,8000,6400,1600</div>
              <div>2023,MTech,6000,4200,1800</div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              <strong>Required:</strong> Year, Course, Total_Seats, Seats_Filled<br />
              <strong>Optional:</strong> Vacant_Seats (calculated automatically if not provided)
            </p>
          </div>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Analysis Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 text-blue-600 font-bold">
                    ✓
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Efficiency Score</p>
                  <p className="text-sm text-gray-600">0-100% rating system</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 text-blue-600 font-bold">
                    ✓
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Trend Analysis</p>
                  <p className="text-sm text-gray-600">Year-over-year changes</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 text-blue-600 font-bold">
                    ✓
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Course Analysis</p>
                  <p className="text-sm text-gray-600">Seat utilization by course</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 text-blue-600 font-bold">
                    ✓
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Root Cause Detection</p>
                  <p className="text-sm text-gray-600">Identifies inefficiency reasons</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 py-6 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          <p>PGCET Efficiency Analyzer • Powered by Machine Learning Analysis</p>
        </div>
      </div>
    </div>
  );
}

export default App;
