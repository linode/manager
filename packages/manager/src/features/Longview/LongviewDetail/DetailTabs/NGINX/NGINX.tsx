import { Box, Notice, Typography } from '@linode/ui';
import { isToday as _isToday } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { TimeRangeSelect } from 'src/features/Longview/shared/TimeRangeSelect';

import { StyledTypography } from '../CommonStyles.styles';
import { useGraphs } from '../OverviewGraphs/useGraphs';
import { NGINXGraphs } from './NGINXGraphs';

import type { WithStartAndEnd } from '../../../request.types';
import type { APIError } from '@linode/api-v4/lib/types';

interface Props {
  clientAPIKey?: string;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

export const NGINX = React.memo((props: Props) => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;

  const [version, setVersion] = React.useState<string | undefined>();
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const { data, error, loading, request } = useGraphs(
    ['nginx'],
    clientAPIKey,
    time.start,
    time.end
  );

  /**
   * We request/store this data separately because:
   * 1. Classic does (in fact they do each set of fields individually)
   * 2. The request is huge otherwise
   * 3. A hybrid nginx/processes interface would be messy
   * 4. They are conceptually separate
   *
   * A downside to this approach is that the data in this view is essentially
   * in two halves, but this is not clear to the user. They might see, for example,
   * half the graphs in an error state and the others ok, which could be off-putting.
   */
  const nginxProcesses = useGraphs(
    ['nginxProcesses'],
    clientAPIKey,
    time.start,
    time.end
  );

  const _version = data.Applications?.Nginx?.version;
  if (!version && _version) {
    setVersion(_version);
  }

  React.useEffect(() => {
    request();
    nginxProcesses.request();
  }, [time, clientAPIKey, lastUpdated, lastUpdatedError]);

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const nginx = data.Applications?.Nginx;
  const isToday = _isToday(time.start, time.end);
  const notice = Number(nginx?.status) > 0 ? nginx?.status_message : null;

  if (notice !== null) {
    return (
      <Notice variant="warning">
        <Typography>{notice}</Typography>
        <Typography>
          See our{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/capture-nginx-metrics-with-linode-longview#troubleshooting">
            guide
          </Link>{' '}
          for help troubleshooting the NGINX Longview app.
        </Typography>
      </Notice>
    );
  }

  return (
    <Grid container direction="column" spacing={2}>
      <DocumentTitleSegment segment={'NGINX'} />
      <Grid size={{ xs: 12 }}>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
        >
          <div>
            <StyledTypography variant="h2">NGINX</StyledTypography>
            {version && <Typography variant="body1">{version}</Typography>}
          </div>
          <TimeRangeSelect
            defaultValue="Past 30 Minutes"
            handleStatsChange={handleStatsChange}
            hideLabel
            label="Select Time Range"
            sx={{ width: 250 }}
          />
        </Box>
      </Grid>
      <Grid size={{ xs: 12 }} sx={{ py: 0 }}>
        <NGINXGraphs
          data={data?.Applications?.Nginx}
          end={time.end}
          error={lastUpdatedError?.[0]?.reason || error}
          isToday={isToday}
          loading={loading}
          processesData={nginxProcesses.data?.Processes ?? {}}
          processesError={nginxProcesses.error}
          processesLoading={nginxProcesses.loading}
          start={time.start}
          timezone={timezone}
        />
      </Grid>
    </Grid>
  );
});
