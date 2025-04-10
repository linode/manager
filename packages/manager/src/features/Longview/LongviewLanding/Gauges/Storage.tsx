import { Typography } from '@linode/ui';
import { readableBytes } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import withClientStats from 'src/containers/longview.stats.container';

import { sumStorage } from '../../shared/utilities';
import { baseGaugeProps } from './common';

import type { BaseProps as Props } from './common';
import type { Props as LVDataProps } from 'src/containers/longview.stats.container';

interface GetUsedStorageProps extends Props, LVDataProps {}

export const getUsedStorage = (data: LVDataProps['longviewClientData']) => {
  const storageInBytes = sumStorage(data.Disk);
  return storageInBytes ? storageInBytes.total - storageInBytes.free : 0;
};

export const StorageGauge = withClientStats<Props>((props) => props.clientID)((
  props: GetUsedStorageProps
) => {
  const {
    lastUpdatedError,
    longviewClientData,
    longviewClientDataError: error,
    longviewClientDataLoading: loading,
  } = props;

  const theme = useTheme();

  const storageInBytes = sumStorage(longviewClientData.Disk);

  const usedStorage = storageInBytes
    ? storageInBytes.total - storageInBytes.free
    : 0;

  return (
    <GaugePercent
      {...baseGaugeProps}
      filledInColor={theme.graphs.orange}
      innerText={innerText(
        readableBytes(usedStorage).formatted,
        loading,
        !!error || !!lastUpdatedError
      )}
      max={storageInBytes ? storageInBytes.total : 0}
      subTitle={
        <>
          <Typography>
            <strong>Storage</strong>
          </Typography>
          {!error && !loading && storageInBytes && (
            <Typography>
              {readableBytes(storageInBytes.total).formatted}
            </Typography>
          )}
        </>
      }
      value={usedStorage}
    />
  );
});

export const innerText = (value: string, loading: boolean, error: boolean) => {
  if (error) {
    return 'Error';
  }

  if (loading) {
    return 'Loading...';
  }

  return value;
};
