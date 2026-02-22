import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import * as d3 from 'd3-force';
import { apiService } from './services/api-service';
import DossierPanel from './components/DossierPanel';
import NotebookPanel from './components/NotebookPanel';
import ErrorBoundary from './components/ErrorBoundary';
import AuthModal from './components/AuthModal';
import SaveAnalysisModal from './components/SaveAnalysisModal';
import SavedAnalysesPanel from './components/SavedAnalysesPanel';
import { useAuth } from './contexts/AuthContext';

const COLOR_PALETTE = ["#00ffcc", "#ff0055", "#0077ff", "#ffcc00", "#9900ff", "#ff6600", "#00ff00", "#ffffff"];

function App() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workMeta, setWorkMeta] = useState({});
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadPanel, setShowLoadPanel] = useState(false);
  const { user, isAuthenticated, logout, token } = useAuth();

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mergeGraphData = useCallback((newData) => {
    setWorkMeta(prevMeta => {
      const updatedMeta = { ...prevMeta };
      let colorIdx = Object.keys(updatedMeta).length;
      newData.nodes.forEach(node => {
        if (!updatedMeta[node.work]) {
          updatedMeta[node.work] = {
            color: COLOR_PALETTE[colorIdx % COLOR_PALETTE.length],
            center: { x: (Math.random() - 0.5) * 1500, y: (Math.random() - 0.5) * 1500, z: (Math.random() - 0.5) * 1500 }
          };
          colorIdx++;
        }
      });
      return updatedMeta;
    });

    setGraphData(prevData => {
      const nodeMap = new Map();
      prevData.nodes.forEach(n => nodeMap.set(n.id, { ...n, works: new Set(n.workList || [n.work]) }));
      newData.nodes.forEach(node => {
        if (nodeMap.has(node.id)) {
          const existing = nodeMap.get(node.id);
          existing.works.add(node.work);
          existing.size = Math.max(existing.size, node.size);
        } else {
          nodeMap.set(node.id, { ...node, works: new Set([node.work]) });
        }
      });
      const finalNodes = Array.from(nodeMap.values()).map(n => ({ ...n, workList: Array.from(n.works) }));
      const linkKey = (l) => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        return `${s}-${t}-${l.label}`;
      };
      const existingLinkKeys = new Set(prevData.links.map(linkKey));
      const newLinks = [...prevData.links.map(l => ({ source: l.source.id || l.source, target: l.target.id || l.target, label: l.label }))];
      newData.links.forEach(link => {
        const key = `${link.source}-${link.target}-${link.label}`;
        if (!existingLinkKeys.has(key)) newLinks.push({ source: link.source, target: link.target, label: link.label });
      });
      return { nodes: finalNodes, links: newLinks };
    });
  }, []);

  const starField = useMemo(() => {
    const vertices = [];
    for (let i = 0; i < 20000; i++) vertices.push(THREE.MathUtils.randFloatSpread(10000), THREE.MathUtils.randFloatSpread(10000), THREE.MathUtils.randFloatSpread(10000));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.8 }));
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      const scene = fgRef.current.scene();
      if (!scene.getObjectByName('starfield')) { starField.name = 'starfield'; scene.add(starField); }
      fgRef.current.camera().far = 100000;
      fgRef.current.camera().updateProjectionMatrix();
      fgRef.current.d3Force('charge').strength(-300).distanceMax(500);
      fgRef.current.d3Force('collide', d3.forceCollide(node => (node.size || 5) + 15));
      fgRef.current.d3Force('cluster', (alpha) => {
        graphData.nodes.forEach(node => {
          if (!node.workList) return;
          let avgX = 0, avgY = 0, avgZ = 0;
          node.workList.forEach(w => { const m = workMeta[w]; if (m) { avgX += m.center.x; avgY += m.center.y; avgZ += m.center.z; } });
          avgX /= node.workList.length; avgY /= node.workList.length; avgZ /= node.workList.length;
          node.vx += (avgX - node.x) * alpha * 0.08;
          node.vy += (avgY - node.y) * alpha * 0.08;
          node.vz += (avgZ - node.z) * alpha * 0.08;
        });
      });
    }
  }, [graphData, workMeta, starField]);

  const handleCustomAnalyze = async (text) => {
    setLoading(true);
    setError(null);
    try {
      if (!text.trim()) {
        setError("Text cannot be empty");
        return;
      }
      if (text.length > 50000) {
        setError("Text exceeds maximum length of 50,000 characters");
        return;
      }
      const data = await apiService.analyzeLore(text);
      mergeGraphData(data);
    } catch (e) {
      console.error("Analysis failed:", e);
      setError(e.response?.data?.detail || e.message || "Failed to analyze text. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGutenbergSearch = async (bookId, limitChars) => {
    setLoading(true);
    setError(null);
    try {
      if (!bookId.trim()) {
        setError("Book ID cannot be empty");
        return;
      }
      const data = await apiService.analyzeGutenberg(bookId, limitChars);
      mergeGraphData(data);
    } catch (e) {
      console.error("Gutenberg search failed:", e);
      setError(e.response?.data?.detail || e.message || "Failed to fetch or analyze book. Ensure the ID is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback(node => {
    const distance = 150;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    fgRef.current.cameraPosition({ x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, node, 2000);
    setSelectedNode(node);
  }, [fgRef]);

  const handleDeleteSystem = (systemName) => {
    setWorkMeta(prevMeta => {
      const newMeta = { ...prevMeta };
      delete newMeta[systemName];
      return newMeta;
    });

    setGraphData(prevData => {
      // Filter nodes: keep only those that have other systems, or remove completely if only this system
      const newNodes = prevData.nodes
        .filter(node => {
          const remaining = (node.workList || [node.work]).filter(w => w !== systemName);
          return remaining.length > 0;
        })
        .map(node => {
          const remaining = (node.workList || [node.work]).filter(w => w !== systemName);
          return { ...node, workList: remaining };
        });

      // Filter links: keep only those where both source and target nodes exist
      const nodeIds = new Set(newNodes.map(n => n.id));
      const newLinks = prevData.links
        .filter(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return nodeIds.has(sourceId) && nodeIds.has(targetId);
        })
        .map(link => ({
          ...link,
          source: typeof link.source === 'object' ? link.source.id : link.source,
          target: typeof link.target === 'object' ? link.target.id : link.target
        }));

      return { nodes: newNodes, links: newLinks };
    });
  };

  const handleLoadAnalysis = (analysis) => {
    const nodes = analysis.nodes || [];
    let links = analysis.links || [];
    
    // Ensure links have proper source/target references
    // Links from database may have source/target as IDs, need to reference node objects
    const nodeMap = new Map();
    nodes.forEach(node => nodeMap.set(node.id, node));
    
    links = links.map(link => ({
      ...link,
      source: typeof link.source === 'string' ? link.source : link.source?.id || link.source,
      target: typeof link.target === 'string' ? link.target : link.target?.id || link.target
    }));
    
    // Load nodes and links
    setGraphData({
      nodes,
      links
    });
    
    // Load work metadata
    setWorkMeta(analysis.work_meta || {});
  };

  const systemShells = useMemo(() => {
    return Object.entries(workMeta).map(([workName, meta]) => {
      const nodesInSystem = graphData.nodes.filter(n => n.workList?.includes(workName));
      if (nodesInSystem.length === 0) return null;
      return { name: workName, color: meta.color, center: meta.center, radius: 120 + (nodesInSystem.length * 15) };
    }).filter(s => s !== null);
  }, [graphData, workMeta]);

  return (
    <div className="fixed inset-0 bg-[#000205] text-white font-mono overflow-hidden text-center">
      {error && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-50 p-4 border border-red-500 rounded-lg bg-black/95 shadow-[0_0_20px_rgba(255,0,0,0.5)] max-w-sm">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl shrink-0">⚠️</span>
            <div className="text-left">
              <p className="text-red-400 text-[11px] font-bold uppercase tracking-widest mb-1">Error</p>
              <p className="text-gray-300 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-gray-500 hover:text-white shrink-0">✕</button>
          </div>
        </div>
      )}
      
      <div className="absolute top-5 left-5 z-20 p-5 border border-[#00ffcc] rounded-lg bg-black/90 shadow-[0_0_20px_rgba(0,255,204,0.3)] w-[320px]">
        <h1 className="m-0 text-[#00ffcc] text-2xl font-bold tracking-tighter italic border-b border-[#00ffcc]/30 pb-2 mb-3 text-center">MYTH INFORMATION</h1>
        <div className="p-2 bg-black/50 rounded border border-[#00ffcc]/20 mb-3 overflow-hidden text-left">
          <p className="text-[9px] text-[#00ffcc] mb-2 tracking-widest uppercase italic font-bold">Galaxies Synced:</p>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {Object.keys(workMeta).map(name => (
              <div key={name} className="flex items-center gap-1 text-[8px] px-2 py-0.5 rounded-full border" style={{ color: workMeta[name].color, borderColor: workMeta[name].color + '55', background: workMeta[name].color + '11' }}>
                <span className="truncate max-w-20">{name}</span>
                <button 
                  onClick={() => handleDeleteSystem(name)}
                  className="hover:text-red-400 transition-colors shrink-0 font-bold text-[9px]"
                  title="Delete system"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          {isAuthenticated && (
            <>
              <button 
                onClick={() => setShowSaveModal(true)}
                disabled={graphData.nodes.length === 0}
                className="w-full py-1.5 px-2 border border-[#00ffcc] text-[#00ffcc] text-[9px] font-bold hover:bg-[#00ffcc]/10 transition-all uppercase rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Save Analysis
              </button>
              <button 
                onClick={() => setShowLoadPanel(true)}
                className="w-full py-1.5 px-2 border border-blue-500 text-blue-500 text-[9px] font-bold hover:bg-blue-500/10 transition-all uppercase rounded"
              >
                📂 Load Analysis
              </button>
            </>
          )}
          <button onClick={() => { setGraphData({ nodes: [], links: [] }); setWorkMeta({}); }} className="w-full py-1.5 px-2 border border-red-500 text-red-500 text-[9px] font-bold hover:bg-red-500/10 transition-all uppercase rounded">Purge Galaxy</button>
        </div>
      </div>

      <NotebookPanel onAnalyze={handleCustomAnalyze} onGutenbergSearch={handleGutenbergSearch} loading={loading} />
      <DossierPanel selectedNode={selectedNode} allLinks={graphData.links} onClose={() => setSelectedNode(null)} />

      {/* Auth Button - Bottom Right */}
      <div className="absolute bottom-5 right-5 z-20">
        {isAuthenticated ? (
          <div className="flex flex-col items-end gap-2">
            <div className="px-3 py-1 bg-black/80 border border-[#00ffcc]/30 rounded text-[10px] text-[#00ffcc]">
              Agent: <span className="font-bold">{user?.username}</span>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2 border border-red-500 text-red-500 rounded font-bold text-sm uppercase tracking-wider hover:bg-red-500/10 transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)]"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-2 border border-[#00ffcc] text-[#00ffcc] rounded font-bold text-sm uppercase tracking-wider hover:bg-[#00ffcc]/10 transition-all shadow-[0_0_10px_rgba(0,255,204,0.3)]"
          >
            Login
          </button>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Save Analysis Modal */}
      <SaveAnalysisModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)}
        graphData={graphData}
        workMeta={workMeta}
      />

      {/* Saved Analyses Panel */}
      <SavedAnalysesPanel
        isOpen={showLoadPanel}
        onClose={() => setShowLoadPanel(false)}
        onLoad={handleLoadAnalysis}
      />

      <ForceGraph3D
        ref={fgRef} width={dimensions.width} height={dimensions.height}
        graphData={graphData}
        nodeThreeObject={node => {
          const group = new THREE.Group();
          const starSize = node.size || 5;
          const works = node.workList || [node.work];
          const colors = works.map(w => workMeta[w]?.color || '#ffffff');
          const core = new THREE.Mesh(new THREE.SphereGeometry(starSize * 0.5), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
          group.add(core);
          const segmentAngle = (Math.PI * 2) / colors.length;
          colors.forEach((color, i) => {
            const corona = new THREE.Mesh(new THREE.SphereGeometry(starSize, 32, 32, i * segmentAngle, segmentAngle), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }));
            group.add(corona);
          });
          return group;
        }}
        nodeLabel={node => `
          <div class="bg-black/95 p-3 border border-[#00ffcc] text-[10px] font-mono text-left shadow-2xl">
            <div class="text-[#00ffcc] font-bold border-b border-[#00ffcc]/30 mb-2 pb-1 uppercase tracking-tighter">${node.id}</div>
            <div class="text-gray-500 text-[8px] mb-1 tracking-widest uppercase">System Affinity:</div>
            ${(node.workList || [node.work]).map(w => `<div class="flex items-center gap-2 mb-0.5"><div class="w-1.5 h-1.5 rounded-full" style="background: ${workMeta[w]?.color || '#fff'}"></div><span class="text-gray-300 font-bold">${w}</span></div>`).join('')}
          </div>
        `}
        customLayerData={systemShells}
        customLayerThreeObject={(shell) => new THREE.Mesh(new THREE.SphereGeometry(shell.radius, 24, 24), new THREE.MeshBasicMaterial({ color: shell.color, wireframe: true, transparent: true, opacity: 0.03 }))}
        customLayerThreeObjectUpdate={(mesh, shell) => mesh.position.set(shell.center.x, shell.center.y, shell.center.z)}
        linkWidth={1.5} linkColor={() => '#ffffff'} linkOpacity={0.1}
        onNodeClick={handleNodeClick} backgroundColor="#000205"
      />
    </div>
  );
}

export default App;
