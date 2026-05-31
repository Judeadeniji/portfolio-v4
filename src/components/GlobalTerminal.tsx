import React, { useState, useRef, useEffect } from 'react';

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

    const args = trimmed.split(' ').filter(Boolean);
    const baseCmd = args[0].toLowerCase();

    let output: React.ReactNode = null;

    switch (baseCmd) {
      case 'help':
        output = (
          <div className="space-y-1">
            <div>Available commands:</div>
            <div><span className="text-blue-400">cd</span> &lt;dir&gt; - Navigate (e.g., cd /blog, cd ~)</div>
            <div><span className="text-blue-400">ls</span> - List directory contents</div>
            <div><span className="text-blue-400">cat</span> &lt;file&gt; - View file contents</div>
            <div><span className="text-blue-400">clear</span> - Clear terminal</div>
            <div><span className="text-blue-400">whoami</span> - Print current user</div>
          </div>
        );
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        setIsOpen(false);
        return;
      case 'whoami':
        output = 'guest';
        break;
      case 'ls':
        const path = window.location.pathname;
        if (path.includes('/blog')) {
          output = (
            <div className="flex flex-wrap gap-4">
              <span className="text-blue-400">../&nbsp;&nbsp;&nbsp;</span>
              <span>content.md&nbsp;&nbsp;&nbsp;</span>
              <span className="text-blue-400">categories/&nbsp;&nbsp;&nbsp;</span>
              <span className="text-blue-400">featured/</span>
            </div>
          );
        } else {
          output = (
            <div className="flex flex-wrap gap-4">
              <span className="text-blue-400">blog/&nbsp;&nbsp;&nbsp;</span>
              <span className="text-blue-400">projects/&nbsp;&nbsp;&nbsp;</span>
              <span className="text-blue-400">experience/&nbsp;&nbsp;&nbsp;</span>
              <span className="text-blue-400">contact/&nbsp;&nbsp;&nbsp;</span>
              <span>resume.pdf</span>
            </div>
          );
        }
        break;
      case 'cd':
        const target = args[1] || '~';
        if (target === '~' || target === '/' || target === '/home') {
          window.location.href = '/';
          output = 'Navigating home...';
        } else if (target === 'blog' || target === '/blog') {
          window.location.href = '/blog';
          output = 'Navigating to blog...';
        } else if (target === 'projects' || target === './projects' || target === '/#projects') {
          window.location.href = '/#projects';
          output = 'Navigating to projects...';
        } else if (target === 'experience' || target === './experience' || target === '/#experience') {
          window.location.href = '/#experience';
          output = 'Navigating to experience...';
        } else if (target === 'contact' || target === './contact' || target === '/#contact') {
          window.location.href = '/#contact';
          output = 'Navigating to contact...';
        } else if (target === 'categories' || target === './categories') {
          window.location.href = '/blog/categories';
          output = 'Opening categories...';
        } else if (target === 'featured' || target === './featured') {
          window.location.href = '/blog/featured';
          output = 'Opening featured...';
        } else if (target.startsWith('categories/')) {
          const catName = target.replace('categories/', '');
          window.location.href = `/blog/categories/${catName}`;
          output = `Opening category ${catName}...`;
        } else if (window.location.pathname.includes('/blog/categories') && target !== '..') {
          window.location.href = `/blog/categories/${target}`;
          output = `Opening category ${target}...`;
        } else if (target === '..') {
          window.history.back();
          output = 'Going back...';
        } else {
          output = `cd: ${target}: No such file or directory`;
        }
        break;
      case 'cat':
        const file = args[1];
        if (!file) {
          output = 'cat: missing file operand';
        } else if (file === 'resume.pdf' || file === 'resume') {
          window.open('/adeniji-oluwaferanmi-resume.pdf', '_blank');
          output = 'Opening resume...';
        } else {
          output = `cat: ${file}: No such file or directory`;
        }
        break;
      case 'sudo':
        output = 'guest is not in the sudoers file. This incident will be reported.';
        break;
      default:
        output = `bash: ${baseCmd}: command not found`;
    }

    setHistory(prev => [...prev, { command: trimmed, output }]);
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
