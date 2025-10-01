'use client';

import React from 'react';
import { Loader, CheckCircle } from 'lucide-react';

interface ProcessingStatusProps {
  progress: number;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ progress }) => {
  const getProgressMessage = (progress: number) => {
    if (progress < 25) return 'Initializing processing...';
    if (progress < 50) return 'Analyzing image...';
    if (progress < 75) return 'Detecting bubbles...';
    if (progress < 100) return 'Finalizing results...';
    return 'Processing complete!';
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-blue-500';
    if (progress < 50) return 'bg-indigo-500';
    if (progress < 75) return 'bg-purple-500';
    if (progress < 100) return 'bg-pink-500';
    return 'bg-green-500';
  };

  const steps = [
    { step: 'Upload', threshold: 25, description: 'Uploading files' },
    { step: 'Analyze', threshold: 50, description: 'Analyzing images' },
    { step: 'Detect', threshold: 75, description: 'Detecting bubbles' },
    { step: 'Complete', threshold: 100, description: 'Finalizing results' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              {progress < 100 ? (
                <Loader className="h-6 w-6 text-white animate-spin" />
              ) : (
                <CheckCircle className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Processing Status
              </h3>
              <p className="text-orange-100 text-sm">
                {progress < 100
                  ? 'Analyzing your OMR sheets'
                  : 'Processing complete!'}
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            <span className="text-2xl font-bold text-white">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-gray-100 rounded-2xl p-6">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out shadow-lg ${getProgressColor(
                  progress
                )}`}
                style={{ width: `${progress}%` }}></div>
            </div>

            {/* Status Message */}
            <div className="text-center mt-4">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                {getProgressMessage(progress)}
              </p>
              {progress < 100 && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}></div>
                  <div
                    className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          </div>

          {/* Processing Steps */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map(({ step, threshold, description }) => (
              <div
                key={step}
                className={`
                  p-4 rounded-2xl text-center transition-all duration-300 border-2
                  ${
                    progress >= threshold
                      ? 'bg-green-100 text-green-800 border-green-300 shadow-lg transform scale-105'
                      : progress >= threshold - 25
                      ? 'bg-orange-100 text-orange-800 border-orange-300 shadow-md'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }
                `}>
                <div className="font-bold text-sm mb-2">{step}</div>
                <div className="text-xs mb-3 opacity-75">{description}</div>
                {progress >= threshold ? (
                  <CheckCircle className="h-5 w-5 mx-auto text-green-600" />
                ) : progress >= threshold - 25 ? (
                  <div className="w-5 h-5 mx-auto bg-orange-300 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-5 h-5 mx-auto bg-gray-300 rounded-full"></div>
                )}
              </div>
            ))}
          </div>

          {/* Performance Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-4 text-center">
              Performance Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-semibold">
                    Processing Speed:
                  </span>
                  <span className="text-blue-600 font-bold">
                    ~200 OMRs/minute
                  </span>
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  Optimized for speed
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-semibold">
                    Accuracy Rate:
                  </span>
                  <span className="text-blue-600 font-bold">
                    99%+ on quality images
                  </span>
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  AI-powered detection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
