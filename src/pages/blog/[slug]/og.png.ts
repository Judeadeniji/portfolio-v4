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
  const profileCollection = await getCollection('profile');
  const author = profileCollection[0].data;

  // Convert local avatar to base64 to prevent takumi-js fetch failures during build
  let avatarSrc = author.avatarUrl;
  if (avatarSrc.startsWith('/')) {
    const avatarPath = path.join(process.cwd(), 'public', avatarSrc);
    if (fs.existsSync(avatarPath)) {
      const avatarBuffer = fs.readFileSync(avatarPath);
      avatarSrc = `data:image/png;base64,${avatarBuffer.toString('base64')}`;
    }
  }

  const fontBuffer = await fetch("https://takumi.kane.tw/fonts/Geist.woff2").then(r => r.arrayBuffer());

  // New dark theme palette from redesign.html
  const colors = {
    canvas: '#0A0A0A',
    border: '#242424',
    foreground: '#EDEDED',
    muted: '#888888',
    tertiary: '#555555',
  };

  const titleSize = post.data.title.length > 70 ? '48px' : post.data.title.length > 55 ? '54px' : '68px';

  const element = React.createElement(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.canvas,
        color: colors.foreground,
        padding: '80px',
        fontFamily: 'Geist',
      }
    },
    // Top Section (Name & Category)
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'auto',
          fontSize: '28px',
          fontFamily: 'Geist',
        }
      },
      React.createElement('span', { style: { fontWeight: 500 } }, author.name),
      React.createElement('span', { style: { color: colors.tertiary } }, post.data.category || 'Blog')
    ),

    // Middle Section (Post Title)
    React.createElement(
      'div',
      {
        style: {
          fontSize: titleSize,
          fontWeight: 500,
          lineHeight: '1.2',
          letterSpacing: '-0.02em',
          maxWidth: '900px',
          marginTop: '60px',
          marginBottom: '80px',
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
          borderTop: `1px solid ${colors.border}`
        }
      },
      // Author info
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '24px' } },
        React.createElement('img', {
          src: avatarSrc,
          style: { width: '72px', height: '72px', borderRadius: '12px', border: `1px solid ${colors.border}` }
        }),
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          React.createElement('span', { style: { fontSize: '26px', fontWeight: 500 } }, author.name),
          React.createElement('span', { style: { fontSize: '20px', color: colors.muted } }, 'Product Engineer')
        )
      ),
      // Date
      React.createElement(
        'div',
        { style: { fontSize: '24px', color: colors.tertiary, fontFamily: 'Geist' } },
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
