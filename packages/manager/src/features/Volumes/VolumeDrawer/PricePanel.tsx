import * as React from 'react';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { MAX_VOLUME_SIZE } from 'src/constants';
import Box from 'src/components/core/Box';

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
  value: number;
  currentSize: number;
}

export const PricePanel = ({ currentSize, value }: Props) => {
  const price = getClampedPrice(value, currentSize);

  return (
    <Box marginTop={4}>
      <DisplayPrice price={price} interval="mo" />
    </Box>
  );
};
