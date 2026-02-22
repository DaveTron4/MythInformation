import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiService } from '../services/api-service';

const DossierPanel = ({ selectedNode, allLinks, allNodes, workMeta, onClose, onAddLink }) => {
  if (!selectedNode) return null;

  const [dossierData, setDossierData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [mlReady, setMlReady] = useState(false);

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getCharacterDossier(selectedNode.id, selectedNode.work);
        setDossierData(data);
      } catch (err) {
        console.error("Error fetching dossier:", err);
        setError(err.response?.data?.detail || err.message || "Failed to load dossier");
        setDossierData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDossier();

    // Check if ML model is available
    const checkML = async () => {
      try {
        const health = await apiService.checkMLHealth();
        setMlReady(health.ml_model_loaded);
      } catch (err) {
        console.log("ML model not available");
        setMlReady(false);
      }
    };
    checkML();
  }, [selectedNode]);

  const localConnections = (allLinks || []).filter(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    return sourceId === selectedNode.id || targetId === selectedNode.id;
  });

  // Get prediction when target is selected
  const handleTargetSelect = async (targetId) => {
    setSelectedTarget(targetId);
    setCustomLabel('');
    setPrediction(null);
    
    if (!mlReady || !targetId) return;

    setPredictLoading(true);
    try {
      const sourceNode = selectedNode;
      const targetNode = allNodes.find(n => n.id === targetId);
      
      const prediction = await apiService.predictRelationshipType(
        sourceNode.size ? sourceNode.size / 100 : 0.1, // normalize to ~0-1 scale
        targetNode.size ? targetNode.size / 100 : 0.1,
        sourceNode.id.length,
        targetNode.id.length,
        (sourceNode.work === targetNode.work) ? 1 : 0,
        (sourceNode.work === selectedNode.work) ? 1 : 0
      );
      
      setPrediction(prediction);
      setCustomLabel(prediction.predicted_relationship);
    } catch (err) {
      console.error("Prediction failed:", err);
      setPrediction(null);
    } finally {
      setPredictLoading(false);
    }
  };

  const handleAddConnection = () => {
    if (!selectedTarget || !customLabel) return;

    const newLink = {
      source: selectedNode.id,
      target: selectedTarget,
      label: customLabel
    };

    onAddLink(newLink);
    setSelectedTarget(null);
    setCustomLabel('');
    setPrediction(null);
    setShowAddConnection(false);
  };

  // Get available target nodes (exclude self and already connected)
  const availableTargets = (allNodes || []).filter(node => {
    if (node.id === selectedNode.id) return false;
    const alreadyConnected = localConnections.some(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return (
        (sourceId === selectedNode.id && targetId === node.id) ||
        (sourceId === node.id && targetId === selectedNode.id)
      );
    });
    return !alreadyConnected;
  });

  return (
    <div className="absolute top-5 right-5 z-10 text-white font-mono bg-[rgba(0,0,10,0.95)] border border-[#ff0055] rounded-lg w-80 shadow-[0_0_25px_rgba(255,0,85,0.5)] animate-slide-in h-150 max-h-[85vh] flex flex-col pointer-events-auto overflow-hidden">
      <div className="flex justify-between items-start p-6 pb-0 shrink-0">
        <div>
          <h2 className="text-[#ff0055] mb-1 text-[10px] tracking-[0.3em] uppercase font-black opacity-80 text-left">
            📂 Case File
          </h2>
          <h1 className="m-0 text-2xl uppercase font-bold text-white tracking-tighter leading-none text-left">
            {selectedNode.id}
          </h1>
          <p className="text-[#00ffcc] text-[9px] uppercase mt-2 font-bold tracking-widest bg-[#00ffcc]/10 px-2 py-0.5 rounded inline-block">
            Location: {selectedNode.work}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="bg-none border-none text-[#ff0055] text-xl cursor-pointer hover:scale-110 transition-transform p-1 leading-none"
        >
          ✕
        </button>
      </div>

      <hr className="border-white/10 my-4 mx-6 shrink-0" />
      
      <div className="overflow-y-auto px-6 pb-6 flex-1 custom-scrollbar scroll-smooth">
        {loading ? (
          <div className="py-10 text-center">
            <div className="animate-spin w-5 h-5 border-2 border-[#ff0055] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest animate-pulse">Accessing Data...</p>
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <p className="text-red-400 text-[11px] uppercase font-bold mb-3">⚠️ Data Retrieval Failed</p>
            <p className="text-gray-400 text-[10px] leading-relaxed mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                const fetchRetry = async () => {
                  try {
                    const data = await apiService.getCharacterDossier(selectedNode.id, selectedNode.work);
                    setDossierData(data);
                  } catch (err) {
                    setError(err.response?.data?.detail || err.message || "Retry failed");
                  } finally {
                    setLoading(false);
                  }
                };
                fetchRetry();
              }}
              className="px-3 py-1 text-[9px] bg-red-500/20 border border-red-500 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              RETRY
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h3 className="text-[#00ffcc] mb-3 text-[10px] tracking-widest uppercase font-bold border-l-2 border-[#00ffcc] pl-2 text-left">
                Identity Profile
              </h3>
              <div className="text-gray-300 leading-relaxed text-xs text-left">
                <ReactMarkdown>{dossierData?.biography || "No bio data found."}</ReactMarkdown>
              </div>
            </section>

            <section>
              <h3 className="text-[#00ffcc] mb-3 text-[10px] tracking-widest uppercase font-bold border-l-2 border-[#00ffcc] pl-2 text-left">
                Detected Connections
              </h3>
              {localConnections.length > 0 ? (
                <ul className="space-y-2 text-left">
                  {localConnections.map((link, index) => {
                    const sId = typeof link.source === 'object' ? link.source.id : link.source;
                    const tId = typeof link.target === 'object' ? link.target.id : link.target;
                    const otherChar = sId === selectedNode.id ? tId : sId;
                    return (
                      <li key={index} className="text-[11px] border-l-2 border-[#ff0055] pl-2 py-1 bg-white/5">
                        <span className="text-white font-bold">{otherChar}</span>
                        <br/>
                        <span className="text-[#ff0055] text-[9px] uppercase">{link.label || 'Connected'}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-600 italic text-[10px] text-left">Isolated entity.</p>
              )}
              
              {!showAddConnection && (
                <button
                  onClick={() => setShowAddConnection(true)}
                  className="mt-3 w-full py-1 px-2 text-[9px] bg-[#00ffcc]/10 border border-[#00ffcc] text-[#00ffcc] rounded hover:bg-[#00ffcc]/20 transition-colors font-bold uppercase"
                >
                  + Add Connection
                </button>
              )}
              
              {showAddConnection && (
                <div className="mt-4 p-3 bg-white/5 border border-[#00ffcc]/30 rounded space-y-2">
                  <label className="text-[9px] text-[#00ffcc] font-bold uppercase block">Select Target Character:</label>
                  <select
                    value={selectedTarget || ''}
                    onChange={(e) => handleTargetSelect(e.target.value)}
                    className="w-full p-1.5 text-[10px] bg-black/50 border border-[#00ffcc]/50 text-white rounded focus:border-[#00ffcc] focus:outline-none"
                  >
                    <option value="">Choose a character...</option>
                    {availableTargets.map(node => (
                      <option key={node.id} value={node.id}>{node.id}</option>
                    ))}
                  </select>

                  {selectedTarget && (
                    <div className="mt-3 pt-3 border-t border-[#00ffcc]/20 space-y-2">
                      {predictLoading ? (
                        <div className="text-center py-2">
                          <div className="animate-spin w-3 h-3 border border-[#00ffcc] border-t-transparent rounded-full mx-auto mb-1"></div>
                          <p className="text-[8px] text-[#00ffcc] animate-pulse">Analyzing relationship...</p>
                        </div>
                      ) : prediction ? (
                        <div className="bg-[#00ffcc]/10 border border-[#00ffcc]/50 rounded p-2">
                          <p className="text-[8px] text-[#00ffcc] uppercase font-bold mb-1">🤖 AI Prediction:</p>
                          <p className="text-[10px] text-white font-bold">{prediction.predicted_relationship}</p>
                          <p className="text-[8px] text-gray-400 mt-1">Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
                        </div>
                      ) : (
                        mlReady && <p className="text-[8px] text-gray-500 italic">No prediction available</p>
                      )}

                      <label className="text-[9px] text-[#00ffcc] font-bold uppercase block pt-2">Relationship Type:</label>
                      <input
                        type="text"
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        placeholder="e.g., knows, is parent of, betrays..."
                        className="w-full p-1.5 text-[10px] bg-black/50 border border-[#ff0055]/50 text-white rounded focus:border-[#ff0055] focus:outline-none placeholder-gray-600"
                      />

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleAddConnection}
                          disabled={!customLabel}
                          className="flex-1 py-1 px-2 text-[9px] bg-[#00ffcc]/20 border border-[#00ffcc] text-[#00ffcc] rounded hover:bg-[#00ffcc]/30 transition-colors font-bold uppercase disabled:opacity-50"
                        >
                          ✓ Link
                        </button>
                        <button
                          onClick={() => {
                            setShowAddConnection(false);
                            setSelectedTarget(null);
                            setCustomLabel('');
                            setPrediction(null);
                          }}
                          className="flex-1 py-1 px-2 text-[9px] bg-red-500/20 border border-red-500 text-red-400 rounded hover:bg-red-500/30 transition-colors font-bold uppercase"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-[#00ffcc] mb-3 text-[10px] tracking-widest uppercase font-bold border-l-2 border-[#00ffcc] pl-2 text-left">
                Mission History
              </h3>
              <ul className="space-y-2 text-left">
                {dossierData?.notable_events?.map((event, index) => (
                  <li key={index} className="text-[11px] text-gray-400 relative pl-3 leading-relaxed">
                    <span className="absolute left-0 top-1.5 w-1 h-1 bg-[#00ffcc] rounded-full"></span>
                    <ReactMarkdown>{event}</ReactMarkdown>
                  </li>
                )) || <li className="text-gray-600 italic text-[10px]">No events recorded.</li>}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default DossierPanel;
