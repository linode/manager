import React from 'react';

import { Box } from '../Box/Box';
import { Stack } from '../Stack/Stack';
import styles from './ModelPricingRow.module.css';

interface ModelPricingRowLabelProps {
  priceInputCachedPerMillion?: number;
  priceInputPerMillion?: number;
  priceOutputPerMillion?: number;
}

export const ModelPricingRow = ({
  priceInputPerMillion,
  priceInputCachedPerMillion,
  priceOutputPerMillion,
}: ModelPricingRowLabelProps) => {
  return (
    <Box className={styles.pricingForRow}>
      <Box className={styles.pricingTitle}>Pricing: </Box>

      <Box className={styles.modelPricing}>
        {priceInputPerMillion !== undefined && (
          <Stack className={styles.priceBlock} direction="row">
            <Box className={styles.amountLabel}>Input</Box>
            <Box className={styles.amount}>
              ${priceInputPerMillion.toFixed(2)}
            </Box>
          </Stack>
        )}{' '}
        {priceInputCachedPerMillion !== undefined && (
          <Stack className={styles.priceBlock} direction="row">
            <Box className={styles.amountLabel}>Cached</Box>
            <Box className={styles.amount}>
              ${priceInputCachedPerMillion.toFixed(2)}
            </Box>
          </Stack>
        )}
        {priceOutputPerMillion !== undefined && (
          <Stack className={styles.priceBlock} direction="row">
            <Box className={styles.amountLabel}>Output</Box>
            <Box className={styles.amount}>
              ${priceOutputPerMillion.toFixed(2)}
            </Box>
          </Stack>
        )}{' '}
        <Box className={styles.pricingSubTitle}> Per Million Tokens</Box>
      </Box>
    </Box>
  );
};
