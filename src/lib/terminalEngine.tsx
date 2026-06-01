import React from 'react';

export type TerminalContext = {
  setHistory: React.Dispatch<React.SetStateAction<any[]>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type CommandHandler = (
  args: string[],
  context: TerminalContext
) => React.ReactNode | void | string;

export class TerminalEngine {
  private commands: Record<string, CommandHandler> = {};

  register(command: string, handler: CommandHandler) {
    this.commands[command.toLowerCase()] = handler;
  }

  execute(cmdLine: string, context: TerminalContext): { output: React.ReactNode | void | string; isClear: boolean } {
    const trimmed = cmdLine.trim();
    if (!trimmed) return { output: null, isClear: false };

    const parts = trimmed.split(' ').filter(Boolean);
    const baseCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (baseCmd === 'clear') {
      context.setHistory([]);
      context.setInput('');
      context.setIsOpen(false);
      return { output: null, isClear: true };
    }

    const handler = this.commands[baseCmd];
    if (handler) {
      return { output: handler(args, context), isClear: false };
    }

    return { output: `bash: ${baseCmd}: command not found`, isClear: false };
  }
}

export const globalEngine = new TerminalEngine();

// Register default commands
globalEngine.register('help', () => (
  <div className="space-y-1">
    <div>Available commands:</div>
    <div><span className="text-blue-400">cd</span> &lt;dir&gt; - Navigate (e.g., cd /blog, cd ~)</div>
    <div><span className="text-blue-400">ls</span> - List directory contents</div>
    <div><span className="text-blue-400">cat</span> &lt;file&gt; - View file contents</div>
    <div><span className="text-blue-400">clear</span> - Clear terminal</div>
    <div><span className="text-blue-400">whoami</span> - Print current user</div>
  </div>
));

globalEngine.register('whoami', () => 'guest');

globalEngine.register('sudo', () => 'guest is not in the sudoers file. This incident will be reported.');

globalEngine.register('ls', () => {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path.includes('/blog')) {
    return (
      <div className="flex flex-wrap gap-4">
        <span className="text-blue-400">../&nbsp;&nbsp;&nbsp;</span>
        <span>content.md&nbsp;&nbsp;&nbsp;</span>
        <span className="text-blue-400">categories/&nbsp;&nbsp;&nbsp;</span>
        <span className="text-blue-400">featured/</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-4">
      <span className="text-blue-400">blog/&nbsp;&nbsp;&nbsp;</span>
      <span className="text-blue-400">projects/&nbsp;&nbsp;&nbsp;</span>
      <span className="text-blue-400">experience/&nbsp;&nbsp;&nbsp;</span>
      <span className="text-blue-400">contact/&nbsp;&nbsp;&nbsp;</span>
      <span>resume.pdf</span>
    </div>
  );
});

const cdRoutes: Record<string, { url: string; msg: string }> = {
  '~': { url: '/', msg: 'Navigating home...' },
  '/': { url: '/', msg: 'Navigating home...' },
  '/home': { url: '/', msg: 'Navigating home...' },
  'blog': { url: '/blog', msg: 'Navigating to blog...' },
  '/blog': { url: '/blog', msg: 'Navigating to blog...' },
  'projects': { url: '/#projects', msg: 'Navigating to projects...' },
  './projects': { url: '/#projects', msg: 'Navigating to projects...' },
  '/#projects': { url: '/#projects', msg: 'Navigating to projects...' },
  'experience': { url: '/#experience', msg: 'Navigating to experience...' },
  './experience': { url: '/#experience', msg: 'Navigating to experience...' },
  '/#experience': { url: '/#experience', msg: 'Navigating to experience...' },
  'contact': { url: '/#contact', msg: 'Navigating to contact...' },
  './contact': { url: '/#contact', msg: 'Navigating to contact...' },
  '/#contact': { url: '/#contact', msg: 'Navigating to contact...' },
  'categories': { url: '/blog/categories', msg: 'Opening categories...' },
  './categories': { url: '/blog/categories', msg: 'Opening categories...' },
  'featured': { url: '/blog/featured', msg: 'Opening featured...' },
  './featured': { url: '/blog/featured', msg: 'Opening featured...' },
};

globalEngine.register('cd', (args) => {
  const target = args[0] || '~';

  if (target === '..') {
    window.history.back();
    return 'Going back...';
  }

  const route = cdRoutes[target];
  if (route) {
    window.location.href = route.url;
    return route.msg;
  }

  if (target.startsWith('categories/')) {
    const catName = target.substring('categories/'.length);
    window.location.href = `/blog/categories/${catName}`;
    return `Opening category ${catName}...`;
  }

  if (typeof window !== 'undefined' && window.location.pathname.includes('/blog/categories')) {
    window.location.href = `/blog/categories/${target}`;
    return `Opening category ${target}...`;
  }

  return `cd: ${target}: No such file or directory`;
});

globalEngine.register('cat', (args) => {
  const file = args[0];
  if (!file) {
    return 'cat: missing file operand';
  } else if (file === 'resume.pdf' || file === 'resume') {
    window.open('/adeniji-oluwaferanmi-resume.pdf', '_blank');
    return 'Opening resume...';
  }
  return `cat: ${file}: No such file or directory`;
});
