import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://192.168.8.116:5000/api'; // Your local backend IP

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for image processing
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);

    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      throw new Error(
        'Request timeout - the server is taking too long to respond'
      );
    }

    if (error.response?.status === 413) {
      throw new Error('File too large - please upload smaller images');
    }

    if (error.response?.status >= 500) {
      throw new Error('Server error - please try again later');
    }

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(error.message || 'An unexpected error occurred');
  }
);

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend service is not available');
  }
};

// Template upload
export const uploadTemplate = async (templateFile: File) => {
  console.log('Uploading template file:', templateFile.name, templateFile.size);

  const formData = new FormData();
  formData.append('template', templateFile);

  try {
    const response = await api.post('/template/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Template upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Template upload error details:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Single image processing
export const processOMRImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post('/omr/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

// Batch image processing
export const batchProcessOMR = async (imageFiles: File[]) => {
  const formData = new FormData();

  // Add all image files to FormData
  imageFiles.forEach((file, index) => {
    formData.append('images', file);
  });

  const response = await api.post('/omr/batch-process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

// Configuration management
export const getConfig = async () => {
  const response = await api.get('/config');
  return response.data;
};

export const updateConfig = async (config: any) => {
  const response = await api.post('/config', config);
  return response.data;
};

// Utility functions
export const validateImageFile = (file: File) => {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error(
      'Invalid file type. Please upload PNG, JPG, or JPEG images only.'
    );
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Please upload images smaller than 10MB.');
  }

  return true;
};

export const validateTemplateFile = (file: File) => {
  const validTypes = ['application/json'];
  const maxSize = 1024 * 1024; // 1MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JSON files only.');
  }

  if (file.size > maxSize) {
    throw new Error(
      'Template file too large. Please upload files smaller than 1MB.'
    );
  }

  return true;
};

// Image preview utilities
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// Template management
export const saveTemplate = async (templateData: any) => {
  const startTime = performance.now();
  try {
    const response = await axios.post(
      `${API_BASE_URL}/template/save`,
      templateData
    );
    logPerformance('Save Template', startTime);
    return response.data;
  } catch (error) {
    console.error('Save template error:', error);
    throw new Error(error.response?.data?.error || 'Failed to save template');
  }
};

export const downloadTemplate = async (templateData: any) => {
  const startTime = performance.now();
  try {
    const response = await axios.post(
      `${API_BASE_URL}/template/download`,
      templateData,
      {
        responseType: 'blob'
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template.json');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    logPerformance('Download Template', startTime);
    return { success: true };
  } catch (error) {
    console.error('Download template error:', error);
    throw new Error(
      error.response?.data?.error || 'Failed to download template'
    );
  }
};

// Python Layout Editor integration
export const openPythonLayoutEditor = async () => {
  const startTime = performance.now();
  try {
    const response = await axios.post(`${API_BASE_URL}/layout-editor/open`);
    logPerformance('Open Python Layout Editor', startTime);
    return response.data;
  } catch (error) {
    console.error('Open Python layout editor error:', error);
    throw new Error(
      error.response?.data?.error || 'Failed to open Python layout editor'
    );
  }
};

// Performance monitoring
export const logPerformance = (operation: string, startTime: number) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  console.log(`${operation} took ${duration.toFixed(2)}ms`);
  return duration;
};

export default api;
