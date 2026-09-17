import { useTheme } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { InferenceLogo } from '../../InferenceLogo';
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
  const flags = useFlags();

  // Model Details is gated behind the 2026 beta features flag. When the flag
  // is off, the row is not clickable and no navigation happens.
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
      className={styles.row}
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
          <InferenceLogo
            alt={model.title}
            kind="model"
            style={{ height: 22, width: 22 }}
            value={model.modelLogo || model.providerLogo}
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
