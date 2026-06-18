import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManifestDriftDemo() {
  const [desired, setDesired] = useState(2);
  const [actual, setActual] = useState([{ id: 1 }, { id: 2 }]);
  const [nextId, setNextId] = useState(3);
  const [logs, setLogs] = useState<string[]>(['> System idle. Manifest desired state: 2 replicas']);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `> [${new Date().toLocaleTimeString()}] ${msg}`].slice(-5));
  };

  useEffect(() => {
    const t = setInterval(() => {
      setActual(current => {
        if (current.length < desired) {
           addLog(`Drift detected! Current: ${current.length}, Desired: ${desired}. Spinning up...`);
           const n = nextId;
           setNextId(nextId + 1);
           return [...current, { id: n }];
        } else if (current.length > desired) {
           addLog(`Drift detected! Current: ${current.length}, Desired: ${desired}. Terminating...`);
           return current.slice(0, desired);
        }
        return current;
      });
    }, 1500);
    return () => clearInterval(t);
  }, [desired, nextId]);

  const killContainer = (id: number) => {
    setActual(current => current.filter(c => c.id !== id));
    addLog(`[SSH] Admin manually killed container_0${id}`);
  };

  return (
    <div className="not-prose my-10 font-mono text-[13px] text-muted-foreground w-full">
      <div className="flex justify-between items-end mb-6 border-b border-border pb-2">
        <h3 className="text-foreground font-bold flex items-center gap-2">
          <span className="text-green-500 opacity-80">~</span>
          <span>./demo-manifest-drift.sh</span>
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full mb-8">
        {/* Manifest Editor */}
        <div className="flex-1 border border-border bg-background p-4 flex flex-col">
          <div className="font-bold text-foreground mb-4 tracking-wide border-b border-border pb-2">.msks (Git Source of Truth)</div>
          <div className="flex flex-col gap-1">
            <span className="text-blue-400">name:</span> <span className="text-green-400">"my-app"</span>
            <span className="text-blue-400">environments:</span>
            <span className="text-blue-400 pl-4">production:</span>
            <div className="flex items-center gap-2 pl-8 my-1">
               <span className="text-blue-400">replicas:</span>
               <span className="text-orange-400 font-bold">{desired}</span>
               <div className="flex gap-1 ml-4">
                 <button onClick={() => setDesired(Math.max(0, desired - 1))} className="border border-border px-2 hover:bg-muted transition-colors text-foreground">-</button>
                 <button onClick={() => setDesired(desired + 1)} className="border border-border px-2 hover:bg-muted transition-colors text-foreground">+</button>
               </div>
            </div>
            <span className="text-blue-400 pl-8">domain:</span> <span className="text-green-400">"api.myapp.com"</span>
          </div>
        </div>

        {/* Live Cluster */}
        <div className="flex-1 border border-border bg-background p-4">
          <div className="font-bold text-foreground mb-4 tracking-wide border-b border-border pb-2">Live Cluster (Actual State)</div>
          <div className="flex flex-wrap gap-3 min-h-[120px] content-start">
            <AnimatePresence mode="popLayout">
               {actual.map(c => (
                 <motion.div 
                   key={c.id}
                   layoutId={`container-${c.id}`}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="border border-green-500/50 bg-green-500/5 p-2 flex flex-col items-center gap-2 w-[100px]"
                 >
                   <div className="text-[10px] text-green-500 tracking-wider">CONTAINER</div>
                   <div className="text-foreground font-bold">0{c.id}</div>
                   <button 
                     onClick={() => killContainer(c.id)}
                     className="text-[10px] text-red-500 hover:bg-red-500 hover:text-background border border-red-500/30 w-full uppercase py-1 mt-1 transition-colors"
                   >
                     SSH Kill
                   </button>
                 </motion.div>
               ))}
            </AnimatePresence>
            {actual.length === 0 && <div className="text-muted-foreground/50 w-full text-center mt-8">No containers running.</div>}
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="border border-border bg-background p-4 flex flex-col gap-1 min-h-[140px]">
        {logs.map((log, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -5 }} 
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-2 ${log.includes('killed') ? 'text-red-500' : log.includes('Drift') ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <span className={log.includes('killed') ? 'text-red-500' : 'text-green-500'}>$</span>
            <span>{log}</span>
          </motion.div>
        ))}
        <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-2 h-3.5 bg-green-500 ml-5 mt-1" />
      </div>
    </div>
  );
}
