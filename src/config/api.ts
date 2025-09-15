// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    // Auth endpoints
    SSO_LOGIN: '/api/auth/sso-login',
    ME: '/api/auth/me',
    
    // Dashboard endpoints
    DASHBOARD_STATS: '/api/dashboard/stats',
    
    // File sensing job endpoints
    FILE_SENSING_JOBS: '/api/file-sensing/jobs',
    FILE_SENSING_JOB_TOGGLE: (id: number) => `/api/file-sensing/jobs/${id}/toggle`,
    
    // Filtering job endpoints
    FILTERING_JOBS: '/api/filtering/jobs',
    FILTERING_JOB_TOGGLE: (id: number) => `/api/filtering/jobs/${id}/toggle`,
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};