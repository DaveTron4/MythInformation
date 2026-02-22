import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout
});

/**
 * Retry logic: attempt a request up to 3 times with exponential backoff
 */
const withRetry = async (fn, maxRetries = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fn();
      return response.data;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }
  throw lastError;
};

export const apiService = {
  healthCheck: async () => {
    return withRetry(() => api.get('/'));
  },

  analyzeBook: async (limitChars = 5000) => {
    return withRetry(() => 
      api.get(`/analyze-book?limit_chars=${limitChars}`)
    );
  },

  analyzeLore: async (text, apiKey = null) => {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }
    if (text.length > 50000) {
      throw new Error('Text exceeds maximum length of 50,000 characters');
    }
    
    return withRetry(() => 
      api.post('/analyze', { text, api_key: apiKey })
    );
  },

  /**
   * Fetch and analyze a specific Project Gutenberg book by ID
   */
  analyzeGutenberg: async (bookId, limitChars = 4000) => {
    if (!bookId || bookId.trim().length === 0) {
      throw new Error('Book ID cannot be empty');
    }
    
    return withRetry(() => 
      api.get(`/analyze-gutenberg/${bookId}?limit_chars=${limitChars}`)
    );
  },

  /**
   * Fetch dossier with specific system context to avoid naming conflicts
   */
  getCharacterDossier: async (characterName, systemName = "Unknown") => {
    return withRetry(() => 
      api.get(
        `/character-dossier/${encodeURIComponent(characterName)}?system_name=${encodeURIComponent(systemName)}`
      )
    );
  },

  // ==================== Authentication ====================
  
  /**
   * Register a new user
   */
  register: async (email, username, password) => {
    const response = await api.post('/auth/register', { email, username, password });
    return response.data;
  },

  /**
   * Login and get JWT token
   */
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (token) => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // ==================== Analyses ====================

  /**
   * Save a new analysis
   */
  saveAnalysis: async (token, name, description, nodes, links, workMeta) => {
    const response = await api.post('/analyses', 
      { name, description, nodes, links, work_meta: workMeta },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * Get all user's analyses
   */
  getMyAnalyses: async (token) => {
    const response = await api.get('/analyses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Load a specific analysis
   */
  loadAnalysis: async (token, analysisId) => {
    const response = await api.get(`/analyses/${analysisId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Update an analysis
   */
  updateAnalysis: async (token, analysisId, data) => {
    const response = await api.put(`/analyses/${analysisId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Delete an analysis
   */
  deleteAnalysis: async (token, analysisId) => {
    await api.delete(`/analyses/${analysisId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // ==================== ML Predictions ====================

  /**
   * Predict relationship type between two characters
   */
  predictRelationshipType: async (sourceCentrality, targetCentrality, sourceNameLength, targetNameLength, sameWork, sourceInWork) => {
    return withRetry(() =>
      api.post('/predict/relationship-type', {
        source_centrality: sourceCentrality,
        target_centrality: targetCentrality,
        source_name_length: sourceNameLength,
        target_name_length: targetNameLength,
        same_work: sameWork,
        source_in_work: sourceInWork
      })
    );
  },

  /**
   * Check if ML model is loaded
   */
  checkMLHealth: async () => {
    return withRetry(() => api.get('/predict/health'));
  }
};
