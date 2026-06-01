import { getCollection } from 'astro:content';
import { render } from 'takumi-js';
import React from 'react';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

export async function GET({ props }: any) {
  const { post } = props;

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
        justifyContent: 'center',
        backgroundColor: '#09090b', // zinc-950
        color: '#fafafa', // zinc-50
        padding: '64px',
        fontFamily: 'Geist',
        border: '4px solid #27272a',
      }
    },
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          fontSize: '32px',
          fontFamily: 'monospace',
          opacity: 0.7
        }
      },
      React.createElement('span', { style: { color: '#22c55e', fontWeight: 'bold' } }, '~'),
      React.createElement('span', { style: { color: '#a1a1aa' } }, '$'),
      React.createElement('span', { style: {} }, `./blog/${post.id}.mdx`)
    ),
    React.createElement(
      'div',
      {
        style: {
          fontSize: '72px',
          fontWeight: 'bold',
          lineHeight: '1.1',
          marginBottom: '24px',
          maxWidth: '900px'
        }
      },
      post.data.title
    ),
    React.createElement(
      'div',
      {
        style: {
          fontSize: '32px',
          color: '#a1a1aa', // muted-foreground
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      },
      React.createElement('span', {}, `[${post.data.category}]`),
      React.createElement('span', {}, new Date(post.data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
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

  return new Response(output, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
