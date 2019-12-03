import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import ErrorState from 'src/components/ErrorState';
import LandingLoading from 'src/components/LandingLoading';
import DiskPaper from './DiskPaper';

import getStats from '../../../request';
import { LongviewDisk } from '../../../request.types';

interface Props extends RouteComponentProps<{}> {
  clientAPIKey: string;
  clientID: number;
  clientLastUpdated?: number;
  lastUpdatedError?: APIError[];
}

type CombinedProps = Props;

const Disks: React.FC<CombinedProps> = props => {
  const [diskStats, updateDiskStats] = React.useState<
    Partial<LongviewDisk> | undefined
  >();
  const [fetchError, setError] = React.useState<string>('');
  const [statsLoading, setLoading] = React.useState<boolean>(false);

  const { lastUpdatedError, clientLastUpdated, clientAPIKey } = props;

  React.useEffect(() => {
    if (clientLastUpdated) {
      if (!diskStats) {
        setLoading(true);
      }

      setError('');

      getStats(clientAPIKey, 'getValues', {
        fields: ['disk']
      })
        .then(r => {
          setLoading(false);
          updateDiskStats(r);
        })
        .catch(e => {
          setLoading(false);
          if (!diskStats) {
            setError('There was an error fetching statistics for your Disks.');
          }
        });
    }
  }, [clientLastUpdated]);

  if (fetchError || lastUpdatedError) {
    return (
      <ErrorState errorText="There was an error fetching statistics for your Disks." />
    );
  }

  if (statsLoading) {
    return <LandingLoading shouldDelay />;
  }

  return (
    <React.Fragment>
      {Object.keys((diskStats || {}).Disk || {}).map(eachKey => (
        <DiskPaper
          diskLabel={eachKey}
          key={eachKey}
          stats={(diskStats || {})[eachKey]}
        />
      ))}
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(Disks);
