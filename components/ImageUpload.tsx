'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Image as ImageIcon,
  FolderOpen,
  Camera,
  Loader,
  Lock,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import CameraCapture from './CameraCapture';

interface ImageUploadProps {
  onSingleProcess: (
    file: File
  ) => Promise<{ success: boolean; message: string }>;
  onBatchProcess: (
    files: File[]
  ) => Promise<{ success: boolean; message: string }>;
  processing: boolean;
  backendStatus: 'checking' | 'online' | 'offline';
  template?: {
    pageDimensions: [number, number];
    bubbleDimensions: [number, number];
    fieldBlocks: Record<string, any>;
  };
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onSingleProcess,
  onBatchProcess,
  processing,
  backendStatus,
  template
}) => {
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single');
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);

      try {
        if (uploadMode === 'single' && acceptedFiles.length === 1) {
          const result = await onSingleProcess(acceptedFiles[0]);

          if (result.success) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        } else if (uploadMode === 'batch') {
          const result = await onBatchProcess(acceptedFiles);

          if (result.success) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        } else {
          toast.error(
            'Please select only one image for single mode or multiple images for batch mode'
          );
        }
      } catch (error) {
        toast.error('Image processing failed');
      } finally {
        setUploading(false);
      }
    },
    [onSingleProcess, onBatchProcess, uploadMode]
  );

  const handleCameraCapture = useCallback(
    async (capturedFile: File) => {
      setUploading(true);
      try {
        const result = await onSingleProcess(capturedFile);
        if (result.success) {
          toast.success('Captured and processed successfully!');
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Camera capture processing failed');
      } finally {
        setUploading(false);
      }
    },
    [onSingleProcess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: uploadMode === 'batch',
    disabled: processing || uploading || backendStatus !== 'online'
  });

  const isDisabled = processing || uploading || backendStatus !== 'online';

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-6 py-8">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4">
            <Camera className="h-6 w-6 text-white" />
          </div>
          OMR Image Processing
        </h2>
        <p className="text-purple-100 text-sm mt-2">
          Upload and process your OMR sheet images
        </p>
      </div>

      <div className="p-6">
        {/* Upload Mode Selection */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-800 mb-4">
            Processing Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setUploadMode('single')}
              disabled={isDisabled}
              className={`
                flex items-center justify-center px-6 py-4 rounded-2xl border-2 transition-all duration-200 font-medium
                ${
                  uploadMode === 'single'
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg transform scale-105'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                }
                ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-md'
                }
              `}>
              <ImageIcon className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Single Image</div>
                <div className="text-xs opacity-75">Process one OMR sheet</div>
              </div>
            </button>
            <button
              onClick={() => setUploadMode('batch')}
              disabled={isDisabled}
              className={`
                flex items-center justify-center px-6 py-4 rounded-2xl border-2 transition-all duration-200 font-medium
                ${
                  uploadMode === 'batch'
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg transform scale-105'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                }
                ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-md'
                }
              `}>
              <FolderOpen className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Batch Processing</div>
                <div className="text-xs opacity-75">
                  Process multiple sheets
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer
            ${
              isDragActive
                ? 'border-purple-400 bg-purple-50 scale-105'
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
            }
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${backendStatus === 'offline' ? 'border-red-300 bg-red-50' : ''}
          `}>
          <input {...getInputProps()} />

          {backendStatus === 'offline' ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-red-100 p-4 rounded-full">
                <Lock className="h-12 w-12 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-semibold text-red-700 mb-2">
                  Backend Offline
                </p>
                <p className="text-sm text-red-600">
                  Cannot process images while backend is offline
                </p>
              </div>
            </div>
          ) : uploading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <Loader className="h-12 w-12 text-purple-600 animate-spin" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  Processing Images...
                </p>
                <p className="text-sm text-gray-600">
                  Please wait while we analyze your OMR sheets
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div
                className={`p-4 rounded-full transition-colors duration-300 ${
                  isDragActive ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                <Upload
                  className={`h-12 w-12 transition-colors duration-300 ${
                    isDragActive ? 'text-purple-600' : 'text-gray-400'
                  }`}
                />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  {isDragActive
                    ? `Drop ${
                        uploadMode === 'single' ? 'image' : 'images'
                      } here`
                    : `Upload ${
                        uploadMode === 'single' ? 'Single' : 'Multiple'
                      } OMR Images`}
                </p>
                <p className="text-gray-600 mb-2">
                  {uploadMode === 'single'
                    ? 'Drag & drop one OMR image, or click to select'
                    : 'Drag & drop multiple OMR images, or click to select'}
                </p>
                <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg inline-block">
                  Supported formats: PNG, JPG, JPEG
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Camera Capture Button */}
        {uploadMode === 'single' && template && (
          <div className="mt-6 text-center">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Mobile Camera Capture
                  </h3>
                  <p className="text-sm text-gray-600">
                    Use your device camera with template alignment
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCamera(true)}
                disabled={isDisabled}
                className={`
                  inline-flex items-center space-x-3 bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-green-700'
                  }
                `}>
                <Camera className="h-6 w-6" />
                <span>Capture with Camera</span>
              </button>

              <div className="mt-4 text-sm text-gray-600">
                <p className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Real-time template overlay for perfect alignment</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-blue-600" />
            Upload Tips for Best Results
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-800">Good Lighting</p>
                  <p className="text-sm text-gray-600">
                    Ensure minimal shadows on the OMR sheet
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-800">Steady Camera</p>
                  <p className="text-sm text-gray-600">
                    Keep the device steady to avoid blur
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-800">Clear Bubbles</p>
                  <p className="text-sm text-gray-600">
                    Make sure all bubbles are clearly visible
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-800">High Resolution</p>
                  <p className="text-sm text-gray-600">
                    Scan at 300 DPI or higher for best results
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  5
                </div>
                <div>
                  <p className="font-medium text-gray-800">Flat Surface</p>
                  <p className="text-sm text-gray-600">
                    Avoid extreme angles - keep sheet flat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Status */}
        {processing && (
          <div className="mt-6 flex items-center justify-center bg-purple-50 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
              <div>
                <p className="text-purple-800 font-medium">
                  Processing OMR sheets...
                </p>
                <p className="text-purple-600 text-sm">
                  Analyzing and detecting responses
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
        template={template}
      />
    </div>
  );
};

export default ImageUpload;
