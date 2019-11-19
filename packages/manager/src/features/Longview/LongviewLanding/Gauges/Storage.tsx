import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import withClientStats, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import { readableBytes } from 'src/utilities/unitConversions';
import { sumStorage } from '../../shared/utilities';
import { baseGaugeProps, BaseProps as Props } from './common';

const StorageGauge: React.FC<Props & LVDataProps> = props => {
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
      filledInColor="#F4AC3D"
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

export default withClientStats<Props>(props => props.clientID)(StorageGauge);

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
