import { useTheme } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { Skeleton } from 'src/components/Skeleton';
import { useFlags } from 'src/hooks/useFlags';

import { InferenceLogo } from '../../InferenceLogo';
import { Box } from '../Box/Box';
import { ModelFeatureChip } from '../ModelFeatureChip';
import { Paper } from '../Paper/Paper';
import { Stack } from '../Stack/Stack';
import { Typography } from '../Typography/Typography';
import { InfoChip } from './InfoChip';
import styles from './ModelCard.module.css';
import { ModelPricing } from './ModelPricing';
import { PlaygroundLink } from './PlaygroundLink';

import type { Model } from '../../ModelLibrary/modelLibrary.types';

interface ModelCardProps {
  location?: 'dashboard' | 'modelLibrary';
  model: Model;
}

export const ModelCard = ({ model, location }: ModelCardProps) => {
  const cmTheme = useTheme();
  const navigate = useNavigate();
  const flags = useFlags();

  // Model Details is gated behind the 2026 beta features flag. When the flag
  // is off, the card is not clickable and no navigation happens.
  const isDetailsEnabled = Boolean(flags.inferencePlatform2026Beta);

  const navigateToModelDetails = () => {
    if (!isDetailsEnabled) {
      return;
    }
    navigate({
      params: { modelId: model.id },
      to: '/inference-platform/model-library/$modelId',
    });
  };

  return (
    <Paper
      aria-disabled={!isDetailsEnabled || undefined}
      aria-label={`View details for ${model.title}`}
      className={styles.card}
      onClick={isDetailsEnabled ? navigateToModelDetails : undefined}
      onKeyDown={
        isDetailsEnabled
          ? (event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigateToModelDetails();
              }
            }
          : undefined
      }
      role={isDetailsEnabled ? 'button' : undefined}
      style={isDetailsEnabled ? undefined : { cursor: 'default' }}
      tabIndex={isDetailsEnabled ? 0 : -1}
    >
      {/* Header: logo + title + provider + Playground link */}
      <Stack
        alignItems="flex-start"
        direction="row"
        justifyContent="space-between"
      >
        <Stack alignItems="flex-start" direction="row" spacing="12px">
          {model.modelLogo ? (
            <InferenceLogo
              alt={model.title}
              kind="model"
              style={{ height: 36, width: 36 }}
              value={model.modelLogo}
            />
          ) : (
            <Box
              className={styles.providerFallback}
              style={{
                backgroundColor: cmTheme.palette.primary.main,
                color: cmTheme.palette.primary.contrastText,
                fontFamily: cmTheme.font.bold,
              }}
            >
              {model.providerName.charAt(0).toUpperCase()}
            </Box>
          )}
          <Stack>
            <Typography
              className={styles.title}
              component="h3"
              style={{ color: cmTheme.palette.primary.main }}
            >
              {model.title}
            </Typography>

            <Typography className={styles.providerText} component="p">
              {model.providerName}
            </Typography>
          </Stack>
        </Stack>

        {/* Playground link */}
        {model.playgroundAvailable && (
          <Box
            component="span"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <PlaygroundLink modelId={model.id} />
          </Box>
        )}
      </Stack>

      {/* Description */}
      {(model.descriptionShort || model.description) && (
        <Typography
          className={styles.description}
          component="p"
          style={{ fontFamily: cmTheme.font.semibold }}
        >
          {model.descriptionShort || model.description}
        </Typography>
      )}

      {/* Use-case tags */}
      {model.useCaseTags.length > 0 && (
        <Stack direction="row" flexWrap="wrap" spacing="3.2px">
          {model.useCaseTags.slice(0, 3).map((tag, index) => (
            <ModelFeatureChip
              description={tag.description}
              key={`tag-${index}`}
              label={tag.label}
              type="useCaseTags"
            />
          ))}
        </Stack>
      )}

      {/* Stats row + pricing */}
      <Stack spacing="6px">
        <Stack direction="row" spacing="6px">
          <InfoChip
            splitMetricRows={location === 'dashboard'}
            title="Parameters"
            titlePosition="after"
            type="metric"
            value={`${model.parametersB} B`}
          />
          <InfoChip
            splitMetricRows={location === 'dashboard'}
            title="Context Length"
            titlePosition="after"
            type="metric"
            value={`${model.contextLengthK} K`}
          />
        </Stack>

        {/* Pricing - only show if pricing data is available */}
        {model.priceInputPerMillion !== undefined &&
          model.priceOutputPerMillion !== undefined && (
            <ModelPricing
              priceInputCachedPerMillion={model.priceInputCachedPerMillion}
              priceInputPerMillion={model.priceInputPerMillion}
              priceOutputPerMillion={model.priceOutputPerMillion}
            />
          )}
      </Stack>

      {/* Footer: capabilities + Serverless badge */}
      {/* <Stack alignItems="center" direction="row" justifyContent="space-between">
        {model.isServerless && <IsServerlessChip />}
      </Stack> */}
    </Paper>
  );
};

export const ModelCardSkeleton = () => {
  return (
    <Paper className={styles.skeletonCard} outlined>
      {/* Header skeleton */}
      <Stack alignItems="center" direction="row" spacing="12px">
        <Skeleton height={36} variant="circular" width={36} />
        <Stack flexGrow={1} spacing="4px">
          <Skeleton height={20} width="40%" />
          <Skeleton height={16} width="25%" />
        </Stack>
        <Skeleton height={16} width={90} />
      </Stack>
      {/* Description skeleton */}
      <Stack spacing="4px">
        <Skeleton height={14} width="100%" />
        <Skeleton height={14} width="90%" />
        <Skeleton height={14} width="75%" />
      </Stack>
      {/* Tags skeleton */}
      <Stack direction="row" spacing="8px">
        <Skeleton height={24} width={90} />
        <Skeleton height={24} width={110} />
        <Skeleton height={24} width={80} />
      </Stack>
      {/* Stats skeleton */}
      <Stack direction="row" spacing="0">
        <Skeleton height={40} sx={{ flex: 1 }} />
        <Skeleton height={40} sx={{ flex: 1, ml: '1px' }} />
      </Stack>
      {/* Price skeleton */}
      <Skeleton height={16} width="60%" />
      {/* Footer skeleton */}
      <Stack direction="row" spacing="8px">
        <Skeleton height={24} width={60} />
        <Skeleton height={24} width={65} />
        <Skeleton height={24} width={80} />
      </Stack>
    </Paper>
  );
};
