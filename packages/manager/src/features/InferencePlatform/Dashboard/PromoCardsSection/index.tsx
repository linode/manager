import React from 'react';

import { Box } from '../../components';
import { PromoCard } from './PromoCard';
import styles from './PromoCardsSection.module.css';

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
    <Box className={styles.box}>
      {cards.map((card) => (
        <PromoCard card={card} key={card.title} />
      ))}
    </Box>
  );
};
