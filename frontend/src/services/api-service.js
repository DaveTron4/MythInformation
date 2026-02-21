import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const apiService = {
  healthCheck: async () => {
    const response = await api.get('/');
    return response.data;
  },

  analyzeLore: async (text, apiKey = null) => {
    const response = await api.post('/analyze', { text, api_key: apiKey });
    return response.data;
  },

  analyzeBook: async (limitChars = 5000) => {
    const response = await api.get(`/analyze-book?limit_chars=${limitChars}`);
    return response.data;
  },

  /**
   * Fetch dossier with specific system context to avoid naming conflicts
   */
  getCharacterDossier: async (characterName, systemName = "Unknown") => {
    const response = await api.get(
      `/character-dossier/${encodeURIComponent(characterName)}?system_name=${encodeURIComponent(systemName)}`
    );
    return response.data;
  }
};
