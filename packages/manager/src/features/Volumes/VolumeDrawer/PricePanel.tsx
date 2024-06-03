import * as React from 'react';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { useVolumeTypesQuery } from 'src/queries/volumes/volumes';
import { getDCSpecificPriceByType } from 'src/utilities/pricing/dynamicPricing';

interface Props {
  currentSize: number;
  regionId: string;
  value: number;
}

export const PricePanel = ({ currentSize, regionId, value }: Props) => {
  const { data: types, isLoading } = useVolumeTypesQuery();

  const getPrice = (size: number) => {
    return getDCSpecificPriceByType({
      regionId,
      size,
      type: types?.[0],
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

  if (isLoading) {
    return (
      <Box marginLeft={-1} marginTop={2}>
        <CircleProgress size="sm" />
      </Box>
    );
  }

  return (
    <Box marginTop={4}>
      <DisplayPrice interval="mo" price={price ? Number(price) : '--.--'} />
    </Box>
  );
};
