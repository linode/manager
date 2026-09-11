import { useTheme } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { providerIcon, providerIconStyles } from '../../utils';
import { Box } from '../Box/Box';
import { ModelFeatureChip } from '../ModelFeatureChip';
import { Paper } from '../Paper/Paper';
import { Stack } from '../Stack/Stack';
import { Typography } from '../Typography/Typography';
import { ModelPricingRow } from './ModelPricingRow';
import styles from './ModelRow.module.css';
import { PlaygroundLink } from './PlaygroundLink';

import type { Model } from '../../ModelLibrary/modelLibrary.types';

interface ModelRowProps {
  model: Model;
}

export const ModelRow = ({ model }: ModelRowProps) => {
  const cmTheme = useTheme();
  const navigate = useNavigate();

  const navigateToModelDetails = () => {
    navigate({
      params: { modelId: model.id },
      to: '/inference-platform/model-library/$modelId',
    });
  };

  return (
    <Paper
      aria-label={`View details for ${model.title}`}
      className={styles.row}
      onClick={navigateToModelDetails}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigateToModelDetails();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Header: logo + title + provider + Playground link */}
      <Stack
        alignItems="flex-start"
        direction="row"
        justifyContent="space-between"
      >
        <Stack alignItems="flex-start" direction="row" spacing="12px">
          <Box
            component={providerIcon(model.providerLogo)!}
            style={{
              height: 22,
              width: 22,
              ...providerIconStyles(model.providerLogo, cmTheme),
            }}
          />

          <Stack>
            <div className={styles.titleBox}>
              <Typography
                className={styles.providerText}
                style={{
                  color: cmTheme.palette.primary.dark,
                  fontFamily: cmTheme.font.semibold,
                }}
              >
                {`${model.providerName} / `}
              </Typography>
              <Typography
                className={styles.modelTitle}
                style={{
                  color: cmTheme.palette.primary.main,
                  fontFamily: cmTheme.font.bold,
                }}
              >
                {model.title}
              </Typography>
            </div>
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

      {/* Footer: use-case tags + pricing */}
      <Stack
        alignItems="center"
        className={styles.footer}
        direction="row"
        justifyContent="space-between"
      >
        {model.useCaseTags.length > 0 && (
          <Stack
            alignItems="flex-start"
            direction="row"
            justifyContent="space-between"
            spacing="3.2px"
          >
            {model.useCaseTags.slice(0, 5).map((tag, index) => (
              <ModelFeatureChip
                description={tag.description}
                key={`tag-${index}`}
                label={tag.label}
                type="useCaseTags"
              />
            ))}
          </Stack>
        )}

        {model.priceInputPerMillion !== undefined &&
          model.priceOutputPerMillion !== undefined && (
            <ModelPricingRow
              priceInputCachedPerMillion={model.priceInputCachedPerMillion}
              priceInputPerMillion={model.priceInputPerMillion}
              priceOutputPerMillion={model.priceOutputPerMillion}
            />
          )}
      </Stack>
    </Paper>
  );
};
