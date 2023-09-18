import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingLoading } from 'src/components/LandingLoading/LandingLoading';
import { Placeholder } from 'src/components/Placeholder/Placeholder';

import { WithStartAndEnd } from '../../../request.types';
import { useGraphs } from '../OverviewGraphs/useGraphs';
import { DiskGraph } from './DiskGraph';
import { StyledBox, StyledTimeRangeSelect } from './Disks.styles';

interface Props {
  clientAPIKey: string;
  clientID: number;
  clientLastUpdated?: number;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

const Disks = (props: Props) => {
  const {
    clientAPIKey,
    clientLastUpdated,
    lastUpdated,
    lastUpdatedError,
  } = props;

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const { data, error, loading, request } = useGraphs(
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
    lastUpdated,
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
        <Placeholder renderAsSecondary title="No disks detected">
          The Longview agent has not detected any disks that it can monitor.
        </Placeholder>
      );
    }

    return sortedKeys.map((eachKey) => (
      <DiskGraph
        diskLabel={eachKey}
        endTime={time.end}
        key={eachKey}
        loading={loading}
        startTime={time.start}
        stats={diskData[eachKey]}
        sysInfoType={data.SysInfo?.type ?? ''}
        timezone={props.timezone}
      />
    ));
  };

  return (
    <div>
      <DocumentTitleSegment segment="Disks" />
      <StyledBox display="flex" flexDirection="row" justifyContent="flex-end">
        <StyledTimeRangeSelect
          defaultValue="Past 30 Minutes"
          handleStatsChange={handleStatsChange}
          hideLabel
          label="Select Time Range"
          small
        />
      </StyledBox>
      {renderContent()}
    </div>
  );
};

export default React.memo(Disks);
