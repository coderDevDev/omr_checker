'use client';

import React, { useState, useEffect } from 'react';
import { Camera, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CameraCapture from '@/components/CameraCapture';

export default function CameraOverlayTestPage() {
  const [template, setTemplate] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  // Load static template
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch('/inputs/current_template.json');
        if (response.ok) {
          const templateData = await response.json();
          setTemplate(templateData);
          console.log('Template loaded:', templateData);
        }
      } catch (error) {
        console.error('Failed to load template:', error);
      }
    };

    loadTemplate();
  }, []);

  const handleCapture = (imageFile: File) => {
    console.log('Image captured:', imageFile);
    alert(`Image captured: ${imageFile.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-3">
              <Camera className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Camera Overlay Test
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Template Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Template Status
            </h2>
            {template ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">
                    Template loaded successfully
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        Page Dimensions:
                      </span>
                      <p className="text-gray-900">
                        {template.pageDimensions?.[0]} ×{' '}
                        {template.pageDimensions?.[1]}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Bubble Dimensions:
                      </span>
                      <p className="text-gray-900">
                        {template.bubbleDimensions?.[0]} ×{' '}
                        {template.bubbleDimensions?.[1]}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Field Blocks:
                      </span>
                      <p className="text-gray-900">
                        {Object.keys(template.fieldBlocks || {}).length} columns
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Total Questions:
                      </span>
                      <p className="text-gray-900">
                        {Object.values(template.fieldBlocks || {}).reduce(
                          (total, block: any) =>
                            total + (block.bubbleCount || 0),
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">
                  Template not loaded
                </span>
              </div>
            )}
          </div>

          {/* Camera Test */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Camera Overlay Test
            </h2>
            <p className="text-gray-600 mb-6">
              Test the camera capture functionality with template overlay. The
              overlay should show:
            </p>

            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li>• Green border around the OMR sheet area</li>
              <li>• 5 columns (Column1 to Column5)</li>
              <li>• 20 questions per column (Q1-Q20, Q21-Q40, etc.)</li>
              <li>• Bubble options A, B, C, D for each question</li>
              <li>• Corner markers for alignment</li>
              <li>• Alignment quality indicator</li>
            </ul>

            <button
              onClick={() => setShowCamera(true)}
              disabled={!template}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                template
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}>
              <Camera className="h-6 w-6" />
              <span>
                {template ? 'Test Camera Overlay' : 'Loading Template...'}
              </span>
            </button>

            {!template && (
              <p className="text-sm text-gray-500 mt-2">
                Please wait for template to load...
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-2xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Testing Instructions
            </h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <p>Click "Test Camera Overlay" to open the camera interface</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>Allow camera permissions when prompted</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  Look for the green template overlay with 5 columns and bubbles
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <p>
                  Test the capture functionality (images won't be processed
                  without backend)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Camera Modal */}
      {showCamera && template && (
        <CameraCapture
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={handleCapture}
          template={template}
        />
      )}
    </div>
  );
}
