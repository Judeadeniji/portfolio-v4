import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ControlPlaneDemo() {
  const [cpActive, setCpActive] = useState(true);
  const [logs, setLogs] = useState<string[]>(['> System initialized. Control Plane online.']);
  const [requests, setRequests] = useState<{ id: number; ok: boolean }[]>([]);
  
  const cpActiveRef = useRef(true);
  const reqIdRef = useRef(0);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `> [${new Date().toLocaleTimeString()}] ${msg}`].slice(-5));
  };

  const toggleCp = () => {
    const newState = !cpActiveRef.current;
    cpActiveRef.current = newState;
    setCpActive(newState);
    if (newState) {
      addLog('Control Plane rebooted. API online.');
    } else {
      addLog('FATAL: Control Plane crashed (Simulated).');
    }
  };

  useEffect(() => {
    // High frequency internet traffic (never stops)
    const trafficTimer = setInterval(() => {
      const id = reqIdRef.current + 1;
      reqIdRef.current = id;
      setRequests((prev) => [...prev, { id, ok: true }].slice(-10)); // Keep last 10 on screen
    }, 400);

    // Occasional deploy attempts
    const deployTimer = setInterval(() => {
      if (cpActiveRef.current) {
        addLog('Webhook received. Processing deployment...');
      } else {
        addLog('ERROR 502: Webhook failed. API offline.');
      }
    }, 2500);

    return () => {
      clearInterval(trafficTimer);
      clearInterval(deployTimer);
    };
  }, []);

  return (
    <div className="not-prose my-10 font-mono text-[13px] text-muted-foreground w-full">
      <div className="flex justify-between items-end mb-6 border-b border-border pb-2">
        <h3 className="text-foreground font-bold flex items-center gap-2">
          <span className="text-green-500 opacity-80">~</span>
          <span>./demo-fault-isolation.sh</span>
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full mb-8">
        
        {/* CONTROL PLANE */}
        <div className={`flex-1 border p-4 flex flex-col items-center transition-colors duration-500 relative overflow-hidden ${cpActive ? 'border-foreground bg-background' : 'border-red-500/50 bg-red-500/5'}`}>
          <div className="font-bold text-center tracking-wide mb-2">CONTROL PLANE</div>
          <div className="text-[11px] mb-6 h-4 text-center">
             {cpActive ? <span className="text-green-500">API & CA Online</span> : <span className="text-red-500">OFFLINE - Deployments Disabled</span>}
          </div>
          
          <button 
             onClick={toggleCp}
             className={`px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors border w-[120px] ${cpActive ? 'text-red-500 border-red-500/30 hover:bg-red-500 hover:text-background' : 'text-foreground border-border hover:bg-muted'}`}
          >
             {cpActive ? 'Kill Process' : 'Reboot'}
          </button>
        </div>

        {/* DATA PLANE */}
        <div className="flex-1 border border-border bg-background p-4 relative overflow-hidden flex flex-col items-center">
          <div className="font-bold text-center tracking-wide mb-2 text-foreground">DATA PLANE</div>
          <div className="text-[11px] mb-4 text-green-500 h-4">Serving Internet Traffic</div>
          
          <div className="w-full flex justify-center gap-2 flex-wrap h-[60px] overflow-hidden relative">
             <AnimatePresence>
                {requests.map(req => (
                   <motion.div 
                     key={req.id}
                     initial={{ opacity: 0, y: 10, scale: 0.8 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.5 }}
                     transition={{ duration: 0.3 }}
                     className="px-2 py-0.5 border border-border bg-muted/50 text-[10px] text-muted-foreground whitespace-nowrap"
                   >
                     GET 200 OK
                   </motion.div>
                ))}
             </AnimatePresence>
          </div>
          
          {/* Subtle connecting line from left to right */}
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[2px] ${cpActive ? 'bg-green-500/50' : 'bg-red-500/50'}`}></div>
        </div>

      </div>

      {/* Logs */}
      <div className="border border-border bg-background p-4 flex flex-col gap-1 min-h-[140px]">
        {logs.map((log, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -5 }} 
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-2 ${log.includes('FATAL') || log.includes('ERROR') ? 'text-red-500' : log.includes('Webhook') ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <span className={log.includes('FATAL') || log.includes('ERROR') ? 'text-red-500' : 'text-green-500'}>$</span>
            <span>{log}</span>
          </motion.div>
        ))}
        <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-2 h-3.5 bg-green-500 ml-5 mt-1" />
      </div>
    </div>
  );
}
