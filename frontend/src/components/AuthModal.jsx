import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(formData.username, formData.password);
      } else {
        if (!formData.email) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        await register(formData.email, formData.username, formData.password);
      }
      onClose();
      setFormData({ email: '', username: '', password: '' });
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.detail || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    setFormData({ email: '', username: '', password: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-8 border border-[#00ffcc] rounded-lg bg-[#000205] shadow-[0_0_30px_rgba(0,255,204,0.3)] animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#00ffcc] uppercase tracking-wider mb-2">
            {mode === 'login' ? 'Agent Login' : 'New Agent Registration'}
          </h2>
          <div className="h-0.5 w-20 bg-[#00ffcc] mx-auto"></div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 border border-red-500 bg-red-500/10 rounded text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[#00ffcc] text-xs font-bold uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required={mode === 'register'}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:border-[#00ffcc] focus:outline-none transition-colors"
                placeholder="agent@mythinformation.tech"
              />
            </div>
          )}

          <div>
            <label className="block text-[#00ffcc] text-xs font-bold uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:border-[#00ffcc] focus:outline-none transition-colors"
              placeholder="agent_username"
            />
          </div>

          <div>
            <label className="block text-[#00ffcc] text-xs font-bold uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:border-[#00ffcc] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-6 rounded font-bold text-sm uppercase tracking-wider transition-all ${
              loading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#00ffcc] text-black hover:bg-[#00cca3] shadow-[0_0_15px_rgba(0,255,204,0.4)]'
            }`}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Enter System' : 'Create Agent Profile'}
          </button>
        </form>

        {/* Mode switch */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === 'login' ? "Don't have clearance?" : 'Already have clearance?'}{' '}
          <button
            onClick={switchMode}
            className="text-[#00ffcc] hover:underline font-bold"
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
