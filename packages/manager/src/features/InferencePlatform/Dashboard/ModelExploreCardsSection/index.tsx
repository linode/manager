import React from 'react';

import Playground from 'src/assets/icons/ai/playground.svg';
import Stars from 'src/assets/icons/ai/stars.svg';

import { Box } from '../../components';
import { ModelExploreCard } from './ModelExploreCard';
import styles from './ModelExploreCardsSection.module.css';

import type { ModelExploreCardData } from './ModelExploreCard';

const cards: ModelExploreCardData[] = [
  {
    description:
      'Browse the latest models, compare capabilities, and shortlist the best options for your use case.',
    icon: Stars,
    title: 'Model Library',
    to: '/inference-platform/model-library',
  },
  {
    description:
      'Run prompts against production-ready models and tune your request settings in real time.',
    icon: Playground,
    title: 'Model Playground',
    to: '/inference-platform/model-playground',
  },
];

export const ModelExploreCardsSection = () => {
  return (
    <Box className={styles.box}>
      {cards.map((card) => (
        <ModelExploreCard card={card} key={card.title} />
      ))}
    </Box>
  );
};
