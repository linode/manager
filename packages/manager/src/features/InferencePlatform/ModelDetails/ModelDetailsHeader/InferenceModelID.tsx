import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import { Box, Typography } from '../../components';
import styles from './InferenceModelID.module.css';

interface InferenceModelIDProps {
  /** The model's ID, shown as monospace text with a copy button. */
  modelId: string;
}

/**
 * Displays the model's ID with a copy button to its right, styled as the
 * bordered pill from the Model Details design.
 */
export const InferenceModelID = ({ modelId }: InferenceModelIDProps) => {
  const id = modelId || '—';

  return (
    <Box className={styles.pill}>
      <Typography className={styles.id} component="span">
        {id}
      </Typography>
      <CopyTooltip className={styles.copyIcon} text={id} />
    </Box>
  );
};
