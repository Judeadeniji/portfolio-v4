import { defineMdastPlugin } from "satteri";

export const satteriReadingTime = defineMdastPlugin({
  name: "reading-time",
  root(node, ctx) {
    const text = ctx.textContent(node) || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));

    // Astro typically injects frontmatter via vfile in remark.
    // If markdown-satteri supports this, we try setting it:
    if (ctx.file?.data?.astro?.frontmatter) {
      ctx.file.data.astro.frontmatter.readingTime = minutes;
    } else if (ctx.vfile?.data?.astro?.frontmatter) {
      ctx.vfile.data.astro.frontmatter.readingTime = minutes;
    } else {
      // Fallback: prepend a terminal-themed block to the AST
      const readingTimeNode = {
        type: "html",
        value: `<div class="font-mono text-[13px] text-muted-foreground mb-8 pb-4 border-b border-dashed border-border/40"><span class="text-green-500 font-bold opacity-80">~</span> <span class="text-muted-foreground/50">$</span> ./calc_read_time.sh<br/><span class="opacity-70">> Estimated reading time: ${minutes} min</span></div>`
      };
      ctx.insertChildAt(node, 0, readingTimeNode);
    }
  }
});
