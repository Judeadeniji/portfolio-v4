import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import path from 'node:path';

/**
 * Remark plugin that transforms markdown image nodes into
 * Astro Image component imports for automatic optimization.
 *
 * Transforms: ![alt](/images/blog/foo.png)
 * Into: import img_0 from '../../assets/images/blog/foo.png';
 *       <MdxImage src={img_0} alt="alt" />
 */
export function remarkMdxImages() {
  return (tree: Root, file: any) => {
    const imports: string[] = [];
    const components: string[] = [];
    let counter = 0;

    visit(tree, 'image', (node: any) => {
      const src: string = node.url;
      const alt: string = node.alt || '';

      // Only transform local images (start with /)
      if (!src.startsWith('/')) return;

      const varName = `mdx_img_${counter++}`;

      // Resolve the image path relative to the MDX file
      const filePath = file.history?.[0] || file.path || '';
      const fileDir = path.dirname(filePath);
      const imagePath = path.join(file.cwd || process.cwd(), 'src', src.slice(1));
      const relativePath = path.relative(fileDir, imagePath);

      imports.push(`import ${varName} from '${relativePath}';`);
      components.push(
        `<MdxImage src={${varName}} alt="${alt.replace(/"/g, '&quot;')}" />`
      );

      // Replace the image node with a raw JSX expression
      node.type = 'html';
      node.value = `<MdxImage src={${varName}} alt="${alt.replace(/"/g, '&quot;')}" />`;
      delete node.url;
      delete node.alt;
      delete node.title;
    });

    if (imports.length > 0) {
      // Prepend imports and MdxImage import at the top of the file
      const importBlock = [
        `import MdxImage from '../../../components/MdxImage.astro';`,
        ...imports,
        '',
      ].join('\n');

      // Add as a raw HTML node at the start of the tree
      (tree as any).children.unshift({
        type: 'html',
        value: importBlock,
      });
    }
  };
}
