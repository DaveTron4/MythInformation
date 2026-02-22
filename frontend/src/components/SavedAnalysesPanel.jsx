import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api-service';
import { useAuth } from '../contexts/AuthContext';

export default function SavedAnalysesPanel({ isOpen, onClose, onLoad }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen && token) {
      loadAnalyses();
    }
  }, [isOpen, token]);

  const loadAnalyses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getMyAnalyses(token);
      setAnalyses(data);
    } catch (err) {
      console.error('Failed to load analyses:', err);
      setError('Failed to load saved analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (analysisId) => {
    try {
      const analysis = await apiService.loadAnalysis(token, analysisId);
      onLoad(analysis);
      onClose();
    } catch (err) {
      console.error('Failed to load analysis:', err);
      setError('Failed to load analysis');
    }
  };

  const handleDelete = async (analysisId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this analysis permanently?')) return;
    
    try {
      await apiService.deleteAnalysis(token, analysisId);
      await loadAnalyses(); // Refresh list
    } catch (err) {
      console.error('Failed to delete analysis:', err);
      setError('Failed to delete analysis');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-150 max-h-[80vh] border border-[#00ffcc] rounded-lg bg-black/95 shadow-[0_0_40px_rgba(0,255,204,0.4)] p-6 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#00ffcc]/30">
          <h2 className="text-[#00ffcc] text-xl font-bold tracking-wider uppercase">Saved Analyses</h2>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-[#00ffcc] text-sm animate-pulse">Loading analyses...</div>
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No saved analyses yet</p>
              <p className="text-xs">Create a graph and save it to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="group border border-[#00ffcc]/30 rounded-lg p-4 bg-black/50 hover:bg-[#00ffcc]/5 hover:border-[#00ffcc] transition-all cursor-pointer"
                  onClick={() => handleLoad(analysis.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold text-base group-hover:text-[#00ffcc] transition-colors">
                      {analysis.name}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(analysis.id, e)}
                      className="text-gray-500 hover:text-red-500 transition-colors px-2"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                  
                  {analysis.description && (
                    <p className="text-gray-400 text-xs mb-3">{analysis.description}</p>
                  )}
                  
                  <div className="flex gap-4 text-[9px] text-gray-500 uppercase tracking-wider">
                    <span>{analysis.nodes?.length || 0} nodes</span>
                    <span>{analysis.links?.length || 0} links</span>
                    <span className="ml-auto">
                      {new Date(analysis.updated_at || analysis.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Systems */}
                  {analysis.work_meta && Object.keys(analysis.work_meta).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {Object.entries(analysis.work_meta).map(([name, meta]) => (
                        <span
                          key={name}
                          className="text-[8px] px-2 py-0.5 rounded-full border"
                          style={{
                            color: meta.color,
                            borderColor: meta.color + '55',
                            background: meta.color + '11',
                          }}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
