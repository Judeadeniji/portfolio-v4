import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SystemArchitectureDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>(['System idle. Waiting for webhook...']);
  
  // Animation state triggers
  const [activeStep, setActiveStep] = useState<number>(0);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `> [${new Date().toLocaleTimeString()}] ${msg}`].slice(-6));
  };

  const triggerDeploy = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setActiveStep(1); // Start Git Push payload
    addLog('Webhook received from GitHub.');

    setTimeout(() => {
      setActiveStep(2); // Control plane processing
      addLog('Control Plane parsing .msks manifest.');
      addLog('Provisioning requested state...');
      
      setTimeout(() => {
        setActiveStep(3); // Sending out to Workers and Caddy
        addLog('Pushing encrypted secrets via mTLS to Workers.');
        addLog('Writing JSON routes to Caddy Admin API.');
        
        setTimeout(() => {
          setActiveStep(4); // Reached endpoints
          addLog('Workers spun up new containers.');
          addLog('Caddy applied routes without reload.');
          
          setTimeout(() => {
            setActiveStep(0);
            addLog('Deployment completed successfully. System idle.');
            setIsRunning(false);
          }, 2000);
        }, 1200);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="not-prose my-10 font-mono text-[13px] text-muted-foreground w-full">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-border pb-2">
        <h3 className="text-foreground font-bold flex items-center gap-2">
          <span className="text-green-500 opacity-80">~</span>
          <span>./demo-architecture.sh</span>
        </h3>
        <button 
          onClick={triggerDeploy} 
          disabled={isRunning}
          className={`text-xs px-2 py-1 transition-colors border border-transparent ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:text-foreground hover:border-border hover:bg-muted text-green-500'}`}
        >
          [trigger_webhook]
        </button>
      </div>

      <div className="flex flex-col items-center w-full mb-8 relative">
        
        {/* GIT PUSH */}
        <div className="w-48 p-3 border border-border bg-background text-center z-10 relative">
          <div className="font-bold text-foreground">GIT PUSH / WEBHOOK</div>
        </div>

        {/* Line from Git to Control Plane */}
        <div className="w-full relative flex flex-col items-center h-12">
          <div className="w-[1px] h-12 bg-border relative z-0">
             {activeStep === 1 && (
                <motion.div 
                  className="w-[3px] h-[3px] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] absolute left-1/2 -translate-x-1/2"
                  initial={{ top: 0, opacity: 1 }}
                  animate={{ top: 48, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeIn" }}
                />
             )}
          </div>
        </div>

        {/* CONTROL PLANE */}
        <div className={`w-64 p-4 border transition-colors duration-300 bg-background text-center z-10 relative ${activeStep === 2 ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-foreground'}`}>
          <div className={`font-bold tracking-wide mb-2 ${activeStep === 2 ? 'text-green-400' : 'text-foreground'}`}>CONTROL_PLANE</div>
          <div className="text-[11px] text-muted-foreground flex flex-col gap-1">
             <span>API & Scheduler</span>
             <span>PostgreSQL (State)</span>
             <span>Self-Signed CA</span>
          </div>
        </div>

        {/* Split Lines to Workers and Caddy */}
        <div className="w-full relative flex flex-col items-center h-16">
          <div className="w-[1px] h-8 bg-border relative z-0"></div>
          <div className="w-[60%] h-[1px] bg-border relative z-0">
             {/* Left branch (Workers) */}
             <div className="absolute left-0 top-0 w-[1px] h-8 bg-border">
                <div className="absolute top-1/2 -translate-y-1/2 -left-32 text-[10px] w-32 text-right pr-2">gRPC over mTLS</div>
             </div>
             {/* Right branch (Caddy) */}
             <div className="absolute right-0 top-0 w-[1px] h-8 bg-border">
                <div className="absolute top-1/2 -translate-y-1/2 left-2 text-[10px] w-32 text-left">JSON over HTTP</div>
             </div>

             {/* Animated payloads splitting */}
             {activeStep === 3 && (
               <>
                 {/* Payload to left */}
                 <motion.div 
                    className="w-[3px] h-[3px] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] absolute top-0"
                    initial={{ left: '50%', top: 0 }}
                    animate={{ left: '0%', top: 0 }}
                    transition={{ duration: 0.5, ease: "linear" }}
                    onAnimationComplete={() => {}} // Could chain, but simpler to use timeout
                 />
                 {/* Payload to right */}
                 <motion.div 
                    className="w-[3px] h-[3px] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] absolute top-0"
                    initial={{ left: '50%', top: 0 }}
                    animate={{ left: '100%', top: 0 }}
                    transition={{ duration: 0.5, ease: "linear" }}
                 />
               </>
             )}
          </div>
        </div>

        {/* Bottom layer targets */}
        <div className="flex w-[80%] justify-between z-10 mt-2">
          
          {/* Workers */}
          <div className={`relative p-4 border w-48 flex flex-col items-center transition-colors duration-300 bg-background ${activeStep === 4 ? 'border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-border text-foreground'}`}>
             
             {/* Vertical drop animation */}
             {activeStep === 3 && (
                <motion.div 
                  className="w-[3px] h-[3px] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] absolute -top-8"
                  initial={{ top: -32, opacity: 0 }}
                  animate={{ top: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeIn" }}
                />
             )}

             <div className="font-bold tracking-wide mb-2">WORKER_NODES</div>
             <div className="text-[11px] flex gap-2 w-full justify-center">
                <span className="border border-border px-2 py-1 bg-muted">Docker</span>
             </div>
          </div>

          {/* Caddy */}
          <div className={`relative p-4 border w-48 flex flex-col items-center transition-colors duration-300 bg-background ${activeStep === 4 ? 'border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-border text-foreground'}`}>
             
             {/* Vertical drop animation */}
             {activeStep === 3 && (
                <motion.div 
                  className="w-[3px] h-[3px] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] absolute -top-8"
                  initial={{ top: -32, opacity: 0 }}
                  animate={{ top: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeIn" }}
                />
             )}

             <div className="font-bold tracking-wide mb-2">CADDY_PROXY</div>
             <div className="text-[11px] flex gap-2 w-full justify-center">
                <span className="border border-border px-2 py-1 bg-muted text-muted-foreground">Local API</span>
             </div>
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
            className={`flex gap-2 ${log.includes('successfully') ? 'text-green-500' : 'text-muted-foreground'}`}
          >
            <span className="text-green-500">$</span>
            <span className={log.includes('successfully') ? 'font-bold' : ''}>{log}</span>
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
