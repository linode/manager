import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { isToday as _isToday } from 'src/utilities/isToday';

import { WithStartAndEnd } from '../../../request.types';
import { useGraphs } from '../OverviewGraphs/useGraphs';
import {
  StyledTimeRangeSelect,
  StyledTypography,
} from '../CommonStyles.styles';
import { ApacheGraphs } from './ApacheGraphs';

interface Props {
  clientAPIKey?: string;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

export const Apache = React.memo((props: Props) => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;
  const [version, setVersion] = React.useState<string | undefined>();

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const { data, error, loading, request } = useGraphs(
    ['apache'],
    clientAPIKey,
    time.start,
    time.end
  );

  const apacheProcesses = useGraphs(
    ['apacheProcesses'],
    clientAPIKey,
    time.start,
    time.end
  );

  const _version = data.Applications?.Apache?.version;
  if (!version && _version) {
    setVersion(_version);
  }

  React.useEffect(() => {
    request();
    apacheProcesses.request();
  }, [time, clientAPIKey, lastUpdated, lastUpdatedError]);

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const apache = data.Applications?.Apache;
  const isToday = _isToday(time.start, time.end);
  const notice = Number(apache?.status) > 0 ? apache?.status_message : null;

  if (notice !== null) {
    return (
      <Notice variant="warning">
        <Typography>{notice}</Typography>
        <Typography>
          See our{' '}
          <Link to="https://www.linode.com/docs/platform/longview/longview-app-for-apache/#troubleshooting">
            guide
          </Link>{' '}
          for help troubleshooting the Apache Longview app.
        </Typography>
      </Notice>
    );
  }

  return (
    <Grid container direction="column" spacing={2}>
      <DocumentTitleSegment segment={'Apache'} />
      <Grid sx={{ boxSizing: 'border-box', margin: '0' }} xs={12}>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
        >
          <div>
            <StyledTypography variant="h2">Apache</StyledTypography>
            {version && <Typography variant="body1">{version}</Typography>}
          </div>

          <StyledTimeRangeSelect
            defaultValue="Past 30 Minutes"
            handleStatsChange={handleStatsChange}
            hideLabel
            label="Select Time Range"
            small
          />
        </Box>
      </Grid>
      <Grid
        className="py0"
        sx={{ boxSizing: 'border-box', margin: '0' }}
        xs={12}
      >
        <ApacheGraphs
          data={data?.Applications?.Apache}
          end={time.end}
          error={lastUpdatedError?.[0]?.reason || error}
          isToday={isToday}
          loading={loading}
          processesData={apacheProcesses.data?.Processes ?? {}}
          processesError={apacheProcesses.error}
          processesLoading={apacheProcesses.loading}
          start={time.start}
          timezone={timezone}
        />
      </Grid>
    </Grid>
  );
});
