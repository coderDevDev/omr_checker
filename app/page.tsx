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
        console.log('Backend offline, using static template fallback');
        setBackendStatus('offline');

        // Load static template as fallback
        try {
          const staticTemplate = await fetch('/inputs/current_template.json');
          if (staticTemplate.ok) {
            const templateData = await staticTemplate.json();
            setTemplateInfo(templateData);
            setCurrentTemplate(templateData);
            setTemplateLoaded(true);
            console.log('Static template loaded as fallback');
          }
        } catch (fallbackError) {
          console.log('Static template fallback failed:', fallbackError);
        }
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
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred'
      };
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
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred'
      };
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
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred'
      };
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
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-800 mb-2">
                    Backend Service Offline - Using Static Template
                  </h3>
                  <p className="text-yellow-700 mb-3">
                    The OMR processing backend is currently unavailable. Using
                    static template fallback for camera overlay and demo
                    purposes.
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-yellow-200">
                    <div className="space-y-2">
                      <p className="text-sm text-yellow-600 font-medium">
                        ✅ <strong>Available:</strong> Camera capture with
                        template overlay
                      </p>
                      <p className="text-sm text-yellow-600 font-medium">
                        ❌ <strong>Unavailable:</strong> OMR processing and
                        results
                      </p>
                      <p className="text-sm text-yellow-600 font-medium">
                        💡 <strong>Tip:</strong> Deploy backend to enable full
                        functionality
                      </p>
                    </div>
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
