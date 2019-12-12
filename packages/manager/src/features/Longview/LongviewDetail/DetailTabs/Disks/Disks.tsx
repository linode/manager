import { APIError } from 'linode-js-sdk/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
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
import { Disk, LongviewDisk, LongviewSystemInfo } from '../../../request.types';
import { pathMaybeAddDataInThePast } from '../../../shared/formatters';

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

type CombinedProps = Props & WithSnackbarProps;

const Disks: React.FC<CombinedProps> = props => {
  const [diskStats, updateDiskStats] = React.useState<
    Partial<Disk<'yAsNull'>> | undefined
  >();
  const [sysInfoType, updateSysInfoType] = React.useState<string>('');
  const [fetchError, setError] = React.useState<string>('');
  const [statsLoading, setLoading] = React.useState<boolean>(false);
  const [start, setStart] = React.useState<number>(0);
  const [end, setEnd] = React.useState<number>(0);

  const classes = useStyles();

  let mounted = false;

  const { lastUpdatedError, clientLastUpdated, clientAPIKey } = props;

  const handleError = () => {
    props.enqueueSnackbar(
      'There was an error retriving stats for the selected time.',
      {
        variant: 'error'
      }
    );
  };

  const request = (
    _start: number,
    _end: number,
    cb?: Function
  ): Promise<Partial<LongviewDisk<''> & LongviewSystemInfo>> => {
    if (_start && _end && clientLastUpdated) {
      if (!diskStats) {
        setLoading(true);
      }

      setError('');

      return getStats(clientAPIKey, 'getValues', {
        fields: ['disk', 'sysinfo'],
        start: _start,
        end: _end
      })
        .then(r => {
          if (mounted) {
            setLoading(false);
            const _disk = pathOr({}, ['Disk'], r);

            const pathsToAlter = Object.keys(_disk).reduce(
              (acc, eachKey) => {
                acc.push(
                  ...[
                    [eachKey, 'reads'],
                    [eachKey, 'writes'],
                    [eachKey, 'fs', 'free'],
                    [eachKey, 'fs', 'total'],
                    [eachKey, 'fs', 'itotal'],
                    [eachKey, 'fs', 'ifree']
                  ]
                );

                return acc;
              },
              [] as (string | number)[][]
            );

            const enhancedDisk = pathMaybeAddDataInThePast<Disk<'yAsNull'>>(
              _disk,
              start,
              pathsToAlter
            );

            updateDiskStats(enhancedDisk);
            updateSysInfoType(pathOr('', ['SysInfo', 'type'], r));
          }
          if (cb) {
            cb();
          }
          return r;
        })
        .catch(() => {
          const e = 'There was an error fetching statistics for your Disks.';
          if (mounted) {
            setLoading(false);
            if (!diskStats) {
              setError(e);
            }
          }
          return Promise.reject([{ reason: e }]);
        });
    }
    return Promise.resolve({});
  };

  const setStartAndEnd = (_start: number, _end: number) => {
    return request(_start, _end, () => {
      setStart(_start);
      setEnd(_end);
    });
  };

  React.useEffect(() => {
    mounted = true;
    request(start, end);

    return () => {
      mounted = false;
    };
  }, [clientLastUpdated]);

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
          small
          className={classes.root}
          handleFetchError={handleError}
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

export default compose<CombinedProps, Props>(
  React.memo,
  withSnackbar
)(Disks);
