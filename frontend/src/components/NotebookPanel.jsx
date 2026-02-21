import React, { useState } from 'react';

const NotebookPanel = ({ onAnalyze, onGutenbergSearch, loading }) => {
  const [activeTab, setActiveTab] = useState('notebook');
  const [text, setText] = useState('');
  const [bookId, setBookId] = useState('');
  const [scanDepth, setScanDepth] = useState('5000'); // Default to Fast Scan

  const handleTextSubmit = () => {
    if (text.trim()) onAnalyze(text);
  };

  const handleBookSubmit = () => {
    if (bookId.trim()) {
      // Pass both ID and the character limit
      onGutenbergSearch(bookId, parseInt(scanDepth));
    }
  };

  return (
    <div className="absolute bottom-5 left-5 z-10 text-white font-mono bg-[rgba(0,0,5,0.85)] border border-[#00ffcc] rounded-lg shadow-[0_0_20px_rgba(0,255,204,0.3)] w-[320px] overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-[#00ffcc]/20 bg-black/40">
        <button 
          onClick={() => setActiveTab('notebook')}
          className={`flex-1 py-3 text-[10px] font-bold tracking-widest transition-colors ${activeTab === 'notebook' ? 'bg-[#00ffcc]/10 text-[#00ffcc] border-b-2 border-[#00ffcc]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          NOTEBOOK
        </button>
        <button 
          onClick={() => setActiveTab('gutenberg')}
          className={`flex-1 py-3 text-[10px] font-bold tracking-widest transition-colors ${activeTab === 'gutenberg' ? 'bg-[#00ffcc]/10 text-[#00ffcc] border-b-2 border-[#00ffcc]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          GLOBAL LIBRARY
        </button>
      </div>

      <div className="p-5">
        {activeTab === 'notebook' ? (
          <div>
            <textarea
              className="w-full h-40 bg-black border border-gray-800 rounded p-3 text-xs text-gray-300 focus:border-[#00ffcc] focus:outline-none transition-colors resize-none mb-3"
              placeholder="Paste lore or dialogue here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleTextSubmit}
                disabled={loading || !text.trim()}
                className={`flex-1 py-2 rounded font-bold text-[10px] transition-all ${
                  loading || !text.trim() ? "bg-gray-800 text-gray-600" : "bg-[#00ffcc] text-black hover:bg-[#00cca3]"
                }`}
              >
                {loading ? "PROCESSING..." : "ANALYZE TEXT"}
              </button>
              <button onClick={() => setText('')} className="px-3 border border-gray-800 text-gray-500 text-[10px] hover:text-white rounded">CLEAR</button>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-[10px] text-gray-400 mb-4 leading-relaxed italic">
              Access the multiversal archives by Book ID. Select scan depth for accuracy.
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-[#00ffcc] uppercase tracking-tighter">Target Book ID:</label>
                <input 
                  type="text" 
                  placeholder="e.g. 84 (Frankenstein)" 
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  className="bg-black border border-gray-800 rounded px-3 py-2 text-xs text-[#00ffcc] focus:border-[#00ffcc] outline-none w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-[#00ffcc] uppercase tracking-tighter">Scan Depth:</label>
                <select 
                  value={scanDepth}
                  onChange={(e) => setScanDepth(e.target.value)}
                  className="bg-black border border-gray-800 rounded px-2 py-2 text-xs text-[#00ffcc] focus:border-[#00ffcc] outline-none w-full cursor-pointer"
                >
                  <option value="5000">Fast Scan (~5k chars)</option>
                  <option value="25000">Standard Scan (~25k chars)</option>
                  <option value="100000">Deep Space Scan (~100k chars)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleBookSubmit}
              disabled={loading || !bookId.trim()}
              className={`w-full py-2 rounded font-bold text-[10px] transition-all ${
                loading || !bookId.trim() ? "bg-gray-800 text-gray-600" : "bg-[#00ffcc] text-black hover:bg-[#00cca3]"
              }`}
            >
              {loading ? "COMMUNING WITH ARCHIVES..." : "INITIATE QUANTUM SYNC"}
            </button>

            <div className="mt-4 text-[9px] text-gray-500 bg-black/30 p-2 rounded border border-white/5">
              <p className="mb-1 text-gray-400">Library Samples:</p>
              <ul className="grid grid-cols-2 gap-x-2 gap-y-1 font-bold">
                <li>• 11: Alice</li>
                <li>• 84: Frankenstein</li>
                <li>• 42671: Pride</li>
                <li>• 1661: Holmes</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookPanel;
