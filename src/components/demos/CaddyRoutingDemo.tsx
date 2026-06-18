import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CaddyRoutingDemo() {
  const [routes, setRoutes] = useState([{ host: 'api.myapp.com', backend: '10.0.0.5:8081' }]);
  const [logs, setLogs] = useState<string[]>(['> Caddy Proxy initialized. Listening on :443']);
  const [requests, setRequests] = useState<{id: number, host: string, active: boolean}[]>([]);
  const [reqId, setReqId] = useState(0);

  const routesRef = useRef(routes);
  useEffect(() => { routesRef.current = routes; }, [routes]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `> [${new Date().toLocaleTimeString()}] ${msg}`].slice(-5));
  };

  const addRoute = () => {
    if (routesRef.current.length >= 3) return;
    setRoutes(p => [...p, { host: `app-${p.length + 1}.myapp.com`, backend: `10.0.0.${p.length + 5}:8080` }]);
    addLog(`POST /config/apps/http/servers/srv0/routes`);
    addLog(`Caddy loaded new route dynamically (Zero reload).`);
  };

  const sendRequest = (host?: string) => {
    const targetHost = host || routesRef.current[Math.floor(Math.random() * routesRef.current.length)].host;
    const id = reqId + 1;
    setReqId(id);
    addLog(`Incoming request for ${targetHost}...`);
    setRequests(p => [...p, { id, host: targetHost, active: true }]);
    
    setTimeout(() => {
       setRequests(p => p.map(r => r.id === id ? { ...r, active: false } : r));
       const backend = routesRef.current.find(r => r.host === targetHost)?.backend;
       addLog(`200 OK proxied to ${backend}`);
    }, 1500);
  };

  useEffect(() => {
    const t = setInterval(() => {
      if (routesRef.current.length < 3 && Math.random() > 0.6) {
        addRoute();
      } else {
        sendRequest();
      }
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="not-prose my-10 font-mono text-[13px] text-muted-foreground w-full">
      <div className="flex justify-between items-end mb-6 border-b border-border pb-2">
        <h3 className="text-foreground font-bold flex items-center gap-2">
          <span className="text-green-500 opacity-80">~</span>
          <span>./demo-caddy-proxy.sh</span>
        </h3>
        <button 
          onClick={addRoute} 
          disabled={routes.length >= 3}
          className={`text-xs px-2 py-1 transition-colors border border-transparent ${routes.length >= 3 ? 'opacity-50' : 'hover:text-foreground hover:bg-muted text-green-500 border-border'}`}
        >
          [push_new_route_json]
        </button>
      </div>

      <div className="flex flex-col items-center gap-8 w-full mb-8 relative pt-4">
        
        {/* The Internet */}
        <div className="flex gap-4">
          {routes.map(r => (
             <button 
               key={r.host}
               onClick={() => sendRequest(r.host)}
               className="border border-border bg-background px-4 py-2 text-[11px] text-foreground hover:bg-muted transition-colors shadow-sm relative"
             >
               GET https://{r.host}
               {/* Request visualizer */}
               {requests.filter(req => req.host === r.host && req.active).map(req => (
                  <motion.div 
                    key={req.id}
                    className="absolute -bottom-6 left-1/2 w-[2px] h-[4px] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                    initial={{ top: '100%' }}
                    animate={{ top: '300%' }}
                    transition={{ duration: 0.5, ease: "linear" }}
                  />
               ))}
             </button>
          ))}
        </div>

        {/* Caddy Box */}
        <div className="w-[80%] border border-border bg-background p-4 flex flex-col items-center z-10 relative mt-4">
           <div className="font-bold text-foreground tracking-wide mb-4">CADDY REVERSE PROXY</div>
           <div className="w-full flex flex-col gap-2">
              <AnimatePresence>
                 {routes.map((r, index) => (
                    <motion.div 
                      key={r.host}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-border bg-muted/50 p-2 flex justify-between text-[11px] text-foreground"
                    >
                       <span>{r.host}</span>
                       <span className="text-muted-foreground">──────►</span>
                       <span className="text-green-500">{r.backend}</span>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
           
           <div className="absolute -right-4 -top-4 bg-muted border border-border px-2 py-1 text-[9px] text-muted-foreground rotate-12">
             localhost:2019
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
            className={`flex gap-2 ${log.includes('200 OK') ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <span className="text-green-500">$</span>
            <span>{log}</span>
          </motion.div>
        ))}
        <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-2 h-3.5 bg-green-500 ml-5 mt-1" />
      </div>
    </div>
  );
}
