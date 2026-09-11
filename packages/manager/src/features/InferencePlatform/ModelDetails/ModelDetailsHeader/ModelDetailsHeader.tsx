import { useTheme } from '@linode/ui';
import React from 'react';

import { Box } from '../../components/Box/Box';
import { ModelFeaturesList } from '../../components/ModelFeaturesList';
import { Stack } from '../../components/Stack/Stack';
import { Typography } from '../../components/Typography/Typography';
import { modelIcon, modelIconStyles } from '../../utils';
import { InferenceModelID } from './InferenceModelID';
import styles from './ModelDetailsHeader.module.css';
import { TryInPlayground } from './TryInPlayground';

import type { Model } from '../../ModelLibrary/modelLibrary.types';

interface ModelDetailsHeaderProps {
  /** Merged model resolved from the route id, if available. */
  model?: Model;
  /** ID of the model whose details are being shown, from the route. */
  modelId: string;
}

/**
 * 1 — ModelDetailsHeader
 *
 * Row A: provider logo + name and model title + ID on the left, the
 * Try in Playground action on the right. Row B spans the full width beneath.
 */
export const ModelDetailsHeader = ({
  model,
  modelId,
}: ModelDetailsHeaderProps) => {
  const cmTheme = useTheme();
  const ProviderIcon = model?.modelLogo ? modelIcon(model.modelLogo) : null;

  return (
    <Stack className={styles.root} width="100%">
      {/* Row A */}
      <Stack
        alignItems="flex-start"
        className={styles.rowA}
        direction="row"
        justifyContent="space-between"
        width="100%"
      >
        {/* Identity: logo column + info column */}
        <Stack
          alignItems="flex-start"
          className={styles.identity}
          direction="row"
        >
          {/* Left column: model logo */}
          {ProviderIcon && (
            <Box
              className={styles.modelLogo}
              component={ProviderIcon}
              style={modelIconStyles(model!.modelLogo || '', cmTheme)}
            />
          )}

          {/* Right column: name/ID on top, provider below */}
          <Stack className={styles.info}>
            <Stack
              alignItems="center"
              className={styles.infoTop}
              direction="row"
            >
              <Typography className={styles.modelName} component="h1">
                {model?.title ?? '—'}
              </Typography>
              <InferenceModelID modelId={modelId} />
            </Stack>
            <Typography className={styles.providerName}>
              {model?.providerName ?? '—'}
            </Typography>
          </Stack>
        </Stack>

        {/* Actions */}
        <Stack alignItems="center" className={styles.right} direction="row">
          {model?.playgroundAvailable && <TryInPlayground modelId={modelId} />}
        </Stack>
      </Stack>

      {/* Row C: Model Chips */}
      <Stack className={styles.rowC} width="100%">
        <ModelFeaturesList inputMode model={model} outputMode useCase />
      </Stack>
    </Stack>
  );
};
