export interface TemplateInfo {
  pageDimensions: number[];
  bubbleDimensions: number[];
  fieldBlocks: number;
  outputColumns: string[];
}

export interface ProcessingResult {
  id: number;
  filename: string;
  success: boolean;
  responses: Record<string, string>;
  multiMarked: boolean;
  multiRoll: boolean;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface BackendStatus {
  status: 'checking' | 'online' | 'offline';
  message?: string;
}

export interface UploadMode {
  mode: 'single' | 'batch';
}

export interface ProcessingProgress {
  progress: number;
  message: string;
  stage: 'upload' | 'analyze' | 'detect' | 'complete';
}

export interface Stats {
  total: number;
  successful: number;
  multiMarked: number;
  errors: number;
  accuracy: number;
}

// API Types
export interface HealthCheckResponse {
  status: string;
  message: string;
}

export interface TemplateUploadResponse {
  success: boolean;
  message: string;
  template: TemplateInfo;
}

export interface OMRProcessResponse {
  success: boolean;
  results: ProcessingResult;
}

export interface BatchProcessResponse {
  success: boolean;
  results: ProcessingResult[];
  total_processed: number;
}
