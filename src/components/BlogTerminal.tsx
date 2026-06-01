import React, { useState } from 'react';

type Post = {
  id: string;
  data: {
    title: string;
    description: string;
    date: string;
    category: string;
    featured: boolean;
  };
};

export default function BlogTerminal({ posts }: { posts: Post[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.data.category)))];

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(p => p.data.category === activeCategory);

  const featuredPosts = posts.filter(p => p.data.featured);

  return (
    <div className="font-mono text-[13px] text-muted-foreground space-y-10">
      
      {/* Interactive Categories */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-green-500 font-bold opacity-80">~</span>
          <span className="text-muted-foreground/50">$</span>
          <span className="text-foreground">grep -r "category" ./posts</span>
        </div>
        <div className="flex flex-wrap gap-3 pl-8">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`hover:text-foreground transition-colors ${activeCategory === cat ? 'text-green-500 font-bold' : 'opacity-70 hover:opacity-100'}`}
            >
              [{cat}]
            </button>
          ))}
        </div>
      </div>

      {/* Featured Posts (Only visible in 'All') */}
      {activeCategory === 'All' && featuredPosts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-green-500 font-bold opacity-80">~</span>
            <span className="text-muted-foreground/50">$</span>
            <span className="text-foreground">cat featured.txt</span>
          </div>
          <div className="pl-6 space-y-3">
            {featuredPosts.map(post => (
              <a key={post.id} href={`/blog/${post.id}`} className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 hover:text-foreground transition-colors">
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-yellow-500/80">★</span>
                  <span className="group-hover:underline underline-offset-4 decoration-border">{post.id}.mdx</span>
                </div>
                <div className="hidden sm:block border-b border-border/40 grow border-dashed mt-1"></div>
                <div className="opacity-60 flex items-center gap-2 shrink-0">
                  <span className="text-foreground/40">[{post.data.category}]</span>
                  <span className="truncate max-w-62.5 hidden md:inline-block"># {post.data.title}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* All / Filtered Posts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-green-500 font-bold opacity-80">~</span>
          <span className="text-muted-foreground/50">$</span>
          <span className="text-foreground">
            ls -la {activeCategory !== 'All' ? `--grep="${activeCategory}"` : 'blog/'}
          </span>
        </div>
        <div className="pl-6 space-y-3">
          {activeCategory === 'All' && (
            <>
              <a href="/blog/categories" className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 hover:text-foreground transition-colors">
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-blue-400 opacity-80">drwxr-xr-x</span>
                  <span className="group-hover:underline underline-offset-4 decoration-border">categories/</span>
                </div>
                <div className="hidden sm:block border-b border-border/40 grow border-dashed mt-1"></div>
                <div className="opacity-60 flex items-center gap-2 shrink-0 text-[11px]">
                  <span className="text-foreground/40">[dir]</span>
                  <span className="truncate max-w-62.5 hidden md:inline-block">Browse all categories</span>
                </div>
              </a>
              <a href="/blog/featured" className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 hover:text-foreground transition-colors">
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-blue-400 opacity-80">drwxr-xr-x</span>
                  <span className="group-hover:underline underline-offset-4 decoration-border">featured/</span>
                </div>
                <div className="hidden sm:block border-b border-border/40 grow border-dashed mt-1"></div>
                <div className="opacity-60 flex items-center gap-2 shrink-0 text-[11px]">
                  <span className="text-foreground/40">[dir]</span>
                  <span className="truncate max-w-62.5 hidden md:inline-block">Curated highlights</span>
                </div>
              </a>
            </>
          )}
          {filteredPosts.map(post => (
            <a key={post.id} href={`/blog/${post.id}`} className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 hover:text-foreground transition-colors">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-muted-foreground/50">-rw-r--r--</span>
                <span className="group-hover:underline underline-offset-4 decoration-border">{post.id}.mdx</span>
              </div>
              <div className="hidden sm:block border-b border-border/40 grow border-dashed mt-1"></div>
              <div className="opacity-60 flex items-center gap-2 shrink-0 text-[11px]">
                <span className="text-foreground/40">
                  [{new Date(post.data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}]
                </span>
                <span className="truncate max-w-62.5 hidden md:inline-block"># {post.data.title}</span>
              </div>
            </a>
          ))}
          {filteredPosts.length === 0 && (
            <div className="opacity-60 pl-2">total 0</div>
          )}
        </div>
      </div>

    </div>
  );
}
