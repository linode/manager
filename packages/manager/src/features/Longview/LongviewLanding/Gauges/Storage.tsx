import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import { Typography } from 'src/components/Typography';
import withClientStats, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';
import { readableBytes } from 'src/utilities/unitConversions';

import { sumStorage } from '../../shared/utilities';
import { BaseProps as Props, baseGaugeProps } from './common';

type CombinedProps = Props & LVDataProps;

export const getUsedStorage = (data: LVDataProps['longviewClientData']) => {
  const storageInBytes = sumStorage(data.Disk);
  return storageInBytes ? storageInBytes.total - storageInBytes.free : 0;
};

export const StorageGauge = withClientStats<Props>((props) => props.clientID)(
  (props: CombinedProps) => {
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
        innerText={innerText(
          readableBytes(usedStorage).formatted,
          loading,
          !!error || !!lastUpdatedError
        )}
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
        filledInColor={theme.graphs.orange}
        max={storageInBytes ? storageInBytes.total : 0}
        value={usedStorage}
      />
    );
  }
);

export const innerText = (value: string, loading: boolean, error: boolean) => {
  if (error) {
    return 'Error';
  }

  if (loading) {
    return 'Loading...';
  }

  return value;
};
