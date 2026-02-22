import React, { useState } from 'react';
import { apiService } from '../services/api-service';
import { useAuth } from '../contexts/AuthContext';

export default function SaveAnalysisModal({ isOpen, onClose, onSave, graphData, workMeta }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (graphData.nodes.length === 0) {
      setError('No graph data to save');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedAnalysis = await apiService.saveAnalysis(
        token,
        name.trim(),
        description.trim(),
        graphData.nodes,
        graphData.links,
        workMeta
      );
      
      setName('');
      setDescription('');
      onSave?.(savedAnalysis);
      onClose();
    } catch (err) {
      console.error('Failed to save analysis:', err);
      setError(err.response?.data?.detail || 'Failed to save analysis');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-125 border border-[#00ffcc] rounded-lg bg-black/95 shadow-[0_0_40px_rgba(0,255,204,0.4)] p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#00ffcc]/30">
          <h2 className="text-[#00ffcc] text-xl font-bold tracking-wider uppercase">Save Analysis</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 border border-red-500 rounded bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block text-[#00ffcc] text-xs uppercase tracking-wider mb-2 font-bold">
              Analysis Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Greek Mythology Analysis"
              className="w-full px-3 py-2 bg-black/50 border border-[#00ffcc]/30 rounded text-white text-sm focus:outline-none focus:border-[#00ffcc] transition-colors"
              maxLength={100}
              disabled={saving}
            />
          </div>

          <div className="mb-6">
            <label className="block text-[#00ffcc] text-xs uppercase tracking-wider mb-2 font-bold">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this analysis..."
              rows={3}
              className="w-full px-3 py-2 bg-black/50 border border-[#00ffcc]/30 rounded text-white text-sm focus:outline-none focus:border-[#00ffcc] transition-colors resize-none"
              maxLength={500}
              disabled={saving}
            />
          </div>

          {/* Stats */}
          <div className="mb-6 p-3 bg-[#00ffcc]/5 border border-[#00ffcc]/20 rounded">
            <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-2">Graph Stats</div>
            <div className="flex gap-4 text-sm text-white">
              <span>{graphData.nodes.length} nodes</span>
              <span>{graphData.links.length} links</span>
              <span>{Object.keys(workMeta).length} systems</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-500 text-gray-400 rounded hover:bg-gray-500/10 transition-all uppercase text-sm font-bold tracking-wider"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 border border-[#00ffcc] text-[#00ffcc] rounded hover:bg-[#00ffcc]/10 transition-all uppercase text-sm font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
