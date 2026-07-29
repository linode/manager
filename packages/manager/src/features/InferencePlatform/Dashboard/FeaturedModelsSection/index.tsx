import { Box, Stack, Typography } from '@linode/ui';
import React from 'react';

import LeftArrowIcon from 'src/assets/icons/arrow-left.svg';
import { Link } from 'src/components/Link';

import {
  ModelCard,
  ModelCardSkeleton,
} from '../../ModelLibrary/ModelCard/ModelCard';

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
    <Stack gap={2} marginBottom={2}>
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Typography variant="h3">Models</Typography>

        <Stack alignItems="center" direction="row" gap={0.5}>
          <Link to="/inference-platform/model-library">View all Models</Link>

          <LeftArrowIcon
            height={17}
            style={{ transform: 'rotate(180deg)' }}
            width={17}
          />
        </Stack>
      </Stack>

      <Box
        sx={(theme) => ({
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          [theme.breakpoints.down('lg')]: {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
          [theme.breakpoints.down('md')]: {
            gridTemplateColumns: '1fr',
          },
        })}
      >
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
