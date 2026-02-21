import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import * as d3 from 'd3-force'; // Import d3-force specifically
import { apiService } from './services/api-service';
import DossierPanel from './components/DossierPanel';
import NotebookPanel from './components/NotebookPanel';

const COLOR_PALETTE = ["#00ffcc", "#ff0055", "#0077ff", "#ffcc00", "#9900ff", "#ff6600", "#00ff00", "#ffffff"];

function App() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workMeta, setWorkMeta] = useState({});
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

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
            center: { x: (Math.random() - 0.5) * 1200, y: (Math.random() - 0.5) * 1200, z: (Math.random() - 0.5) * 1200 }
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

      const finalNodes = Array.from(nodeMap.values()).map(n => ({
        ...n,
        workList: Array.from(n.works)
      }));

      const linkKey = (l) => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        return `${s}-${t}-${l.label}`;
      };
      
      const existingLinkKeys = new Set(prevData.links.map(linkKey));
      const newLinks = [...prevData.links.map(l => ({
        source: typeof l.source === 'object' ? l.source.id : l.source,
        target: typeof l.target === 'object' ? l.target.id : l.target,
        label: l.label
      }))];

      newData.links.forEach(link => {
        const key = `${link.source}-${link.target}-${link.label}`;
        if (!existingLinkKeys.has(key)) {
          newLinks.push({ source: link.source, target: link.target, label: link.label });
        }
      });

      return { nodes: finalNodes, links: newLinks };
    });
  }, []);

  const starField = useMemo(() => {
    const vertices = [];
    for (let i = 0; i < 20000; i++) {
      vertices.push(THREE.MathUtils.randFloatSpread(10000), THREE.MathUtils.randFloatSpread(10000), THREE.MathUtils.randFloatSpread(10000));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.8 }));
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      const scene = fgRef.current.scene();
      if (!scene.getObjectByName('starfield')) {
        starField.name = 'starfield';
        scene.add(starField);
      }
      fgRef.current.camera().far = 100000;
      fgRef.current.camera().updateProjectionMatrix();

      // Fix: Use imported d3-force module
      fgRef.current.d3Force('charge').strength(-300).distanceMax(500);
      fgRef.current.d3Force('collide', d3.forceCollide(node => (node.size || 5) + 15));

      fgRef.current.d3Force('cluster', (alpha) => {
        graphData.nodes.forEach(node => {
          if (!node.workList) return;
          let avgX = 0, avgY = 0, avgZ = 0;
          node.workList.forEach(workName => {
            const meta = workMeta[workName];
            if (meta) {
              avgX += meta.center.x; avgY += meta.center.y; avgZ += meta.center.z;
            }
          });
          avgX /= node.workList.length; avgY /= node.workList.length; avgZ /= node.workList.length;
          
          node.vx += (avgX - node.x) * alpha * 0.04;
          node.vy += (avgY - node.y) * alpha * 0.04;
          node.vz += (avgZ - node.z) * alpha * 0.04;
        });
      });
    }
  }, [graphData, workMeta, starField]);

  const handleCustomAnalyze = async (text) => {
    setLoading(true);
    try {
      const data = await apiService.analyzeLore(text);
      mergeGraphData(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleNodeClick = useCallback(node => {
    const distance = 150;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    fgRef.current.cameraPosition({ x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, node, 2000);
    setSelectedNode(node);
  }, [fgRef]);

  const systemShells = useMemo(() => {
    return Object.entries(workMeta).map(([workName, meta]) => {
      const nodesInSystem = graphData.nodes.filter(n => n.workList?.includes(workName));
      if (nodesInSystem.length === 0) return null;
      return { name: workName, color: meta.color, center: meta.center, radius: 120 + (nodesInSystem.length * 15) };
    }).filter(s => s !== null);
  }, [graphData, workMeta]);

  return (
    <div className="fixed inset-0 bg-[#000205] text-white font-mono overflow-hidden">
      <div className="absolute top-5 left-5 z-20 p-5 border border-[#00ffcc] rounded-lg bg-black/90 shadow-[0_0_20px_rgba(0,255,204,0.3)] w-[320px]">
        <h1 className="m-0 text-[#00ffcc] text-2xl font-bold tracking-tighter italic border-b border-[#00ffcc]/30 pb-2 mb-3 text-center">MYTH INFORMATION</h1>
        <div className="p-2 bg-black/50 rounded border border-[#00ffcc]/20 mb-3 overflow-hidden">
          <p className="text-[9px] text-[#00ffcc] mb-2 tracking-widest uppercase italic font-bold">Quantum Sync:</p>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {Object.keys(workMeta).map(name => (
              <span key={name} className="text-[8px] px-2 py-0.5 rounded-full border truncate" style={{ color: workMeta[name].color, borderColor: workMeta[name].color + '55', background: workMeta[name].color + '11' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setGraphData({ nodes: [], links: [] }); setWorkMeta({}); }} className="flex-1 py-1.5 px-2 border border-red-500 text-red-500 text-[9px] font-bold hover:bg-red-500/10 transition-all uppercase rounded">Purge</button>
          <button onClick={async () => mergeGraphData(await apiService.analyzeBook(2000))} disabled={loading} className="flex-1 py-1.5 px-2 border border-[#00ffcc] text-[#00ffcc] text-[9px] font-bold hover:bg-[#00ffcc]/10 transition-all uppercase rounded text-center">Add Dracula</button>
        </div>
      </div>

      <NotebookPanel onAnalyze={handleCustomAnalyze} loading={loading} />
      <DossierPanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />

      <ForceGraph3D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeThreeObject={node => {
          const group = new THREE.Group();
          const starSize = node.size || 5;
          const works = node.workList || [node.work];
          const colors = works.map(w => workMeta[w]?.color || '#ffffff');
          
          const core = new THREE.Mesh(new THREE.SphereGeometry(starSize * 0.5), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
          group.add(core);

          const numColors = colors.length;
          const segmentAngle = (Math.PI * 2) / numColors;

          colors.forEach((color, i) => {
            const corona = new THREE.Mesh(
              new THREE.SphereGeometry(starSize, 32, 32, i * segmentAngle, segmentAngle),
              new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 })
            );
            group.add(corona);
          });
          
          return group;
        }}
        nodeLabel={node => `
          <div class="bg-black/95 p-3 border border-[#00ffcc] text-[10px] font-mono">
            <div class="text-[#00ffcc] font-bold border-b border-[#00ffcc]/30 mb-1 pb-1">${node.id}</div>
            <div class="text-gray-400 uppercase text-[8px] mb-1 italic">Source Systems:</div>
            ${(node.workList || [node.work]).map(w => `<div class="flex items-center gap-1 font-bold" style="color:${workMeta[w]?.color}">${w}</div>`).join('')}
          </div>
        `}
        customLayerData={systemShells}
        customLayerThreeObject={(shell) => new THREE.Mesh(new THREE.SphereGeometry(shell.radius, 24, 24), new THREE.MeshBasicMaterial({ color: shell.color, wireframe: true, transparent: true, opacity: 0.03 }))}
        customLayerThreeObjectUpdate={(mesh, shell) => mesh.position.set(shell.center.x, shell.center.y, shell.center.z)}
        linkWidth={1.5}
        linkColor={() => '#ffffff'}
        linkOpacity={0.1}
        linkDirectionalParticles={2}
        onNodeClick={handleNodeClick}
        backgroundColor="#000205"
      />
    </div>
  );
}

export default App;
