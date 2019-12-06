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
import { LongviewDisk } from '../../../request.types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '250px',
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
    Partial<LongviewDisk> | undefined
  >();
  const [fetchError, setError] = React.useState<string>('');
  const [statsLoading, setLoading] = React.useState<boolean>(false);
  const [start, setStart] = React.useState<number>(0);
  const [end, setEnd] = React.useState<number>(0);

  const classes = useStyles();

  const { lastUpdatedError, clientLastUpdated, clientAPIKey } = props;

  const setStartAndEnd = (_start: number, _end: number) => {
    setStart(_start);
    setEnd(_end);
  };

  React.useEffect(() => {
    if (clientLastUpdated && start && end) {
      if (!diskStats) {
        setLoading(true);
      }

      setError('');

      getStats(clientAPIKey, 'getValues', {
        fields: ['disk'],
        start,
        end
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
    const sortedKeys = Object.keys(pathOr({}, ['Disk'], diskStats)).sort();

    return sortedKeys.map(eachKey => (
      <DiskPaper
        diskLabel={eachKey}
        key={eachKey}
        stats={pathOr({}, ['Disk'], diskStats)[eachKey]}
        timezone={props.timezone}
      />
    ));
  };

  return (
    <React.Fragment>
      <div
        id="tabpanel-longview-disks"
        role="tabpanel"
        aria-labelledby="tab-longview-disks"
      >
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
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(Disks);
