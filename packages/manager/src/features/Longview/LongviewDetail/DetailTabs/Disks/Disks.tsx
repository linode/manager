import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Box from 'src/components/core/Box';
import ErrorState from 'src/components/ErrorState';
import LandingLoading from 'src/components/LandingLoading';
import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import DiskPaper from './DiskPaper';

import getStats from '../../../request';
import { Disk } from '../../../request.types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: 250,
    marginBottom: theme.spacing()
  }
}));

interface Props extends RouteComponentProps<{}> {
  clientAPIKey: string;
  clientID: number;
  clientLastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

type CombinedProps = Props;

const Disks: React.FC<CombinedProps> = props => {
  const [diskStats, updateDiskStats] = React.useState<
    Partial<Disk> | undefined
  >();
  const [sysInfoType, updateSysInfoType] = React.useState<string>('');
  const [fetchError, setError] = React.useState<string>('');
  const [statsLoading, setLoading] = React.useState<boolean>(false);
  const [start, setStart] = React.useState<number>(0);
  const [end, setEnd] = React.useState<number>(0);

  const classes = useStyles();

  let mounted = false;

  const { lastUpdatedError, clientLastUpdated, clientAPIKey } = props;

  const setStartAndEnd = (_start: number, _end: number) => {
    setStart(_start);
    setEnd(_end);
  };

  React.useEffect(() => {
    mounted = true;
    if (clientLastUpdated && start && end) {
      if (!diskStats) {
        setLoading(true);
      }

      setError('');

      getStats(clientAPIKey, 'getValues', {
        fields: ['disk', 'sysinfo'],
        start,
        end
      })
        .then(r => {
          if (mounted) {
            setLoading(false);
            updateDiskStats((r || {}).Disk);
            updateSysInfoType(pathOr('', ['SysInfo', 'type'], r));
          }
        })
        .catch(e => {
          if (mounted) {
            setLoading(false);
            if (!diskStats) {
              setError(
                'There was an error fetching statistics for your Disks.'
              );
            }
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [clientLastUpdated, start, end]);

  const renderContent = () => {
    if (fetchError || lastUpdatedError) {
      return (
        <ErrorState errorText="There was an error fetching statistics for your Disks." />
      );
    }

    if (statsLoading) {
      return <LandingLoading shouldDelay />;
    }
    /*
      Longview doesn't return the Disk stats in any particular order, so sort them
      alphabetically now
    */
    const sortedKeys = Object.keys(diskStats || {}).sort();

    return sortedKeys.map(eachKey => (
      <DiskPaper
        diskLabel={eachKey}
        key={eachKey}
        stats={(diskStats || {})[eachKey]}
        timezone={props.timezone}
        sysInfoType={sysInfoType}
        startTime={start}
        endTime={end}
      />
    ));
  };

  return (
    <div id="tabpanel-disks" role="tabpanel" aria-labelledby="tab-disks">
      <Box display="flex" flexDirection="row" justifyContent="flex-end">
        <TimeRangeSelect
          className={classes.root}
          handleStatsChange={setStartAndEnd}
          defaultValue="Past 30 Minutes"
          label="Select Time Range"
          hideLabel
        />
      </Box>
      {renderContent()}
    </div>
  );
};

export default compose<CombinedProps, Props>(React.memo)(Disks);
