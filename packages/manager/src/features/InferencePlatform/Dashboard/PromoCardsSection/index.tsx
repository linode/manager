import { Box } from '@linode/ui';
import React from 'react';

import { PromoCard } from './PromoCard';

import type { PromoCardData } from './PromoCard';

const PROMO_CARDS_ENABLED = false;

const cards: PromoCardData[] = [
  {
    cta: 'View SDK',
    description:
      'Ship faster with SDKs for major languages and starter templates.',
    pattern: {
      offsetX: 83,
      offsetY: 0,
      scale: 2,
      tiles: [
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'roundBL',
        'roundTR',
        'empty',
        'empty',
        'empty',
        'empty',
        'roundBL',
        'roundTR',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
      ],
    },
    title: 'Akamai AI SDK',
    to: 'https://techdocs.akamai.com',
  },
  {
    cta: 'Open playground',
    description:
      'Experiment with prompt templates and compare completions side by side.',
    pattern: {
      offsetX: 83,
      offsetY: 0,
      scale: 2,
      tiles: [
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'full',
        'roundTR',
        'empty',
        'empty',
        'empty',
        'empty',
        'roundBL',
        'full',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
        'empty',
      ],
    },
    title: 'Enterprise Workspace Playground',
    to: '/inference-platform/model-playground',
  },
  {
    cta: 'View CDN',
    description:
      'Cache model assets globally to reduce cold starts and improve TTFB.',
    pattern: {
      offsetX: 32,
      offsetY: 5,
      scale: 1.6,
      tiles: [
        'empty',
        'empty',
        'empty',
        'empty',
        'full',
        'empty',
        'empty',
        'empty',
        'roundTL',
        'roundTR',
        'full',
        'empty',
        'empty',
        'empty',
        'full',
        'roundBL',
        'roundBR',
        'empty',
        'empty',
        'empty',
        'full',
        'empty',
        'empty',
        'empty',
      ],
    },
    title: 'Akamai CDN for AI',
    to: 'https://www.akamai.com',
  },
];

export const PromoCardsSection = () => {
  if (!PROMO_CARDS_ENABLED) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        display: 'grid',
        gap: 2,
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        [theme.breakpoints.down('md')]: {
          gridTemplateColumns: '1fr',
        },
        mb: 2,
      })}
    >
      {cards.map((card) => (
        <PromoCard card={card} key={card.title} />
      ))}
    </Box>
  );
};
