import React from 'react';

import { Paper, Typography } from '../../components';
import styles from './ModelHighlights.module.css';

import type { Model } from '../../ModelLibrary/modelLibrary.types';

interface ModelHighlightsProps {
  model?: Model;
}

/**
 * 6 — ModelHighlights
 *
 * Bulleted list of the model's key feature highlights, sourced entirely from
 * the model's `highlights` data. Hidden when the model has none.
 */
export const ModelHighlights = ({ model }: ModelHighlightsProps) => {
  const highlights = model?.highlights ?? [];

  if (highlights.length === 0) {
    return null;
  }

  const title = model?.title ? `${model.title} Highlights` : 'Highlights';

  return (
    <Paper className={styles.paper}>
      <Typography className={styles.title} component="h3">
        {title}
      </Typography>
      <ul className={styles.list}>
        {highlights.map((h) => (
          <li className={styles.item} key={h.title}>
            <span className={styles.bullet} />
            <Typography className={styles.itemText} component="span">
              <span className={styles.label}>{h.title}:</span> {h.item_text}
            </Typography>
          </li>
        ))}
      </ul>
    </Paper>
  );
};
