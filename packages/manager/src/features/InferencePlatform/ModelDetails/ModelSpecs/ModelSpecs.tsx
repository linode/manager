import React from 'react';

import { ModelFeatureChip } from '../../components/ModelFeatureChip';
import { Paper } from '../../components/Paper/Paper';
import { Typography } from '../../components/Typography/Typography';
import { InferenceLogo } from '../../InferenceLogo';
import styles from './ModelSpecs.module.css';

import type { Model } from '../../ModelLibrary/modelLibrary.types';

interface ModelSpecsProps {
  model?: Model;
}

const formatReleaseDate = (iso?: string): string => {
  if (!iso) return '—';
  // Date-only strings ("YYYY-MM-DD") are parsed as UTC midnight; render them
  // in UTC so a west-of-UTC viewer doesn't see the previous day.
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
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
          <span className={styles.leader} />
          <div className={styles.providerRow}>
            {model?.providerLogo && (
              <InferenceLogo
                alt={model?.providerName ?? ''}
                className={styles.providerIcon}
                kind="provider"
                value={model.providerLogo}
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
          <span className={styles.leader} />
          <Typography className={styles.value} component="span">
            {formatReleaseDate(model?.releasedAt)}
          </Typography>
        </div>

        {/* Parameters */}
        <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Parameters
          </Typography>
          <span className={styles.leader} />
          <Typography className={styles.value} component="span">
            {model?.totalParams ??
              (model?.parametersB ? `${model.parametersB}B` : '—')}
          </Typography>
        </div>

        {/* Context Length */}
        <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Context Length
          </Typography>
          <span className={styles.leader} />
          <Typography className={styles.value} component="span">
            {model?.contextLengthK ? `${model.contextLengthK} k` : '—'}
          </Typography>
        </div>

        {/* Modalities — input and output are separate fields in the model */}
        <div className={styles.row}>
          <Typography className={styles.label} component="span">
            Input Modalities
          </Typography>
          <span className={styles.leader} />
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
          <span className={styles.leader} />
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
