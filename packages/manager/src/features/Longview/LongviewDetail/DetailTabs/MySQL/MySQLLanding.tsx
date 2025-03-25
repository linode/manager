import { Box, Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { TimeRangeSelect } from 'src/features/Longview/shared/TimeRangeSelect';
import { isToday as _isToday } from 'src/utilities/isToday';

import { StyledTypography } from '../CommonStyles.styles';
import { useGraphs } from '../OverviewGraphs/useGraphs';
import { MySQLGraphs } from './MySQLGraphs';

import type { WithStartAndEnd } from '../../../request.types';
import type { APIError } from '@linode/api-v4/lib/types';

interface Props {
  clientAPIKey?: string;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

export const MySQLLanding = React.memo((props: Props) => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;

  const [version, setVersion] = React.useState<string | undefined>();
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const { data, error, loading, request } = useGraphs(
    ['mysql'],
    clientAPIKey,
    time.start,
    time.end
  );

  const MySQLProcesses = useGraphs(
    ['mysqlProcesses'],
    clientAPIKey,
    time.start,
    time.end
  );

  const _version = data.Applications?.MySQL?.version;
  if (!version && _version) {
    setVersion(_version);
  }

  React.useEffect(() => {
    request();
    MySQLProcesses.request();
  }, [time, clientAPIKey, lastUpdated, lastUpdatedError]);

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const mySQL = data.Applications?.MySQL;
  const isToday = _isToday(time.start, time.end);
  const notice = Number(mySQL?.status) > 0 ? mySQL?.status_message : null;

  if (notice !== null) {
    return (
      <Notice variant="warning">
        <Typography>{notice}</Typography>
        <Typography>
          See our{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/capture-mysql-metrics-with-linode-longview#troubleshooting">
            guide
          </Link>{' '}
          for help troubleshooting the MySQL Longview app.
        </Typography>
      </Notice>
    );
  }

  return (
    <Grid container direction="column" spacing={2}>
      <DocumentTitleSegment segment={'MySQL'} />
      <Grid size={{ xs: 12 }}>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
        >
          <div>
            <StyledTypography variant="h2">MySQL</StyledTypography>
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
        <MySQLGraphs
          data={data?.Applications?.MySQL}
          end={time.end}
          error={lastUpdatedError?.[0]?.reason || error}
          isToday={isToday}
          loading={loading}
          processesData={MySQLProcesses.data?.Processes ?? {}}
          processesError={MySQLProcesses.error}
          processesLoading={MySQLProcesses.loading}
          start={time.start}
          timezone={timezone}
        />
      </Grid>
    </Grid>
  );
});
