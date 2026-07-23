import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { render } from 'takumi-js';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

export const GET: APIRoute<{
  post: CollectionEntry<'blog'>
}> = async ({ props }) => {
  const { post } = props;

  // Fetch author data dynamically
  const profileEntry = await getEntry('profile', 'main');
  const author = profileEntry!.data;

  // Convert local avatar to base64 to prevent takumi-js fetch failures during build
  let avatarSrc = author.avatarUrl;
  if (avatarSrc.startsWith('/')) {
    const avatarPath = path.join(process.cwd(), 'public', avatarSrc);
    if (fs.existsSync(avatarPath)) {
      const avatarBuffer = fs.readFileSync(avatarPath);
      avatarSrc = `data:image/png;base64,${avatarBuffer.toString('base64')}`;
    }
  }

  // Use Geist from Takumi example or load local font if preferred
  const fontBuffer = await fetch("https://takumi.kane.tw/fonts/Geist.woff2").then(r => r.arrayBuffer());

  const element = React.createElement(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000000', 
        color: '#fafafa',
        padding: '80px',
        fontFamily: 'Geist',
        border: '16px solid #18181b', // zinc-900 border
      }
    },
    // Top Section (Terminal Path & Category)
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'auto',
          fontSize: '28px',
          fontFamily: 'monospace',
          opacity: 0.8
        }
      },
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
        React.createElement('span', { style: { color: '#22c55e', fontWeight: 600 } }, '~'),
        React.createElement('span', { style: { color: '#a1a1aa' } }, '$'),
        React.createElement('span', {}, `./blog/${post.id}.mdx`)
      ),
      React.createElement('span', { style: { color: '#a1a1aa' } }, `[${post.data.category}]`)
    ),
    
    // Middle Section (Title)
    React.createElement(
      'div',
      {
        style: {
          fontSize: post.data.title.length > 70 ? '50px' : post.data.title.length > 55 ? '56px' : '76px',
          fontWeight: 500,
          lineHeight: '1.2',
          letterSpacing: '-0.02em',
          maxWidth: '1000px',
          marginTop: '40px',
          marginBottom: '60px',
          display: 'flex',
          flexWrap: 'wrap',
        }
      },
      post.data.title
    ),

    // Bottom Section (Author Profile & Date)
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
          paddingTop: '40px',
          borderTop: '2px dashed #27272a'
        }
      },
      // Author info
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '24px' } },
        React.createElement('img', { 
          src: avatarSrc,
          style: { width: '80px', height: '80px', borderRadius: '10px', border: '2px solid #3f3f46' } 
        }),
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          React.createElement('span', { style: { fontSize: '28px', fontWeight: 600 } }, author.name),
          React.createElement('span', { style: { fontSize: '22px', color: '#a1a1aa' } }, author.twitterHandle ? `@${author.twitterHandle}` : 'Products Engineer')
        )
      ),
      // Date
      React.createElement(
        'div',
        { style: { fontSize: '26px', color: '#a1a1aa', fontFamily: 'monospace' } },
        new Date(post.data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      )
    )
  );

  const output = await render(element, {
    width: 1200,
    height: 630,
    format: "png",
    fonts: [
      {
        name: "Geist",
        data: () => fontBuffer
      }
    ]
  });

  return new Response(output as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
