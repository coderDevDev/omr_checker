'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

export default function CameraTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready to test');

  const startCamera = async () => {
    try {
      setError(null);
      setStatus('Requesting camera access...');

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Check if we're on HTTPS
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS or localhost');
      }

      setStatus('Accessing camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log('Camera stream:', mediaStream);
      setStream(mediaStream);
      setStatus('Camera active');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      let errorMessage = 'Camera access failed';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported.';
      } else if (err.message.includes('HTTPS')) {
        errorMessage = 'Camera requires HTTPS. Use https://localhost:3000';
      }

      setError(errorMessage);
      setStatus('Camera failed');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('Camera stopped');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Camera className="h-8 w-8 mr-3 text-blue-600" />
            Camera Test Page
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Feed */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Camera Feed
              </h2>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">No camera feed</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={startCamera}
                  disabled={!!stream}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Start Camera
                </button>
                <button
                  onClick={stopCamera}
                  disabled={!stream}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Stop Camera
                </button>
              </div>
            </div>

            {/* Status & Debug Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Status
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-lg font-medium text-gray-900">{status}</p>
                  {error && (
                    <p className="text-red-600 mt-2 font-medium">{error}</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Debug Information
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Protocol:</span>{' '}
                    {location.protocol}
                  </div>
                  <div>
                    <span className="font-medium">Hostname:</span>{' '}
                    {location.hostname}
                  </div>
                  <div>
                    <span className="font-medium">User Agent:</span>{' '}
                    {navigator.userAgent}
                  </div>
                  <div>
                    <span className="font-medium">Media Devices API:</span>{' '}
                    {navigator.mediaDevices
                      ? '✅ Supported'
                      : '❌ Not Supported'}
                  </div>
                  <div>
                    <span className="font-medium">getUserMedia:</span>{' '}
                    {navigator.mediaDevices?.getUserMedia &&
                    typeof navigator.mediaDevices.getUserMedia === 'function'
                      ? '✅ Available'
                      : '❌ Not Available'}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Troubleshooting
                </h2>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>
                      • Make sure you're using{' '}
                      <code className="bg-blue-100 px-1 rounded">
                        https://localhost:3000
                      </code>
                    </li>
                    <li>• Allow camera permission when prompted</li>
                    <li>
                      • Check that your camera is not being used by another app
                    </li>
                    <li>• Try refreshing the page if camera doesn't start</li>
                    <li>
                      • Check browser console (F12) for detailed error messages
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
