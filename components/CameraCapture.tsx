'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  AlertTriangle,
  Square,
  Circle,
  Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageFile: File) => void;
  template?: {
    pageDimensions: [number, number];
    bubbleDimensions: [number, number];
    fieldBlocks: Record<string, any>;
  };
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
  template
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alignmentQuality, setAlignmentQuality] = useState<
    'good' | 'warning' | 'poor'
  >('poor');

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      console.log('Requesting camera access...');

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Check if we're on HTTPS (required for camera access)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS or localhost');
      }

      // Try back camera first, fallback to any camera
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
      } catch (backCameraError) {
        console.log('Back camera not available, trying any camera...');
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
      }

      console.log('Camera access granted:', mediaStream);
      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video element updated with stream');
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMessage = 'Camera access denied or not available';

      if (err.name === 'NotAllowedError') {
        errorMessage =
          'Camera permission denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage =
          'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported in this browser.';
      } else if (err.message.includes('HTTPS')) {
        errorMessage =
          'Camera access requires HTTPS. Please use https://localhost:3000';
      }

      setError(errorMessage);
      setHasPermission(false);
      toast.error(errorMessage);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Draw template overlay
  const drawTemplateOverlay = useCallback(() => {
    if (!overlayCanvasRef.current || !template || !videoRef.current) return;

    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate overlay dimensions based on template
    const templateAspectRatio =
      template.pageDimensions[0] / template.pageDimensions[1];
    const videoAspectRatio = canvas.width / canvas.height;

    let overlayWidth, overlayHeight, overlayX, overlayY;

    if (templateAspectRatio > videoAspectRatio) {
      // Template is wider, fit to width
      overlayWidth = canvas.width * 0.8;
      overlayHeight = overlayWidth / templateAspectRatio;
      overlayX = canvas.width * 0.1;
      overlayY = (canvas.height - overlayHeight) / 2;
    } else {
      // Template is taller, fit to height
      overlayHeight = canvas.height * 0.8;
      overlayWidth = overlayHeight * templateAspectRatio;
      overlayX = (canvas.width - overlayWidth) / 2;
      overlayY = canvas.height * 0.1;
    }

    // Draw enhanced template boundary with multiple layers for better visibility
    // Outer glow effect
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 8;
    ctx.setLineDash([]);
    ctx.strokeRect(
      overlayX - 4,
      overlayY - 4,
      overlayWidth + 8,
      overlayHeight + 8
    );

    // Main border with alignment quality color
    ctx.strokeStyle =
      alignmentQuality === 'good'
        ? '#10b981'
        : alignmentQuality === 'warning'
        ? '#f59e0b'
        : '#ef4444';
    ctx.lineWidth = 6;
    ctx.setLineDash([15, 8]);
    ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight);

    // Inner border for precision
    ctx.strokeStyle =
      alignmentQuality === 'good'
        ? '#34d399'
        : alignmentQuality === 'warning'
        ? '#fbbf24'
        : '#f87171';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(
      overlayX + 2,
      overlayY + 2,
      overlayWidth - 4,
      overlayHeight - 4
    );

    // Draw enhanced corner markers
    const cornerSize = 30;
    ctx.setLineDash([]);

    // Corner marker color based on alignment
    const cornerColor =
      alignmentQuality === 'good'
        ? '#10b981'
        : alignmentQuality === 'warning'
        ? '#f59e0b'
        : '#ef4444';

    ctx.strokeStyle = cornerColor;
    ctx.lineWidth = 5;

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(overlayX, overlayY + cornerSize);
    ctx.lineTo(overlayX, overlayY);
    ctx.lineTo(overlayX + cornerSize, overlayY);
    ctx.stroke();

    // Add corner dot
    ctx.fillStyle = cornerColor;
    ctx.beginPath();
    ctx.arc(overlayX, overlayY, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(overlayX + overlayWidth - cornerSize, overlayY);
    ctx.lineTo(overlayX + overlayWidth, overlayY);
    ctx.lineTo(overlayX + overlayWidth, overlayY + cornerSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(overlayX + overlayWidth, overlayY, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(overlayX, overlayY + overlayHeight - cornerSize);
    ctx.lineTo(overlayX, overlayY + overlayHeight);
    ctx.lineTo(overlayX + cornerSize, overlayY + overlayHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(overlayX, overlayY + overlayHeight, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(overlayX + overlayWidth - cornerSize, overlayY + overlayHeight);
    ctx.lineTo(overlayX + overlayWidth, overlayY + overlayHeight);
    ctx.lineTo(overlayX + overlayWidth, overlayY + overlayHeight - cornerSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
      overlayX + overlayWidth,
      overlayY + overlayHeight,
      6,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw all field blocks for guidance
    if (template.fieldBlocks) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;

      // Show all field blocks with column labels
      Object.entries(template.fieldBlocks).forEach(
        ([blockName, block]: [string, any]) => {
          if (block.origin && block.bubblesGap) {
            // Calculate relative position within template
            const relativeX = block.origin[0] / template.pageDimensions[0];
            const relativeY = block.origin[1] / template.pageDimensions[1];

            const x = overlayX + overlayWidth * relativeX;
            const y = overlayY + overlayHeight * relativeY;

            // Calculate field block dimensions based on actual template data
            const blockWidth =
              (overlayWidth * (block.bubblesGap * 4)) /
              template.pageDimensions[0];
            const blockHeight =
              (overlayHeight * (block.bubblesGap * 20)) /
              template.pageDimensions[1];

            // Draw field block boundary
            ctx.strokeRect(x, y, blockWidth, blockHeight);

            // Draw sample bubbles based on template configuration
            // Use actual bubble dimensions from template
            const bubbleWidth =
              (template.bubbleDimensions[0] * overlayWidth) /
              template.pageDimensions[0];
            const bubbleHeight =
              (template.bubbleDimensions[1] * overlayHeight) /
              template.pageDimensions[1];
            const bubbleSpacing =
              (block.bubblesGap * overlayWidth) / template.pageDimensions[0];

            // Calculate better spacing to fill the available area
            const availableHeight = blockHeight;
            const totalQuestions = block.bubbleCount;
            const questionSpacing = availableHeight / totalQuestions;

            // Start questions closer to the top to fill the space better
            const firstQuestionY = y + questionSpacing * 0.3; // Start much closer to top

            // Draw column label positioned above the first question
            ctx.fillStyle = '#3b82f6';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(blockName, x + blockWidth / 2, firstQuestionY - 15);

            // Draw question labels on the left side if available
            if (block.fieldLabels && block.fieldLabels.length > 0) {
              ctx.fillStyle = '#1e40af';
              ctx.font = 'bold 10px Arial';
              ctx.textAlign = 'right';

              // Draw question labels for first few questions using better spacing
              for (let q = 0; q < Math.min(10, block.fieldLabels.length); q++) {
                const questionY = firstQuestionY + q * questionSpacing;
                const labelX = x - 10; // Position to the left of the column
                ctx.fillText(block.fieldLabels[q], labelX, questionY + 3);
              }

              // Reset text alignment
              ctx.textAlign = 'center';
            }

            for (let i = 0; i < 4; i++) {
              const bubbleX = x + i * bubbleSpacing + bubbleSpacing * 0.5;
              const bubbleCenterX = bubbleX;
              const bubbleCenterY = firstQuestionY;

              // Draw bubble as rectangle to match template bubbleDimensions [15, 10]
              ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Light blue fill
              ctx.fillRect(
                bubbleCenterX - bubbleWidth / 2,
                bubbleCenterY - bubbleHeight / 2,
                bubbleWidth,
                bubbleHeight
              );

              // Draw bubble border
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 2;
              ctx.strokeRect(
                bubbleCenterX - bubbleWidth / 2,
                bubbleCenterY - bubbleHeight / 2,
                bubbleWidth,
                bubbleHeight
              );

              // Draw bubble labels (A, B, C, D)
              ctx.fillStyle = '#1e40af';
              ctx.font = 'bold 10px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(
                String.fromCharCode(65 + i), // A, B, C, D
                bubbleCenterX,
                bubbleCenterY + 3
              );
            }

            // Draw all 20 questions to match template bubbleCount: 20
            for (let q = 1; q < block.bubbleCount; q++) {
              // Show all 20 questions using better spacing
              const questionY = firstQuestionY + q * questionSpacing;

              // Draw question label for each row
              if (block.fieldLabels && block.fieldLabels[q]) {
                ctx.fillStyle = '#1e40af';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'right';
                const labelX = x - 10; // Position to the left of the column
                ctx.fillText(block.fieldLabels[q], labelX, questionY + 3);
                ctx.textAlign = 'center'; // Reset alignment
              }

              for (let i = 0; i < 4; i++) {
                const bubbleX = x + i * bubbleSpacing + bubbleSpacing * 0.5;

                // Draw reference bubbles for alignment - different styles for better visibility
                if (q <= 5) {
                  // First 5 questions: more visible
                  ctx.strokeStyle = '#60a5fa';
                  ctx.lineWidth = 1.5;
                } else if (q <= 10) {
                  // Questions 6-10: medium visibility
                  ctx.strokeStyle = '#93c5fd';
                  ctx.lineWidth = 1;
                } else {
                  // Questions 11-20: lighter for pattern reference
                  ctx.strokeStyle = '#dbeafe';
                  ctx.lineWidth = 0.8;
                }

                ctx.strokeRect(
                  bubbleX - bubbleWidth / 2,
                  questionY - bubbleHeight / 2,
                  bubbleWidth,
                  bubbleHeight
                );
              }
            }

            // Reset fill style for next iteration
            ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
          }
        }
      );
    }

    // Draw alignment status indicator
    ctx.fillStyle =
      alignmentQuality === 'good'
        ? '#10b981'
        : alignmentQuality === 'warning'
        ? '#f59e0b'
        : '#ef4444';
    ctx.beginPath();
    ctx.arc(canvas.width - 30, 30, 12, 0, 2 * Math.PI);
    ctx.fill();

    // Add status text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      alignmentQuality === 'good'
        ? '✓'
        : alignmentQuality === 'warning'
        ? '!'
        : '✗',
      canvas.width - 30,
      35
    );
  }, [template, alignmentQuality]);

  // Update alignment quality (simplified - in real implementation, this would analyze the video)
  useEffect(() => {
    if (!stream) return;

    const interval = setInterval(() => {
      // Simulate alignment detection
      // In a real implementation, you would analyze the video feed
      // to detect if an OMR sheet is properly aligned
      const random = Math.random();
      if (random > 0.7) {
        setAlignmentQuality('good');
      } else if (random > 0.4) {
        setAlignmentQuality('warning');
      } else {
        setAlignmentQuality('poor');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stream]);

  // Redraw overlay when template or alignment changes
  useEffect(() => {
    if (isOpen && template) {
      drawTemplateOverlay();
    }
  }, [isOpen, template, drawTemplateOverlay]);

  // Handle video metadata loaded
  const handleVideoLoaded = () => {
    if (template) {
      drawTemplateOverlay();
    }
  };

  // Capture image
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and create file
    canvas.toBlob(
      blob => {
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `omr_capture_${timestamp}.jpg`;
          const file = new File([blob], filename, { type: 'image/jpeg' });

          toast.success('Image captured successfully!');
          onCapture(file);
          onClose();
        }
        setIsCapturing(false);
      },
      'image/jpeg',
      0.9
    );
  }, [isCapturing, onCapture, onClose]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Camera className="h-6 w-6" />
          <div>
            <h2 className="font-semibold">Capture OMR Sheet</h2>
            <p className="text-sm text-gray-300">
              Align the sheet with the template overlay
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <Maximize2 className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-black">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold mb-2">Camera Error</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors">
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={handleVideoLoaded}
            />

            {/* Template Overlay Canvas */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ objectFit: 'cover' }}
            />

            {/* Alignment Status */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    alignmentQuality === 'good'
                      ? 'bg-green-500'
                      : alignmentQuality === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-sm font-medium">
                  {alignmentQuality === 'good'
                    ? 'Good Alignment'
                    : alignmentQuality === 'warning'
                    ? 'Needs Adjustment'
                    : 'Poor Alignment'}
                </span>
              </div>
            </div>

            {/* Instructions */}
            {/* <div className="absolute bottom-20 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2">
                    Alignment Instructions:
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>
                      • Position the OMR sheet within the template outline
                    </li>
                    <li>• Ensure all four corners are visible</li>
                    <li>• Keep the sheet flat and well-lit</li>
                    <li>
                      • Wait for green alignment indicator before capturing
                    </li>
                  </ul>
                </div>
              </div>
            </div> */}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={onClose}
            className="p-3 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={captureImage}
            disabled={isCapturing || alignmentQuality === 'poor'}
            className={`p-4 rounded-full transition-all duration-200 ${
              isCapturing
                ? 'bg-gray-600'
                : alignmentQuality === 'good'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-500 cursor-not-allowed'
            }`}>
            {isCapturing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
            ) : (
              <Square className="h-8 w-8 text-white" />
            )}
          </button>

          <button
            onClick={startCamera}
            className="p-3 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors">
            <RotateCcw className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="text-center mt-3">
          <p className="text-sm text-gray-400">
            {isCapturing
              ? 'Capturing...'
              : alignmentQuality === 'good'
              ? 'Ready to capture!'
              : 'Adjust alignment for best results'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
