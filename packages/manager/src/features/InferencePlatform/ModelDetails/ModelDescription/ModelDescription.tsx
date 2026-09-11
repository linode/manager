import React from 'react';

import { Paper } from '../../components/Paper/Paper';
import { Typography } from '../../components/Typography/Typography';
import styles from './ModelDescription.module.css';

import type { Model } from '../../ModelLibrary/modelLibrary.types';

interface ModelDescriptionProps {
  /** Whether the model list is still being fetched. */
  isLoading?: boolean;
  /** Merged model resolved from the route id, if available. */
  model?: Model;
}

/**
 * 2 — ModelDescription
 *
 * Summary paragraph describing the model, rendered in a card to match the
 * Model Details design (16px body copy, relaxed line-height).
 */
export const ModelDescription = ({
  isLoading,
  model,
}: ModelDescriptionProps) => {
  const description = model?.descriptionLong || model?.description || '';

  const text = isLoading
    ? 'Loading model description…'
    : description || 'No description available for this model.';

  return (
    <Paper className={styles.paper}>
      <Typography className={styles.text}>{text}</Typography>
    </Paper>
  );
};
