import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnvelopeEncryptionDemo() {
  const [step, setStep] = useState(0); 
  const [logs, setLogs] = useState<string[]>(['> Waiting to encrypt payload...']);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `> [${new Date().toLocaleTimeString()}] ${msg}`].slice(-5));
  };

  const nextStep = () => {
    if (step === 0) {
      setStep(1);
      addLog('Generated ephemeral DEK (Data Encryption Key).');
      addLog('Payload encrypted with DEK.');
    } else if (step === 1) {
      setStep(2);
      addLog('DEK encrypted using master KEK (Key Encryption Key).');
      addLog('Stored encrypted DEK + Payload in database.');
    } else if (step === 2) {
      setStep(3);
      addLog('Deploy triggered: Unwrapping DEK with KEK.');
      addLog('Transmitting DEK + Payload over mTLS to worker.');
    } else if (step === 3) {
      setStep(4);
      addLog('Worker received payload. Decrypting in-memory.');
      addLog('Secrets injected into Docker safely.');
    } else {
      setStep(0);
      setLogs(['> System reset.']);
    }
  };

  useEffect(() => {
    const t = setInterval(() => {
      nextStep();
    }, 2500);
    return () => clearInterval(t);
  }, [step]); // rebinds on step change so manual clicks reset the timer

  const stepLabels = ['Generate DEK', 'Wrap with KEK', 'Transmit over mTLS', 'Decrypt in Worker', 'Reset'];

  return (
    <div className="not-prose my-10 font-mono text-[13px] text-muted-foreground w-full">
      <div className="flex justify-between items-end mb-6 border-b border-border pb-2">
        <h3 className="text-foreground font-bold flex items-center gap-2">
          <span className="text-green-500 opacity-80">~</span>
          <span>./demo-envelope-encryption.sh</span>
        </h3>
        <button 
          onClick={nextStep} 
          className="text-xs px-2 py-1 transition-colors border border-border hover:text-foreground hover:bg-muted text-green-500"
        >
          [step_{step + 1}:_{stepLabels[step].toLowerCase().replace(/\s+/g, '_')}]
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full mb-8 min-h-[200px]">
        
        {/* Control Plane Side */}
        <div className={`w-full md:w-[40%] border p-4 flex flex-col gap-4 transition-colors ${step >= 0 && step <= 2 ? 'border-foreground bg-background' : 'border-border bg-muted/20'}`}>
           <div className="font-bold text-foreground text-center">CONTROL PLANE</div>
           
           <div className="flex flex-col gap-2">
              <div className="border border-border p-2 text-center text-[11px]">
                 Plaintext Secret
                 {step >= 1 && <span className="line-through text-red-500 ml-2">hidden</span>}
              </div>
              
              <AnimatePresence>
                {step >= 1 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border border-green-500/50 bg-green-500/10 p-2 text-center text-[11px] text-green-500">
                     Encrypted with DEK
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {step >= 2 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border border-blue-500/50 bg-blue-500/10 p-2 text-center text-[11px] text-blue-500">
                     DEK Wrapped with KEK (DB)
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Transit Line */}
        <div className="flex-1 w-full flex items-center justify-center relative h-16 md:h-auto">
           <div className="w-full md:w-full h-[1px] md:h-[1px] w-[1px] h-full bg-border absolute"></div>
           {step === 3 && (
             <motion.div 
               className="w-8 h-4 bg-green-500 absolute"
               initial={{ left: '0%' }}
               animate={{ left: '100%' }}
               transition={{ duration: 1, ease: "easeInOut" }}
             />
           )}
           <div className="bg-background px-2 text-[10px] text-muted-foreground z-10 hidden md:block">mTLS Tunnnel</div>
        </div>

        {/* Worker Side */}
        <div className={`w-full md:w-[40%] border p-4 flex flex-col gap-4 transition-colors ${step >= 4 ? 'border-foreground bg-background' : 'border-border bg-muted/20'}`}>
           <div className="font-bold text-foreground text-center">WORKER NODE</div>
           
           <div className="flex flex-col gap-2 min-h-[100px] justify-center">
              {step < 4 ? (
                <div className="text-center text-[11px] text-muted-foreground/50">Waiting for payload...</div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                   <div className="border border-green-500/50 p-2 text-center text-[11px] text-green-500">
                     DEK Unwrapped via memory
                   </div>
                   <div className="border border-foreground bg-foreground text-background p-2 text-center font-bold text-[11px]">
                     Plaintext injected to Docker
                   </div>
                </motion.div>
              )}
           </div>
        </div>

      </div>

      {/* Logs */}
      <div className="border border-border bg-background p-4 flex flex-col gap-1 min-h-[140px]">
        {logs.map((log, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className={`flex gap-2 text-muted-foreground`}>
            <span className="text-green-500">$</span>
            <span>{log}</span>
          </motion.div>
        ))}
        <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-2 h-3.5 bg-green-500 ml-5 mt-1" />
      </div>
    </div>
  );
}
