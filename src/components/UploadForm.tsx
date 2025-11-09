import { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface UploadFormProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function UploadForm({ onUpload, isLoading }: UploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndUpload = (file: File) => {
    setError(null);

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndUpload(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-colors p-8 text-center cursor-pointer ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          disabled={isLoading}
          className="hidden"
        />

        <Upload className={`mx-auto mb-3 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} size={32} />
        <p className="text-lg font-semibold text-gray-900 mb-1">Drop your CSV file here</p>
        <p className="text-sm text-gray-500 mb-3">or click to select a file</p>

        <div className="text-xs text-gray-400 space-y-1">
          <p>Supported format: CSV</p>
          <p>Required columns: Year, Course, Total_Seats, Seats_Filled</p>
          <p>Optional columns: Vacant_Seats, Avg_Exam_Cost, Student_Stress_Index</p>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-2" />
              <p className="text-sm font-medium text-gray-700">Analyzing...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
