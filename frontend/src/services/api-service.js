import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const apiService = {
  /**
   * Health check for the backend
   */
  healthCheck: async () => {
    const response = await api.get('/');
    return response.data;
  },

  /**
   * Analyze custom lore text
   * @param {string} text - The lore text to analyze
   * @param {string} [apiKey] - Optional override for Google API Key
   */
  analyzeLore: async (text, apiKey = null) => {
    const response = await api.post('/analyze', { text, api_key: apiKey });
    return response.data;
  },

  /**
   * Analyze the local book_lore.txt file
   * @param {number} limitChars - Maximum characters to analyze
   */
  analyzeBook: async (limitChars = 5000) => {
    const response = await api.get(`/analyze-book?limit_chars=${limitChars}`);
    return response.data;
  },

  characterDossier: async (characterName) => {
    const response = await api.get(`/character-dossier?name=${encodeURIComponent(characterName)}`);
    return response.data;
  }
};
