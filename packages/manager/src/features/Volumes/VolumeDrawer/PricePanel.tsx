import * as React from 'react';

import { Box } from 'src/components/Box';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { getDynamicVolumePrice } from 'src/utilities/pricing/dynamicVolumePrice';

interface Props {
  currentSize: number;
  regionId: string;
  value: number;
}

export const PricePanel = ({ currentSize, regionId, value }: Props) => {
  const getPrice = (size: number) => {
    return getDynamicVolumePrice({
      regionId,
      size,
    });
  };

  const getClampedPrice = (
    newSize: number,
    currentSize: Props['currentSize']
  ) =>
    newSize >= currentSize
      ? newSize <= MAX_VOLUME_SIZE
        ? getPrice(newSize)
        : getPrice(MAX_VOLUME_SIZE)
      : getPrice(currentSize);
  const price = getClampedPrice(value, currentSize);

  return (
    <Box marginTop={4}>
      <DisplayPrice interval="mo" price={Number(price)} />
    </Box>
  );
};
