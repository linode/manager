import * as React from 'react';

import { Box } from 'src/components/Box';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { MAX_VOLUME_SIZE } from 'src/constants';

const getPrice = (size: number) => {
  return size * 0.1;
};

const getClampedPrice = (newSize: number, currentSize: number) =>
  newSize >= currentSize
    ? newSize <= MAX_VOLUME_SIZE
      ? getPrice(newSize)
      : getPrice(MAX_VOLUME_SIZE)
    : getPrice(currentSize);

interface Props {
  currentSize: number;
  value: number;
}

export const PricePanel = ({ currentSize, value }: Props) => {
  const price = getClampedPrice(value, currentSize);

  return (
    <Box marginTop={4}>
      <DisplayPrice interval="mo" price={price} />
    </Box>
  );
};
