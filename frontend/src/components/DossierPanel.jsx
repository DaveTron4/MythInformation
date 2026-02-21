import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiService } from '../services/api-service';

const DossierPanel = ({ selectedNode, allLinks, onClose }) => {
  if (!selectedNode) return null;

  const [dossierData, setDossierData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        setLoading(true);
        const data = await apiService.getCharacterDossier(selectedNode.id, selectedNode.work);
        setDossierData(data);
      } catch (error) {
        console.error("Error fetching dossier:", error);
        setDossierData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDossier();
  }, [selectedNode]);

  const localConnections = (allLinks || []).filter(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    return sourceId === selectedNode.id || targetId === selectedNode.id;
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
