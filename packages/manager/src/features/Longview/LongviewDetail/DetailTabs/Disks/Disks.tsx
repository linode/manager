import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Box from 'src/components/core/Box';
import ErrorState from 'src/components/ErrorState';
import LandingLoading from 'src/components/LandingLoading';
import Placeholder from 'src/components/Placeholder';
import useFlags from 'src/hooks/useFlags';
import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import DiskGraph from './DiskGraph';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { WithStartAndEnd } from '../../../request.types';
import { useGraphs } from '../OverviewGraphs/useGraphs';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: 250,
    marginBottom: theme.spacing()
  },
  cmrSpacing: {
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing()
    }
  }
}));

interface Props {
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
  const flags = useFlags();

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
          renderAsSecondary
        />
      );
    }

    return sortedKeys.map(eachKey => (
      <DiskGraph
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
    <div>
      <DocumentTitleSegment segment="Disks" />
      <Box
        className={flags.cmr ? classes.cmrSpacing : ''}
        display="flex"
        flexDirection="row"
        justifyContent="flex-end"
      >
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
