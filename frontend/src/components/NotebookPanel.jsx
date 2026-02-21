import React, { useState } from 'react';

const NotebookPanel = ({ onAnalyze, loading }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onAnalyze(text);
    }
  };

  return (
    <div className="absolute bottom-5 left-5 z-10 text-white font-mono bg-[rgba(0,0,5,0.8)] p-5 border border-[#00ffcc] rounded-lg shadow-[0_0_15px_rgba(0,255,204,0.3)] w-75">
      <h2 className="text-[#00ffcc] mb-2 text-sm tracking-widest flex items-center">
        📖 DETECTIVE'S NOTEBOOK
      </h2>
      <textarea
        className="w-full h-40 bg-black border border-gray-700 rounded p-2 text-sm text-gray-300 focus:border-[#00ffcc] focus:outline-none transition-colors resize-none"
        placeholder="Paste lore, character dialogue, or wiki text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className={`flex-1 py-2 px-4 rounded font-bold text-xs transition-all duration-300 ${
            loading || !text.trim()
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-[#00ffcc] text-black cursor-pointer hover:bg-[#00cca3] active:scale-95"
          }`}
        >
          {loading ? "PROCESSING..." : "ANALYZE TEXT"}
        </button>
        <button
          onClick={() => setText('')}
          className="px-3 border border-gray-600 rounded text-gray-400 hover:text-white hover:border-white transition-colors text-xs"
        >
          CLEAR
        </button>
      </div>
      <p className="mt-2 text-[10px] text-gray-500 italic">
        Tip: Paste relationships like "X is the father of Y" for best results.
      </p>
    </div>
  );
};

export default NotebookPanel;
