import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Box from 'src/components/core/Box';
import ErrorState from 'src/components/ErrorState';
import LandingLoading from 'src/components/LandingLoading';
import Placeholder from 'src/components/Placeholder';
import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import DiskPaper from './DiskPaper';

import { WithStartAndEnd } from '../../../request.types';
import { useGraphs } from '../OverviewGraphs/useGraphs';

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
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

type CombinedProps = Props;

const Disks: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    lastUpdated,
    lastUpdatedError,
    clientLastUpdated,
    clientAPIKey
  } = props;

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ start, end });
  };

  const { data, loading, error, request } = useGraphs(
    ['disk', 'sysinfo'],
    clientAPIKey,
    time.start,
    time.end
  );

  React.useEffect(() => {
    request();
  }, [
    time.start,
    time.end,
    clientAPIKey,
    clientLastUpdated,
    lastUpdatedError,
    lastUpdated
  ]);

  const renderContent = () => {
    const diskData = data.Disk ?? {};
    if (error || lastUpdatedError) {
      return (
        <ErrorState errorText="There was an error fetching statistics for your Disks." />
      );
    }

    if (loading && Object.keys(diskData).length === 0) {
      return <LandingLoading />;
    }
    /*
      Longview doesn't return the Disk stats in any particular order, so sort them
      alphabetically now
    */
    const sortedKeys = Object.keys(diskData).sort();

    if (!loading && sortedKeys.length === 0) {
      // Empty state
      return (
        <Placeholder
          title="No disks detected"
          copy="The Longview agent has not detected any disks that it can monitor."
        />
      );
    }

    return sortedKeys.map(eachKey => (
      <DiskPaper
        loading={loading}
        diskLabel={eachKey}
        key={eachKey}
        stats={diskData[eachKey]}
        timezone={props.timezone}
        sysInfoType={data.SysInfo?.type ?? ''}
        startTime={time.start}
        endTime={time.end}
      />
    ));
  };

  return (
    <div id="tabpanel-disks" role="tabpanel" aria-labelledby="tab-disks">
      <Box display="flex" flexDirection="row" justifyContent="flex-end">
        <TimeRangeSelect
          small
          className={classes.root}
          handleStatsChange={handleStatsChange}
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
