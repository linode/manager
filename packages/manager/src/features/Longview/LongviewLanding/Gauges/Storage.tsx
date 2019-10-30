import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { readableBytes } from 'src/utilities/unitConversions';
import requestStats from '../../request';
import { Disk } from '../../request.types';
import { baseGaugeProps } from './common';

interface Props {
  clientAPIKey: string;
  lastUpdated?: number;
}

const StorageGauge: React.FC<Props> = props => {
  const { clientAPIKey, lastUpdated } = props;

  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<APIError | undefined>();

  // The Longview API returns disk usage data in bytes.
  const [storageInBytes, setStorageInBytes] = React.useState<
    Storage | undefined
  >();

  React.useEffect(() => {
    requestStats(clientAPIKey, 'getLatestValue', ['disk'])
      .then(data => {
        setLoading(false);
        setError(undefined);
        setStorageInBytes(sumStorage(data.Disk));
      })
      .catch(_ => {
        if (!storageInBytes) {
          setError({
            reason: 'Error' // @todo: Error message?
          });
          setLoading(false);
        }
      });
  }, [lastUpdated]);

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
        error
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

export default StorageGauge;

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
  error?: APIError
) => {
  if (error) {
    return error.reason;
  }

  if (loading) {
    return 'Loading...';
  }

  return value;
};
