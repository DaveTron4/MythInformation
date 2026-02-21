import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { apiService } from './services/api-service';
import DossierPanel from './components/DossierPanel';
import NotebookPanel from './components/NotebookPanel';

function App() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // --- PROCEDURAL STARFIELD (No external images needed) ---
  const starField = useMemo(() => {
    const vertices = [];
    for (let i = 0; i < 5000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
      vertices.push(x, y, z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.8 });
    return new THREE.Points(geometry, material);
  }, []);

  const fetchDefaultLore = async () => {
    setLoading(true);
    try {
      const data = await apiService.analyzeBook(5000);
      setGraphData(data);
    } catch (error) {
      console.error("Error fetching lore:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultLore();
    if (fgRef.current) {
      fgRef.current.scene().add(starField);
    }
  }, [starField]);

  const handleCustomAnalyze = async (text) => {
    setLoading(true);
    try {
      const data = await apiService.analyzeLore(text);
      setGraphData(data);
    } catch (error) {
      console.error("Error analyzing custom lore:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback(node => {
    const distance = 80;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      2000
    );
    setSelectedNode(node);
  }, [fgRef]);

  return (
    <div className="w-screen h-screen bg-[#00050a] relative overflow-hidden text-white font-mono">
      {/* Top Left Header */}
      <div className="absolute top-5 left-5 z-10 p-5 border border-[#00ffcc] rounded-lg bg-[rgba(0,0,5,0.85)] shadow-[0_0_20px_rgba(0,255,204,0.2)] w-[300px]">
        <h1 className="m-0 text-[#00ffcc] text-2xl font-bold tracking-tighter italic">MYTH INFORMATION</h1>
        <p className="text-gray-400 mb-4 text-[10px] uppercase tracking-widest border-b border-[#00ffcc]/30 pb-2">Quantum Lore Analysis Interface</p>
        <button 
          onClick={fetchDefaultLore} 
          disabled={loading}
          className={`w-full py-2 px-4 rounded font-bold text-[10px] transition-all duration-300 border ${
            loading 
              ? "bg-gray-700 text-gray-500 border-transparent cursor-not-allowed" 
              : "bg-transparent text-[#00ffcc] border-[#00ffcc] cursor-pointer hover:bg-[#00ffcc] hover:text-black"
          }`}
        >
          {loading ? "INITIALIZING..." : "SYSTEM RESET: DRACULA"}
        </button>
      </div>

      <NotebookPanel onAnalyze={handleCustomAnalyze} loading={loading} />
      <DossierPanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />

      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        
        // --- CUSTOM NODE VISUALS (STARS) ---
        nodeThreeObject={node => {
          const group = new THREE.Group();
          
          // Core Star
          const core = new THREE.Mesh(
            new THREE.SphereGeometry(3),
            new THREE.MeshBasicMaterial({ color: '#ffffff' }) // White hot core
          );
          
          // Corona/Atmosphere (Color based on character importance or group)
          const glowColor = node.color || '#00ffcc';
          const corona = new THREE.Mesh(
            new THREE.SphereGeometry(5),
            new THREE.MeshBasicMaterial({ 
              color: glowColor, 
              transparent: true, 
              opacity: 0.4 
            })
          );
          
          group.add(core);
          group.add(corona);
          return group;
        }}

        // --- VISUAL POLISH ---
        nodeLabel={node => `<div class="bg-black/80 p-2 border border-[#00ffcc] text-[#00ffcc] font-mono text-xs">${node.id}</div>`}
        linkWidth={1}
        linkColor={() => '#ffffff'}
        linkOpacity={0.2}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleColor={() => '#00ffcc'}
        
        onNodeClick={handleNodeClick}
        backgroundColor="#000205"
      />
    </div>
  );
}

export default App;
