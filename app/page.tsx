'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import TemplateUpload from '@/components/TemplateUpload';
import ImageUpload from '@/components/ImageUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import ProcessingStatus from '@/components/ProcessingStatus';
import LoadingSpinner from '@/components/LoadingSpinner';
import LayoutEditor from '@/components/LayoutEditor';
import {
  processOMRImage,
  uploadTemplate,
  batchProcessOMR,
  healthCheck
} from '@/services/api';

// Dynamically import heavy components to improve initial load time
const ResultsDisplayDynamic = dynamic(
  () => import('@/components/ResultsDisplay'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export default function HomePage() {
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [templateInfo, setTemplateInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [backendStatus, setBackendStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking');
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await healthCheck();
        setBackendStatus('online');
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    checkBackendHealth();
  }, []);

  const handleTemplateUpload = useCallback(async (templateFile: File) => {
    try {
      setProcessing(true);
      setProcessingProgress(0);

      const response = await uploadTemplate(templateFile);
      setTemplateInfo(response.template);
      setCurrentTemplate(response.template);
      setTemplateLoaded(true);
      setProcessingProgress(100);

      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setProcessing(false);
      setProcessingProgress(0);
    }
  }, []);

  const handleSingleImageProcess = useCallback(async (imageFile: File) => {
    try {
      setProcessing(true);
      setProcessingProgress(50);

      const response = await processOMRImage(imageFile);
      setResults([response.results]);
      setProcessingProgress(100);

      return { success: true, message: 'Image processed successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setProcessing(false);
      setProcessingProgress(0);
    }
  }, []);

  const handleBatchProcess = useCallback(async (imageFiles: File[]) => {
    try {
      setProcessing(true);
      setProcessingProgress(0);

      const response = await batchProcessOMR(imageFiles);
      setResults(response.results);
      setProcessingProgress(100);

      return {
        success: true,
        message: `Processed ${response.total_processed} images successfully`
      };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setProcessing(false);
      setProcessingProgress(0);
    }
  }, []);

  const resetApplication = useCallback(() => {
    setTemplateLoaded(false);
    setTemplateInfo(null);
    setCurrentTemplate(null);
    setResults(null);
    setProcessing(false);
    setProcessingProgress(0);
    setShowLayoutEditor(false);
  }, []);

  const handleOpenLayoutEditor = useCallback(() => {
    setShowLayoutEditor(true);
  }, []);

  const handleSaveLayout = useCallback((newTemplate: any) => {
    setCurrentTemplate(newTemplate);
    setTemplateInfo(newTemplate);
    setShowLayoutEditor(false);
    toast.success('Layout updated successfully!');
  }, []);

  const handleCloseLayoutEditor = useCallback(() => {
    setShowLayoutEditor(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <Header backendStatus={backendStatus} onReset={resetApplication} />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Backend Status Alert */}
          {backendStatus === 'offline' && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 p-2 rounded-full">
                    <svg
                      className="h-6 w-6 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-800 mb-2">
                    Backend Service Offline
                  </h3>
                  <p className="text-red-700 mb-3">
                    The OMR processing backend is currently unavailable. Please
                    check your connection and try again.
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium">
                      💡 Tip: Make sure the Flask backend is running on port
                      5000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Template Upload Section */}
          <div className="animate-fade-in">
            <TemplateUpload
              onTemplateUpload={handleTemplateUpload}
              processing={processing}
              templateLoaded={templateLoaded}
              templateInfo={templateInfo}
              backendStatus={backendStatus}
              onOpenLayoutEditor={handleOpenLayoutEditor}
            />
          </div>

          {/* Image Upload and Processing Section */}
          {templateLoaded && (
            <div className="animate-slide-up">
              <ImageUpload
                onSingleProcess={handleSingleImageProcess}
                onBatchProcess={handleBatchProcess}
                processing={processing}
                backendStatus={backendStatus}
                template={currentTemplate}
              />
            </div>
          )}

          {/* Processing Status */}
          {processing && (
            <div className="animate-slide-up">
              <ProcessingStatus progress={processingProgress} />
            </div>
          )}

          {/* Results Display */}
          {results && results.length > 0 && (
            <div className="animate-slide-up">
              <ResultsDisplayDynamic results={results} />
            </div>
          )}

          {/* Empty State */}
          {!templateLoaded && !processing && backendStatus === 'online' && (
            <div className="text-center py-12 sm:py-16">
              <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 mb-8">
                  <div className="mx-auto h-20 w-20 text-blue-500 mb-4">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="w-full h-full">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Ready to Start Processing
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Upload your OMR template to begin processing OMR sheets with
                    high accuracy and speed.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="bg-blue-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mb-2">
                      1
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Upload Template
                    </h4>
                    <p className="text-sm text-gray-600">
                      Upload your OMR sheet template JSON file
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <div className="bg-purple-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mb-2">
                      2
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Add Images
                    </h4>
                    <p className="text-sm text-gray-600">
                      Upload OMR sheet images for processing
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="bg-green-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mb-2">
                      3
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Get Results
                    </h4>
                    <p className="text-sm text-gray-600">
                      View detailed analysis and export data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Layout Editor Modal */}
      {showLayoutEditor && (
        <LayoutEditor
          initialTemplate={currentTemplate}
          onSave={handleSaveLayout}
          onCancel={handleCloseLayoutEditor}
        />
      )}
    </div>
  );
}
