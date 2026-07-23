import React, { useState, useRef } from 'react';
import { globalEngine } from '../lib/terminalEngine';

type HistoryItem = {
  command: string;
  output: React.ReactNode;
};

export default function GlobalTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const result = globalEngine.execute(trimmed, {
      setHistory,
      setInput,
      setIsOpen
    });

    if (result.isClear) return;

    setHistory(prev => [...prev, { command: trimmed, output: result.output! }]);
    setInput('');
    setIsOpen(true);
    
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[commandHistory.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[commandHistory.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-100 font-mono text-[13px]">
      {isOpen && history.length > 0 && (
        <div className="max-h-64 sm:max-h-80 overflow-y-auto bg-background/95 backdrop-blur-md border-t border-border p-4 space-y-3 no-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto space-y-4">
            {history.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex gap-2.5">
                  <span className="text-green-500 font-bold opacity-80">~</span>
                  <span className="text-muted-foreground/50">$</span>
                  <span className="text-foreground">{item.command}</span>
                </div>
                <div className="text-muted-foreground pl-6">
                  {item.output}
                </div>
              </div>
            ))}
            <div ref={endRef} className="h-1" />
          </div>
        </div>
      )}
      
      <div className="bg-background/95 backdrop-blur-md border-t border-border p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5">
          <span className="text-green-500 font-bold opacity-80 shrink-0">~</span>
          <span className="text-muted-foreground/50 shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder="Type 'help' to see available commands..."
            className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground/30 focus:ring-0 focus-visible:ring-0"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
