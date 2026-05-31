import { useState } from 'react';

let globalCount: number | null = null;
let fetching = false;

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(globalCount);

  if (count === null && !fetching) {
    fetching = true;
    const namespace = 'iamferanmi';
    const name = 'portfolio';
    let endpoint = `https://api.counterapi.dev/v1/${namespace}/${name}/`;
    
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('visited_portfolio')) {
        endpoint = `https://api.counterapi.dev/v1/${namespace}/${name}/up/`;
        localStorage.setItem('visited_portfolio', 'true');
      }

      fetch('https://corsproxy.io/?' + encodeURIComponent(endpoint))
        .then(res => res.json())
        .then(data => {
          if (data && data.count) {
            globalCount = data.count + 16736;
            setCount(globalCount);
          }
        })
        .catch(() => {
          globalCount = 16737;
          setCount(globalCount);
        });
    }
  }

  if (count === null) {
    return <strong className="text-foreground font-semibold animate-pulse tracking-widest">...</strong>;
  }

  return (
    <strong className="text-foreground font-semibold">{count.toLocaleString()}</strong>
  );
}
