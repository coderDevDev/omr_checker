'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Lock,
  Settings,
  Edit3,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { openPythonLayoutEditor } from '@/services/api';

interface TemplateUploadProps {
  onTemplateUpload: (
    file: File
  ) => Promise<{ success: boolean; message: string }>;
  processing: boolean;
  templateLoaded: boolean;
  templateInfo: any;
  backendStatus: 'checking' | 'online' | 'offline';
  onOpenLayoutEditor?: () => void;
}

const TemplateUpload: React.FC<TemplateUploadProps> = ({
  onTemplateUpload,
  processing,
  templateLoaded,
  templateInfo,
  backendStatus,
  onOpenLayoutEditor
}) => {
  const [uploading, setUploading] = useState(false);
  const [openingPythonEditor, setOpeningPythonEditor] = useState(false);

  const handleOpenPythonLayoutEditor = useCallback(async () => {
    setOpeningPythonEditor(true);
    try {
      const result = await openPythonLayoutEditor();
      toast.success('Python layout editor opened successfully!');
      return { success: true, message: result.message };
    } catch (error) {
      toast.error(error.message || 'Failed to open Python layout editor');
      return { success: false, message: error.message };
    } finally {
      setOpeningPythonEditor(false);
    }
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const templateFile = acceptedFiles[0];
      setUploading(true);

      try {
        const result = await onTemplateUpload(templateFile);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Template upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onTemplateUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1,
    disabled: processing || uploading || backendStatus !== 'online'
  });

  const isDisabled = processing || uploading || backendStatus !== 'online';

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-8">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4">
            <FileText className="h-6 w-6 text-white" />
          </div>
          OMR Template Configuration
        </h2>
        <p className="text-green-100 text-sm mt-2">
          Upload your OMR sheet template to get started
        </p>
      </div>

      <div className="p-6">
        {!templateLoaded ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer
              ${
                isDragActive
                  ? 'border-green-400 bg-green-50 scale-105'
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
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
                    Cannot upload template while backend is offline
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`p-4 rounded-full transition-colors duration-300 ${
                    isDragActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                  <Upload
                    className={`h-12 w-12 transition-colors duration-300 ${
                      isDragActive ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-800 mb-2">
                    {isDragActive
                      ? 'Drop template file here'
                      : 'Upload OMR Template'}
                  </p>
                  <p className="text-gray-600 mb-2">
                    Drag & drop a template.json file, or click to select
                  </p>
                  <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg inline-block">
                    Template file should define the OMR sheet layout and field
                    configuration
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 p-2 rounded-full mr-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-800">
                  Template Loaded Successfully
                </h3>
              </div>
              <p className="text-green-700">
                Your OMR template is ready for processing images
              </p>
            </div>

            {/* Template Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Template Information
                </h4>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <span className="text-sm text-gray-600 block mb-1">
                      Page Dimensions
                    </span>
                    <span className="font-bold text-lg text-gray-900">
                      {templateInfo?.pageDimensions?.join(' × ')} px
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <span className="text-sm text-gray-600 block mb-1">
                      Bubble Size
                    </span>
                    <span className="font-bold text-lg text-gray-900">
                      {templateInfo?.bubbleDimensions?.join(' × ')} px
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <span className="text-sm text-gray-600 block mb-1">
                      Field Blocks
                    </span>
                    <span className="font-bold text-lg text-gray-900">
                      {templateInfo?.fieldBlocksCount ||
                        Object.keys(templateInfo?.fieldBlocks || {}).length}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <span className="text-sm text-gray-600 block mb-1">
                      Output Columns
                    </span>
                    <span className="font-bold text-lg text-gray-900">
                      {templateInfo?.outputColumns?.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                  Ready for Processing
                </h4>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-gray-700 mb-3">
                      You can now upload OMR images for processing. The system
                      will use this template to detect and read the marked
                      responses.
                    </p>
                    <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">
                        Template validation passed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 p-2 rounded-full flex-shrink-0 mt-1">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-blue-800 mb-3">Next Steps:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm font-medium text-blue-700">
                        1. Upload Images
                      </p>
                      <p className="text-xs text-blue-600">
                        PNG, JPG, JPEG formats
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm font-medium text-blue-700">
                        2. Choose Mode
                      </p>
                      <p className="text-xs text-blue-600">
                        Single or batch processing
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm font-medium text-blue-700">
                        3. View Results
                      </p>
                      <p className="text-xs text-blue-600">
                        Detailed analysis table
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Editor Buttons */}
            <div className="mt-6 text-center space-y-4">
              {onOpenLayoutEditor && (
                <div>
                  <button
                    onClick={onOpenLayoutEditor}
                    className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mr-4">
                    <Edit3 className="h-5 w-5" />
                    <span>Web Layout Editor</span>
                  </button>
                  <button
                    onClick={handleOpenPythonLayoutEditor}
                    disabled={openingPythonEditor || backendStatus !== 'online'}
                    className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                    {openingPythonEditor ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <ExternalLink className="h-5 w-5" />
                    )}
                    <span>Python Layout Editor</span>
                  </button>
                </div>
              )}
              <div className="text-sm text-gray-600">
                <p className="mb-1">
                  <strong>Web Editor:</strong> Drag and adjust field positions
                  visually
                </p>
                <p>
                  <strong>Python Editor:</strong> Opens the original Python
                  layout editor (main.py --setLayout)
                </p>
              </div>
            </div>
          </div>
        )}

        {(processing || uploading) && (
          <div className="mt-6 flex items-center justify-center bg-blue-50 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
              <div>
                <p className="text-blue-800 font-medium">
                  {uploading ? 'Uploading template...' : 'Processing...'}
                </p>
                <p className="text-blue-600 text-sm">
                  Please wait while we process your request
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateUpload;
