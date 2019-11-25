import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { WithTheme, withTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import withClientStats, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import { readableBytes } from 'src/utilities/unitConversions';
import { Disk } from '../../request.types';
import { baseGaugeProps, BaseProps as Props } from './common';

type CombinedProps = Props & LVDataProps & WithTheme;

export const getUsedStorage = (data: LVDataProps['longviewClientData']) => {
  const storageInBytes = sumStorage(data.Disk);
  return storageInBytes ? storageInBytes.total - storageInBytes.free : 0;
};

const StorageGauge: React.FC<CombinedProps> = props => {
  const {
    longviewClientDataError: error,
    longviewClientDataLoading: loading,
    longviewClientData,
    lastUpdatedError
  } = props;

  const storageInBytes = sumStorage(longviewClientData.Disk);

  const usedStorage = storageInBytes
    ? storageInBytes.total - storageInBytes.free
    : 0;

  return (
    <GaugePercent
      {...baseGaugeProps}
      max={storageInBytes ? storageInBytes.total : 0}
      value={usedStorage}
      innerText={innerText(
        readableBytes(usedStorage).formatted,
        loading,
        error || lastUpdatedError
      )}
      filledInColor={props.theme.graphs.orange}
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
    />
  );
};

export default withClientStats<Props>(props => props.clientID)(
  withTheme(StorageGauge)
);

// UTILITIES
interface Storage {
  free: number;
  total: number;
}

export const sumStorage = (DiskData: Record<string, Disk> = {}): Storage => {
  let free = 0;
  let total = 0;
  Object.keys(DiskData).forEach(key => {
    const disk = DiskData[key];
    free += pathOr(0, ['fs', 'free', 0, 'y'], disk);
    total += pathOr(0, ['fs', 'total', 0, 'y'], disk);
  });
  return { free, total };
};

export const innerText = (
  value: string,
  loading: boolean,
  error?: APIError[]
) => {
  if (error) {
    return 'Error';
  }

  if (loading) {
    return 'Loading...';
  }

  return value;
};
