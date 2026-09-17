import React from 'react';

import { Box } from '../Box/Box';
import { Stack } from '../Stack/Stack';
import styles from './ModelPricing.module.css';

interface ModelPricingLabelProps {
  priceInputCachedPerMillion?: number;
  priceInputPerMillion?: number;
  priceOutputPerMillion?: number;
}

export const ModelPricing = ({
  priceInputPerMillion,
  priceInputCachedPerMillion,
  priceOutputPerMillion,
}: ModelPricingLabelProps) => {
  return (
    <Stack className={styles.pricing}>
      <Box className={styles.modelPricing}>
        {priceInputPerMillion !== undefined && (
          <Stack className={styles.priceBlock}>
            <Box className={styles.amountLabel}>Input</Box>
            <Box className={styles.amount}>
              ${priceInputPerMillion.toFixed(2)}
            </Box>
          </Stack>
        )}{' '}
        {priceInputCachedPerMillion !== undefined && (
          <Stack className={styles.priceBlock}>
            <Box className={styles.amountLabel}>Cached</Box>
            <Box className={styles.amount}>
              ${priceInputCachedPerMillion.toFixed(2)}
            </Box>
          </Stack>
        )}
        {priceOutputPerMillion !== undefined && (
          <Stack className={styles.priceBlock}>
            <Box className={styles.amountLabel}>Output</Box>
            <Box className={styles.amount}>
              ${priceOutputPerMillion.toFixed(2)}
            </Box>
          </Stack>
        )}{' '}
      </Box>
    </Stack>
  );
};
