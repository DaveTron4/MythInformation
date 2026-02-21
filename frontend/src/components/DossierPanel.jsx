import React from 'react';
import { apiService } from '../services/api-service';

const DossierPanel = ({ selectedNode, onClose }) => {
  if (!selectedNode) return null;



  return (
    <div className="absolute top-5 right-5 z-10 text-white font-mono bg-[rgba(0,0,10,0.9)] p-6 border border-[#ff0055] rounded-lg w-80 shadow-[0_0_20px_rgba(255,0,85,0.4)] animate-slide-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[#ff0055] mb-1 text-lg tracking-widest">
            📂 CASE FILE
          </h2>
          <h1 className="m-0 text-2xl uppercase font-bold">
            {selectedNode.id}
          </h1>
        </div>
        <button 
          onClick={onClose}
          className="bg-none border-none text-[#ff0055] text-xl cursor-pointer hover:scale-110 transition-transform"
        >
          ✕
        </button>
      </div>

      <hr className="border-[#333] my-4" />

      <div className="mb-5">
        <p className="text-[#00ffcc] mb-1 text-xs uppercase">Status:</p>
        <p className="m-0">Active Investigation</p>
      </div>

      <div className="mb-5">
        <p className="text-[#00ffcc] mb-1 text-xs uppercase">Intel:</p>
        <p className="text-gray-300 leading-relaxed text-sm">
          This entity was detected in the processed lore. 
          The graph highlights its direct connections to other primary actors in the narrative.
        </p>
      </div>

      <button 
        className="w-full bg-transparent border border-[#ff0055] text-[#ff0055] p-2 cursor-pointer font-bold transition-all text-xs hover:bg-[#ff0055] hover:text-black"
      >
        GENERATE AI SUMMARY
      </button>
    </div>
  );
};

export default DossierPanel;
