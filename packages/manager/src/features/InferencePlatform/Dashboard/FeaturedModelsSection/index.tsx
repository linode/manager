import React from 'react';

import LeftArrowIcon from 'src/assets/icons/arrow-left.svg';
import { Link } from 'src/components/Link';

import { Box, Stack, Typography } from '../../components';
import {
  ModelCard,
  ModelCardSkeleton,
} from '../../ModelLibrary/ModelCard/ModelCard';
import styles from './FeaturedModelsSection.module.css';

import type { Model } from '../../ModelLibrary/modelLibrary.types';

interface FeaturedModelsSectionProps {
  isLoading: boolean;
  models: Model[];
}

export const FeaturedModelsSection = ({
  isLoading,
  models,
}: FeaturedModelsSectionProps) => {
  return (
    <Stack className={styles.topStack} direction="column">
      <Stack className={styles.middleStack} direction="row">
        <Typography className={styles.typographyH3}>Models</Typography>

        <Stack
          alignItems="center"
          className={styles.bottomStack}
          direction="row"
        >
          <Link to="/inference-platform/model-library">View all Models</Link>

          <LeftArrowIcon
            height={17}
            style={{ transform: 'rotate(180deg)' }}
            width={17}
          />
        </Stack>
      </Stack>

      <Box className={styles.gridBox}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <ModelCardSkeleton key={`featured-skeleton-${index}`} />
            ))
          : models.map((model) => (
              <ModelCard key={model.id} location="dashboard" model={model} />
            ))}
      </Box>
    </Stack>
  );
};
