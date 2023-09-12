import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { isToday as _isToday } from 'src/utilities/isToday';

import {
  LongviewNetworkInterface,
  WithStartAndEnd,
} from '../../../request.types';
import { StyledItemGrid, StyledTimeRangeSelect } from '../CommonStyles.styles';
import { StyledBox } from '../Disks/Disks.styles';
import { useGraphs } from '../OverviewGraphs/useGraphs';
import { NetworkGraphs } from './NetworkGraphs';

interface Props {
  clientAPIKey: string;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

export const NetworkLanding = (props: Props) => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const { data, error, loading, request } = useGraphs(
    ['network'],
    clientAPIKey,
    time.start,
    time.end
  );

  React.useEffect(() => {
    request();
  }, [clientAPIKey, lastUpdated, lastUpdatedError, time]);

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const interfaces: LongviewNetworkInterface = data?.Network?.Interface ?? {};

  const isToday = _isToday(time.start, time.end);

  return (
    <Grid container direction="column" spacing={2}>
      <DocumentTitleSegment segment={'Network'} />
      <StyledItemGrid xs={12}>
        <StyledBox
          alignItems="center"
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
        >
          <StyledTimeRangeSelect
            defaultValue="Past 30 Minutes"
            handleStatsChange={handleStatsChange}
            hideLabel
            label="Select Time Range"
            small
          />
        </StyledBox>
      </StyledItemGrid>
      <StyledItemGrid className="py0" xs={12}>
        <NetworkGraphs
          end={time.end}
          error={lastUpdatedError?.[0]?.reason || error}
          isToday={isToday}
          loading={loading}
          networkData={interfaces}
          start={time.start}
          timezone={timezone}
        />
      </StyledItemGrid>
    </Grid>
  );
};
