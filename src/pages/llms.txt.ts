import type { APIRoute } from 'astro';
import { getEntry, getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const profileEntry = await getEntry('profile', 'main');
  
  if (!profileEntry) {
    return new Response('Profile not found', { status: 404 });
  }
  
  const profile = profileEntry.data;
  const posts = await getCollection('blog');
  
  // Sort posts by date descending
  posts.sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());
  
  const base = site ? site.toString() : 'https://oferanmi.netlify.app/';
  
  // Strip markdown and HTML from the first sentence of the bio
  const cleanBio = profile.bio.split('\n')[0].replace(/<[^>]*>?/gm, '').replace(/\*\*/g, '');
  
  const blogList = posts.map(post => {
    const url = new URL(`blog/${post.id}`, base).href;
    return `- [${post.data.title}](${url}): ${post.data.description}`;
  }).join('\n');

  const content = `# ${profile.name} | Portfolio
> ${cleanBio}

## Main sections
- [Home](${base}): Product Engineer building interactive web applications.
- [Blog](${new URL('blog', base).href}): Articles on web development, AI orchestration, and software architecture.

## Blog Posts
${blogList}

## Optional: Key facts
- ${profile.name} is a Product Engineer based in ${profile.contact.location}.
- Can be contacted via email at ${profile.contact.email}.
- GitHub: ${profile.contact.github}
- LinkedIn: ${profile.contact.linkedin}
- Twitter/X: https://x.com/${profile.twitterHandle}
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
