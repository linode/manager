import { useTheme } from '@linode/ui';
import React from 'react';

import { Box } from '../../components/Box/Box';
import { ModelFeatureChip } from '../../components/ModelFeatureChip';
import { Paper } from '../../components/Paper/Paper';
import { Typography } from '../../components/Typography/Typography';
import { providerIcon, providerIconStyles } from '../../utils';
import styles from './ModelSpecs.module.css';

import type { Model } from '../../ModelLibrary/modelLibrary.types';

interface ModelSpecsProps {
  model?: Model;
}

const formatReleaseDate = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
};

/**
 * 5 — ModelSpecs
 *
 * Provider, Release Date, Category, Parameters, Context Length, Modalities,
 * and a Compare link. Inference (hyper)parameters — e.g. thinking effort and
 * function calling — will be supplied later by the API and shown in a dedicated
 * block below.
 */
export const ModelSpecs = ({ model }: ModelSpecsProps) => {
  const cmTheme = useTheme();
  const ProviderIcon = model?.providerLogo
    ? providerIcon(model.providerLogo)
    : null;

  const category = model?.useCaseTags?.[0]?.label ?? '—';

  const modalities = model?.inputModes?.length
    ? model.inputModes.map((m) => m.label)
    : ['—'];

  const outputModalities = model?.outputModes?.length
    ? model.outputModes.map((m) => m.label)
    : ['—'];

  return (
    <Paper className={styles.paper}>
      <Typography className={styles.title} component="h3">
        Model details
      </Typography>

      <div className={styles.rows}>
        {/* Provider */}
        <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Provider
          </Typography>
          <div className={styles.providerRow}>
            {ProviderIcon && (
              <Box
                className={styles.providerIcon}
                component={ProviderIcon}
                style={providerIconStyles(model!.providerLogo, cmTheme)}
              />
            )}
            <Typography className={styles.value} component="span">
              {model?.providerName ?? '—'}
            </Typography>
          </div>
        </div>

        {/* Release Date */}
        <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Release Date
          </Typography>
          <Typography className={styles.value} component="span">
            {formatReleaseDate(model?.releasedAt)}
          </Typography>
        </div>

        {/* Category */}
        <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Category
          </Typography>
          <Typography className={styles.value} component="span">
            {category}
          </Typography>
        </div>

        {/* Parameters */}
        <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Parameters
          </Typography>
          <Typography className={styles.value} component="span">
            {model?.parametersB ? `${model.parametersB} B` : '—'}
          </Typography>
        </div>

        {/* Context Length */}
        <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Context Length
          </Typography>
          <Typography className={styles.value} component="span">
            {model?.contextLengthK ? `${model.contextLengthK} k` : '—'}
          </Typography>
        </div>

        {/* Modalities — input and output are separate fields in the model */}
        <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Input Modalities
          </Typography>
          <div className={styles.chips}>
            {modalities.map((m) => (
              <ModelFeatureChip key={m} label={m} type="inputModes" />
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Output Modalities
          </Typography>
          <div className={styles.chips}>
            {outputModalities.map((m) => (
              <ModelFeatureChip key={m} label={m} type="outputModes" />
            ))}
          </div>
        </div>

        {/* Deployment */}
        {/* <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Deployment
          </Typography>
          <div className={styles.deployment}>
            {model?.isServerless && (
              <span className={styles.deploymentItem}>
                <span className={styles.checkIcon}>✓</span> Serverless
              </span>
            )}
            <span className={`${styles.deploymentItem} ${styles.staticValue}`}>
              <span className={styles.checkIcon}>✓</span> Dedicated
            </span>
          </div>
        </div> */}
      </div>
    </Paper>
  );
};
