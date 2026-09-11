import React from 'react';

import { Paper, Stack, Typography } from '../../components';
import styles from './InferencePricing.module.css';

import type { Model } from '../../ModelLibrary/modelLibrary.types';

interface InferencePricingProps {
  /** Merged model resolved from the route id, if available. */
  model?: Model;
}

const formatPrice = (price?: number): string =>
  price === undefined ? '—' : `$${price.toFixed(2)}`;

/**
 * 3 — InferencePricing
 *
 * Per 1M token pricing card: Cached / Input / Output.
 *
 * NOTE: pricing currently comes from the API v4 InferencePlatform model data.
 * This may change in the future to a dedicated API supplied by the billing team.
 */
export const InferencePricing = ({ model }: InferencePricingProps) => {
  const cells = [
    { label: 'Cached', price: model?.priceInputCachedPerMillion },
    { label: 'Input', price: model?.priceInputPerMillion },
    { label: 'Output', price: model?.priceOutputPerMillion },
  ];

  return (
    <Paper className={styles.paper}>
      <Stack alignItems="baseline" className={styles.header} direction="row">
        <Typography className={styles.title} component="h3">
          Serverless pricing
        </Typography>
        <Typography className={styles.subtitle} component="span">
          per 1 million tokens
        </Typography>
      </Stack>

      <div className={styles.grid}>
        {cells.map((cell) => (
          <Stack className={styles.cell} key={cell.label}>
            <Typography className={styles.cellLabel} component="span">
              {cell.label}
            </Typography>
            <Typography className={styles.cellPrice} component="span">
              {formatPrice(cell.price)}
            </Typography>
          </Stack>
        ))}
      </div>
    </Paper>
  );
};
