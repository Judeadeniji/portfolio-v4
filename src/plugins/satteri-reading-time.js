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
      // Fallback: prepend a standard MDAST paragraph node
      const readingTimeNode = {
        type: "paragraph",
        children: [
          { type: "text", value: `> Estimated reading time: ${minutes} min` }
        ]
      };
      ctx.insertChildAt(node, 0, readingTimeNode);
    }
  }
});
