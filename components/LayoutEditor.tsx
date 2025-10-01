'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Move,
  Square,
  Save,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Settings,
  Check,
  X,
  Image as ImageIcon,
  Upload as UploadIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { saveTemplate, downloadTemplate } from '@/services/api';

interface FieldBlock {
  id: string;
  fieldType: string;
  origin: [number, number];
  bubblesGap: number;
  labelsGap: number;
  bubbleCount: number;
  fieldLabels: string[];
}

interface LayoutEditorProps {
  imageUrl?: string;
  initialTemplate?: any;
  onSave: (template: any) => void;
  onCancel: () => void;
}

interface DragState {
  isDragging: boolean;
  dragStart: { x: number; y: number };
  originalPosition: [number, number];
  fieldId: string;
}

const LayoutEditor: React.FC<LayoutEditorProps> = ({
  imageUrl,
  initialTemplate,
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [fieldBlocks, setFieldBlocks] = useState<Record<string, FieldBlock>>(
    {}
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [showBackgroundImage, setShowBackgroundImage] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(false);

  // Convert template coordinates to percentage-based positioning
  const getPercentagePosition = useCallback(
    (x: number, y: number) => {
      if (!initialTemplate?.pageDimensions) return { x, y };

      const [pageWidth, pageHeight] = initialTemplate.pageDimensions;
      return {
        x: (x / pageWidth) * 100, // Convert to percentage
        y: (y / pageHeight) * 100
      };
    },
    [initialTemplate]
  );

  // Auto-fit canvas to template dimensions
  const setupCanvasForTemplate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !initialTemplate) return;

    const [pageWidth, pageHeight] = initialTemplate.pageDimensions || [
      707, 484
    ];

    // Set canvas to EXACT template dimensions - no padding, no scaling
    canvas.width = pageWidth;
    canvas.height = pageHeight;

    // Use 1:1 scale like Python - no transformations
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [initialTemplate]);

  // Initialize field blocks from template
  useEffect(() => {
    if (initialTemplate?.fieldBlocks) {
      console.log(
        'Loading template field blocks:',
        initialTemplate.fieldBlocks
      );
      setFieldBlocks(initialTemplate.fieldBlocks);
    } else if (initialTemplate) {
      console.log('Initial template:', initialTemplate);
    }
  }, [initialTemplate]);

  // Setup canvas when template loads
  useEffect(() => {
    if (initialTemplate) {
      // Small delay to ensure canvas is mounted
      const timer = setTimeout(() => {
        setupCanvasForTemplate();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialTemplate, setupCanvasForTemplate]);

  // Handle image upload
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          const imageUrl = e.target?.result as string;
          setBackgroundImage(imageUrl);

          // Load image to get dimensions and calculate initial scale
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            if (canvas) {
              // Calculate scale to fit image in canvas
              const scaleX = canvas.width / img.width;
              const scaleY = canvas.height / img.height;
              const scale = Math.min(scaleX, scaleY) * 0.8; // 80% of canvas

              setImageScale(scale);
              setImageOffset({
                x: (canvas.width - img.width * scale) / 2,
                y: (canvas.height - img.height * scale) / 2
              });
            }
          };
          img.src = imageUrl;
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // Drawing functions
  const drawBackgroundImage = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!backgroundImage) return;

      const img = new Image();
      img.onload = () => {
        // Apply image transformations
        ctx.save();

        // Draw image with current scale and offset
        ctx.globalAlpha = 0.7; // Make background semi-transparent
        ctx.drawImage(
          img,
          imageOffset.x / zoom,
          imageOffset.y / zoom,
          (img.width * imageScale) / zoom,
          (img.height * imageScale) / zoom
        );

        ctx.restore();
      };
      img.src = backgroundImage;
    },
    [backgroundImage, imageScale, imageOffset, zoom]
  );

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1; // Use fixed line width like Python
      ctx.setLineDash([5, 5]); // Use fixed dash pattern like Python

      const gridSize = 20;
      const startX = (pan.x % gridSize) - pan.x;
      const startY = (pan.y % gridSize) - pan.y;

      for (let x = startX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = startY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    },
    [pan]
  );

  const drawFieldBlock = useCallback(
    (ctx: CanvasRenderingContext2D, fieldId: string, block: FieldBlock) => {
      const [x, y] = block.origin;
      const isSelected = selectedField === fieldId;

      // Get bubble dimensions from template (default to [15, 10] if not available)
      const [bubbleWidth, bubbleHeight] = initialTemplate?.bubbleDimensions || [
        15, 10
      ];

      // Calculate field block dimensions based on actual template values
      const fieldWidth = bubbleWidth * 4 + block.bubblesGap * 3; // 4 options with gaps
      const fieldHeight =
        block.bubbleCount * (bubbleHeight + block.labelsGap) - block.labelsGap;

      // Field block background with stronger opacity for better visibility over image
      ctx.fillStyle = isSelected
        ? 'rgba(59, 130, 246, 0.6)'
        : 'rgba(59, 130, 246, 0.4)';
      ctx.fillRect(x - 10, y - 10, fieldWidth + 20, fieldHeight + 20);

      // Field block border with thicker line for better visibility
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#4f46e5';
      ctx.lineWidth = isSelected ? 4 : 3; // Use fixed line width like Python
      ctx.strokeRect(x - 10, y - 10, fieldWidth + 20, fieldHeight + 20);

      // Draw bubbles for each question
      for (let i = 0; i < block.bubbleCount; i++) {
        const bubbleY = y + i * (bubbleHeight + block.labelsGap);

        // Draw 4 bubbles (A, B, C, D)
        for (let j = 0; j < 4; j++) {
          const bubbleX = x + j * (bubbleWidth + block.bubblesGap);

          // Bubble circle with actual template dimensions
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#1f2937';
          ctx.lineWidth = 2; // Use fixed line width like Python
          ctx.beginPath();
          ctx.arc(
            bubbleX + bubbleWidth / 2,
            bubbleY + bubbleHeight / 2,
            bubbleWidth / 2,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.stroke();
        }

        // Question label with better visibility
        ctx.fillStyle = '#1f2937';
        ctx.font = `bold 12px Inter, sans-serif`; // Use fixed font size like Python
        ctx.textAlign = 'right';
        ctx.fillText(
          block.fieldLabels[i] || `Q${i + 1}`,
          x - 15,
          bubbleY + bubbleHeight / 2 + 4
        );
        ctx.textAlign = 'left'; // Reset text alignment
      }

      // Field ID label with better visibility
      ctx.fillStyle = isSelected ? '#1e40af' : '#4b5563';
      ctx.font = `bold 11px Inter, sans-serif`; // Use fixed font size like Python
      ctx.textAlign = 'center';
      ctx.fillText(fieldId, x + fieldWidth / 2, y - 15);

      // Show coordinates in debug mode
      if (showCoordinates) {
        ctx.fillStyle = '#ff0000';
        ctx.font = `8px Inter, sans-serif`; // Use fixed font size
        ctx.textAlign = 'left';
        ctx.fillText(`[${x},${y}]`, x, y + fieldHeight + 10);
      }
    },
    [selectedField, initialTemplate, showCoordinates]
  );

  // Canvas drawing
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply zoom and pan only if not using 1:1 scale
    if (zoom !== 1 || pan.x !== 0 || pan.y !== 0) {
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
    }

    // Draw OMR sheet background if we have template dimensions
    if (initialTemplate?.pageDimensions) {
      const [pageWidth, pageHeight] = initialTemplate.pageDimensions;

      // Draw OMR sheet background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageWidth, pageHeight);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2 / zoom;
      ctx.strokeRect(0, 0, pageWidth, pageHeight);
    }

    // Draw background image
    if (showBackgroundImage && backgroundImage) {
      drawBackgroundImage(ctx, canvas.width, canvas.height);
    }

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Draw field blocks
    Object.entries(fieldBlocks).forEach(([fieldId, block]) => {
      drawFieldBlock(ctx, fieldId, block);
    });

    // Restore context
    ctx.restore();
  }, [
    pan,
    showGrid,
    fieldBlocks,
    showBackgroundImage,
    backgroundImage,
    imageScale,
    imageOffset,
    initialTemplate,
    drawBackgroundImage,
    drawGrid,
    drawFieldBlock
  ]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Check if clicking on a field block
    const clickedField = getFieldAtPosition(x, y);
    if (clickedField) {
      setSelectedField(clickedField);
      setDragState({
        isDragging: true,
        dragStart: { x: e.clientX, y: e.clientY },
        originalPosition: [...fieldBlocks[clickedField].origin] as [
          number,
          number
        ],
        fieldId: clickedField
      });
    } else {
      setSelectedField(null);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragState?.isDragging) {
      const deltaX = e.clientX - dragState.dragStart.x;
      const deltaY = e.clientY - dragState.dragStart.y;

      const newX = Math.max(0, dragState.originalPosition[0] + deltaX / zoom);
      const newY = Math.max(0, dragState.originalPosition[1] + deltaY / zoom);

      setFieldBlocks(prev => ({
        ...prev,
        [dragState.fieldId]: {
          ...prev[dragState.fieldId],
          origin: [newX, newY]
        }
      }));
    } else if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (dragState?.isDragging) {
      setDragState(null);
    }
    setIsDragging(false);
  };

  const getFieldAtPosition = (x: number, y: number): string | null => {
    for (const [fieldId, block] of Object.entries(fieldBlocks)) {
      const [bx, by] = block.origin;
      const width = 120;
      const height = block.bubbleCount * block.bubblesGap + 20;

      if (
        x >= bx - 10 &&
        x <= bx + width - 10 &&
        y >= by - 10 &&
        y <= by + height - 10
      ) {
        return fieldId;
      }
    }
    return null;
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Field block controls
  const addFieldBlock = () => {
    const fieldId = `Column${Object.keys(fieldBlocks).length + 1}`;
    const newBlock: FieldBlock = {
      id: fieldId,
      fieldType: 'QTYPE_MCQ4',
      origin: [100 + Object.keys(fieldBlocks).length * 150, 50],
      bubblesGap: 21,
      labelsGap: 22.7,
      bubbleCount: 20,
      fieldLabels: Array.from(
        { length: 20 },
        (_, i) => `Q${Object.keys(fieldBlocks).length * 20 + i + 1}`
      )
    };

    setFieldBlocks(prev => ({
      ...prev,
      [fieldId]: newBlock
    }));
  };

  const removeFieldBlock = (fieldId: string) => {
    setFieldBlocks(prev => {
      const newBlocks = { ...prev };
      delete newBlocks[fieldId];
      return newBlocks;
    });
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  // Save template
  const handleSave = async () => {
    try {
      const template = {
        pageDimensions: [707, 484],
        bubbleDimensions: [15, 10],
        fieldBlocks,
        emptyValue: '-'
      };

      await saveTemplate(template);
      onSave(template);
      toast.success('Template saved successfully!');
    } catch (error) {
      toast.error('Failed to save template');
      console.error('Save error:', error);
    }
  };

  // Download template
  const handleDownload = async () => {
    try {
      const template = {
        pageDimensions: [707, 484],
        bubbleDimensions: [15, 10],
        fieldBlocks,
        emptyValue: '-'
      };

      await downloadTemplate(template);
      toast.success('Template downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download template');
      console.error('Download error:', error);
    }
  };

  // Update canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Grid3X3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  OMR Layout Editor
                </h2>
                <p className="text-blue-100 text-sm">
                  Drag fields to adjust positions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                title="Download Template">
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={onCancel}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-semibold transition-colors">
                <Save className="h-4 w-4 mr-2 inline" />
                Save Template
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Toolbar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Background Image
              </h3>
              <div className="space-y-2 mb-6">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="background-upload"
                  />
                  <label
                    htmlFor="background-upload"
                    className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer">
                    <UploadIcon className="h-4 w-4" />
                    <span>Upload Image</span>
                  </label>
                </div>
                {backgroundImage && (
                  <button
                    onClick={() => setShowBackgroundImage(!showBackgroundImage)}
                    className={`w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 transition-colors ${
                      showBackgroundImage
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}>
                    {showBackgroundImage ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span>
                      {showBackgroundImage ? 'Hide Image' : 'Show Image'}
                    </span>
                  </button>
                )}
                {backgroundImage && (
                  <button
                    onClick={() => {
                      setBackgroundImage(null);
                      setShowBackgroundImage(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white rounded-lg px-3 py-2 hover:bg-red-700 transition-colors">
                    <X className="h-4 w-4" />
                    <span>Remove Image</span>
                  </button>
                )}
              </div>

              {backgroundImage && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2 text-sm">
                    Image Adjustments
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Scale
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={imageScale}
                        onChange={e =>
                          setImageScale(parseFloat(e.target.value))
                        }
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">
                        {Math.round(imageScale * 100)}%
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Position X
                      </label>
                      <input
                        type="range"
                        min="-200"
                        max="200"
                        step="1"
                        value={imageOffset.x}
                        onChange={e =>
                          setImageOffset(prev => ({
                            ...prev,
                            x: parseInt(e.target.value)
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Position Y
                      </label>
                      <input
                        type="range"
                        min="-200"
                        max="200"
                        step="1"
                        value={imageOffset.y}
                        onChange={e =>
                          setImageOffset(prev => ({
                            ...prev,
                            y: parseInt(e.target.value)
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const canvas = canvasRef.current;
                        if (canvas && backgroundImage) {
                          const img = new Image();
                          img.onload = () => {
                            const scaleX = canvas.width / img.width;
                            const scaleY = canvas.height / img.height;
                            const scale = Math.min(scaleX, scaleY) * 0.8;
                            setImageScale(scale);
                            setImageOffset({
                              x: (canvas.width - img.width * scale) / 2,
                              y: (canvas.height - img.height * scale) / 2
                            });
                          };
                          img.src = backgroundImage;
                        }
                      }}
                      className="w-full text-xs bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 transition-colors">
                      Auto Fit
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                View Controls
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleZoomIn}
                  className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                  <ZoomIn className="h-4 w-4" />
                  <span>Zoom In</span>
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                  <ZoomOut className="h-4 w-4" />
                  <span>Zoom Out</span>
                </button>
                <button
                  onClick={handleResetView}
                  className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset View</span>
                </button>
                <button
                  onClick={setupCanvasForTemplate}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Auto Fit Template</span>
                </button>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 transition-colors ${
                    showGrid
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}>
                  <Grid3X3 className="h-4 w-4" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setShowCoordinates(!showCoordinates)}
                  className={`w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 transition-colors ${
                    showCoordinates
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}>
                  <Settings className="h-4 w-4" />
                  <span>Coords</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Field Blocks ({Object.keys(fieldBlocks).length})
              </h3>
              {Object.keys(fieldBlocks).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Square className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No field blocks loaded</p>
                  <p className="text-xs">
                    Upload a template to see field blocks
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(fieldBlocks).map(([fieldId, block]) => (
                    <div
                      key={fieldId}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedField === fieldId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedField(fieldId)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{fieldId}</p>
                          <p className="text-xs text-gray-500">
                            {block.bubbleCount} questions
                          </p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            removeFieldBlock(fieldId);
                          }}
                          className="text-red-500 hover:text-red-700">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={addFieldBlock}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-green-600 text-white rounded-lg px-3 py-2 hover:bg-green-700 transition-colors">
                <Square className="h-4 w-4" />
                <span>Add Field Block</span>
              </button>
            </div>

            {selectedField && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Field Properties
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Position X
                    </label>
                    <input
                      type="number"
                      value={fieldBlocks[selectedField]?.origin[0] || 0}
                      onChange={e => {
                        const newX = parseInt(e.target.value) || 0;
                        setFieldBlocks(prev => ({
                          ...prev,
                          [selectedField]: {
                            ...prev[selectedField],
                            origin: [newX, prev[selectedField].origin[1]]
                          }
                        }));
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Position Y
                    </label>
                    <input
                      type="number"
                      value={fieldBlocks[selectedField]?.origin[1] || 0}
                      onChange={e => {
                        const newY = parseInt(e.target.value) || 0;
                        setFieldBlocks(prev => ({
                          ...prev,
                          [selectedField]: {
                            ...prev[selectedField],
                            origin: [prev[selectedField].origin[0], newY]
                          }
                        }));
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Questions Count
                    </label>
                    <input
                      type="number"
                      value={fieldBlocks[selectedField]?.bubbleCount || 20}
                      onChange={e => {
                        const newCount = parseInt(e.target.value) || 20;
                        const newLabels = Array.from(
                          { length: newCount },
                          (_, i) =>
                            fieldBlocks[selectedField].fieldLabels[i] ||
                            `Q${i + 1}`
                        );
                        setFieldBlocks(prev => ({
                          ...prev,
                          [selectedField]: {
                            ...prev[selectedField],
                            bubbleCount: newCount,
                            fieldLabels: newLabels
                          }
                        }));
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative bg-gray-100">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="absolute inset-0 cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />

            {/* Instructions */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm max-w-xs">
              <p className="font-medium text-gray-800 mb-1">Instructions:</p>
              <ul className="text-gray-600 space-y-1">
                <li>• Canvas auto-fits to template dimensions</li>
                <li>• Upload OMR sheet image as background</li>
                <li>• Drag field blocks to align with bubbles</li>
                <li>• Use "Auto Fit Template" for perfect alignment</li>
                <li>• Toggle "Coords" to see field block positions</li>
                <li>• Click to select and edit field blocks</li>
              </ul>
              {initialTemplate && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-700 text-xs font-medium">
                    ✓ Template loaded:{' '}
                    {initialTemplate.pageDimensions?.join('×')}px
                  </p>
                </div>
              )}
              {backgroundImage && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-700 text-xs font-medium">
                    ✓ Background image loaded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutEditor;
