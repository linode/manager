import React from 'react';

import Stars from 'src/features/InferencePlatform/assets/icons/ai.svg';
import Playground from 'src/features/InferencePlatform/assets/icons/playground.svg';

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
