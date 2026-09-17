import React from 'react';

import Beaker from 'src/features/InferencePlatform/assets/icons/beaker.svg';
import Library from 'src/features/InferencePlatform/assets/icons/library.svg';

import { Box } from '../../components';
import { ModelExploreCard } from './ModelExploreCard';
import styles from './ModelExploreCardsSection.module.css';

import type { ModelExploreCardData } from './ModelExploreCard';

const cards: ModelExploreCardData[] = [
  {
    cta: 'Browse Models',
    description:
      'Browse available models and compare parameters, capabilities, and pricing.',
    icon: Library,
    title: 'Model Library',
    to: '/inference-platform/model-library',
  },
  {
    cta: 'Open Playground',
    description:
      'Try your prompts across different models and find what works best.',
    icon: Beaker,
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
