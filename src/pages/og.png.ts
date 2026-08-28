import { getCollection } from 'astro:content';
import { render } from 'takumi-js';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  // Fetch profile data dynamically
  const profileCollection = await getCollection('profile');
  const author = profileCollection[0].data;

  // Convert local avatar to base64 to prevent takumi-js fetch failures
  let avatarSrc = author.avatarUrl;

  if (avatarSrc.startsWith('/')) {
    const avatarPath = path.join(process.cwd(), 'public', avatarSrc);

    if (fs.existsSync(avatarPath)) {
      const avatarBuffer = fs.readFileSync(avatarPath);
      avatarSrc = `data:image/png;base64,${avatarBuffer.toString('base64')}`;
    }
  }

  // Geist keeps the card clean and editorial
  const fontBuffer = await fetch(
    'https://takumi.kane.tw/fonts/Geist.woff2'
  ).then((r) => r.arrayBuffer());

  const colors = {
    canvas: '#0A0A0A',
    border: '#242424',
    foreground: '#EDEDED',
    muted: '#888888',
    tertiary: '#555555',
    accent: '#A3A3A3',
  };

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
        padding: '72px',
        fontFamily: 'Geist',
      },
    },

    // Header
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '26px',
        },
      },
      React.createElement(
        'span',
        {
          style: {
            fontWeight: 500,
          },
        },
        author.name
      ),

      React.createElement(
        'span',
        {
          style: {
            color: colors.tertiary,
          },
        },
        'Web Designer & Developer'
      )
    ),

    // Main positioning
    React.createElement(
      'div',
      {
        style: {
          marginTop: 'auto',
          marginBottom: 'auto',
          maxWidth: '940px',
          fontSize: '58px',
          fontWeight: 500,
          lineHeight: '1.12',
          letterSpacing: '-0.035em',
        },
      },
      'I build websites that turn visitors into customers.'
    ),

    // Supporting positioning
    React.createElement(
      'div',
      {
        style: {
          fontSize: '24px',
          color: colors.muted,
          maxWidth: '700px',
          lineHeight: '1.4',
          marginBottom: '56px',
        },
      },
      'Strategy, design and development for businesses that want to look as good online as they do offline.'
    ),

    // Footer
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '32px',
          borderTop: `1px solid ${colors.border}`,
        },
      },

      // Author
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          },
        },

        React.createElement('img', {
          src: avatarSrc,
          style: {
            width: '58px',
            height: '58px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
          },
        }),

        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            },
          },

          React.createElement(
            'span',
            {
              style: {
                fontSize: '22px',
                fontWeight: 500,
              },
            },
            author.name
          ),

          React.createElement(
            'span',
            {
              style: {
                fontSize: '18px',
                color: colors.muted,
              },
            },
            'Web Design · Development · Digital Strategy'
          )
        )
      ),

      // Domain
      React.createElement(
        'span',
        {
          style: {
            fontSize: '22px',
            color: colors.tertiary,
          },
        },
        url.hostname
      )
    )
  );

  const output = await render(element, {
    width: 1200,
    height: 630,
    format: 'png',
    fonts: [
      {
        name: 'Geist',
        data: () => fontBuffer,
      },
    ],
  });

  return new Response(output as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
