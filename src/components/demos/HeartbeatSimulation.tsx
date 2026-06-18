import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeartbeatSimulation() {
  const [nodes, setNodes] = useState([
    { id: 1, active: true, missedBeats: 0, workloads: ['my-app-web', 'postgres-db'] },
    { id: 2, active: true, missedBeats: 0, workloads: ['redis-cache'] },
    { id: 3, active: true, missedBeats: 0, workloads: [] },
  ]);

  const [logs, setLogs] = useState<string[]>(['System initialized. Nodes 1, 2, 3 active.']);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `> [${new Date().toLocaleTimeString()}] ${msg}`].slice(-5));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((currentNodes) => {
        let changed = false;
        const newNodes = currentNodes.map(node => {
          if (!node.active) {
            if (node.missedBeats < 3) {
              changed = true;
              return { ...node, missedBeats: node.missedBeats + 1 };
            }
          }
          return node;
        });

        if (changed) return newNodes;

        const deadNodes = newNodes.filter(n => n.missedBeats === 3 && n.workloads.length > 0);
        if (deadNodes.length > 0) {
          const result = [...newNodes];
          deadNodes.forEach(dead => {
            const alive = result.filter(n => n.active);
            if (alive.length > 0) {
              // Primitive load balancer: sort by workload count ascending to pick the emptiest node
              alive.sort((a, b) => a.workloads.length - b.workloads.length);
              const target = alive[0]; 
              const targetIdx = result.findIndex(n => n.id === target.id);
              const deadIdx = result.findIndex(n => n.id === dead.id);
              
              result[targetIdx] = { ...target, workloads: [...target.workloads, ...dead.workloads] };
              result[deadIdx] = { ...dead, workloads: [] };
              
              setTimeout(() => {
                 addLog(`Node 0${dead.id} missed 3 heartbeats. Marking offline.`);
                 addLog(`Rescheduling workloads to Node 0${target.id}.`);
              }, 0);
            }
          });
          return result;
        }

        return currentNodes;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const killNode = (id: number) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, active: false } : n));
    addLog(`Node 0${id} simulated crash. Network severed.`);
  };

  const resetSimulation = () => {
    setNodes([
      { id: 1, active: true, missedBeats: 0, workloads: ['my-app-web', 'postgres-db'] },
      { id: 2, active: true, missedBeats: 0, workloads: ['redis-cache'] },
      { id: 3, active: true, missedBeats: 0, workloads: [] },
    ]);
    addLog('Simulation reset.');
  };

  return (
    <div className="not-prose my-10 font-mono text-[13px] text-muted-foreground w-full">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6 border-b border-border pb-2">
        <h3 className="text-foreground font-bold flex items-center gap-2">
          <span className="text-green-500 opacity-80">~</span>
          <span>./demo-reconciliation.sh</span>
        </h3>
        <button 
          onClick={resetSimulation} 
          className="text-xs hover:text-foreground hover:bg-muted px-2 py-1 transition-colors"
        >
          [restart]
        </button>
      </div>

      <div className="flex flex-col items-center w-full mb-8 relative">
        
        {/* Control Plane */}
        <div className="w-48 p-4 border border-foreground bg-background text-center z-10 relative">
          <div className="font-bold text-foreground mb-1 tracking-wide">CONTROL_PLANE</div>
          <div className="text-[11px] text-muted-foreground uppercase">State & Scheduler</div>
        </div>

        {/* Tree Connection Lines */}
        <div className="w-full relative flex flex-col items-center h-12">
          {/* Vertical line from Control Plane */}
          <div className="w-[1px] h-6 bg-border relative z-0"></div>
          {/* Horizontal line spanning centers (using grid mapping) */}
          <div className="w-[66.66%] h-[1px] bg-border relative z-0">
             {/* Left vertical drop */}
             <div className="absolute left-0 top-0 w-[1px] h-6 bg-border"></div>
             {/* Center vertical drop */}
             <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[1px] h-6 bg-border"></div>
             {/* Right vertical drop */}
             <div className="absolute right-0 top-0 w-[1px] h-6 bg-border"></div>
          </div>
        </div>

        {/* Nodes */}
        <div className="grid grid-cols-3 w-full gap-4 z-10">
          {nodes.map(node => (
            <div 
              key={node.id} 
              className={`relative p-4 border flex flex-col items-center transition-all duration-300 ${
                node.active 
                  ? 'border-border bg-background' 
                  : 'border-red-500/50 bg-red-500/5 opacity-80'
              }`}
            >
              
              {/* Heartbeat Indicator matching the vertical drop */}
              {node.active && (
                <div className="absolute -top-12 flex justify-center w-full h-12 overflow-hidden pointer-events-none z-20">
                  <motion.div 
                    className="w-[3px] h-[3px] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                    animate={{ y: [48, 0], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear", delay: node.id * 0.2 }}
                  />
                </div>
              )}
              
              <div className={`font-bold mb-4 tracking-wide text-center ${node.active ? 'text-foreground' : 'text-red-500 line-through decoration-red-500/50'}`}>
                WORKER_0{node.id}
              </div>

              <div className="flex flex-col gap-2 w-full min-h-[70px]">
                <AnimatePresence mode="popLayout">
                  {node.workloads.map(wl => (
                    <motion.div 
                      key={wl}
                      layoutId={`wl-${wl}`}
                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="w-full py-1.5 px-2 bg-muted border border-border text-[11px] text-foreground truncate text-center"
                    >
                      {wl}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {node.active ? (
                <button 
                  onClick={() => killNode(node.id)}
                  className="mt-6 px-3 py-1.5 text-red-500 hover:text-background hover:bg-red-500 border border-red-500/30 text-[11px] transition-colors w-full uppercase tracking-wider"
                >
                  Kill Node
                </button>
              ) : (
                <div className="mt-6 px-3 py-1.5 text-red-500/50 text-[11px] w-full text-center uppercase tracking-wider">
                  Offline
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="border border-border bg-background p-4 flex flex-col gap-1 min-h-[100px]">
        {logs.map((log, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -5 }} 
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-2 ${
              log.includes('Offline') || log.includes('crash') 
                ? 'text-red-500' 
                : log.includes('Rescheduling') 
                  ? 'text-foreground' 
                  : 'text-muted-foreground'
            }`}
          >
            <span className={log.includes('Offline') || log.includes('crash') ? 'text-red-500' : 'text-green-500'}>$</span>
            <span>{log}</span>
          </motion.div>
        ))}
        {/* Blinking cursor */}
        <motion.div 
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="w-2 h-3.5 bg-green-500 ml-5 mt-1"
        />
      </div>
    </div>
  );
}
