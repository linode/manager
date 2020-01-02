import { APIError } from 'linode-js-sdk/lib/types';
import { omit } from 'ramda';
import * as React from 'react';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { NginxUserProcesses, WithStartAndEnd } from '../../../request.types';
import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import { useGraphs } from '../OverviewGraphs/useGraphs';
import NGINXGraphs from './NGINXGraphs';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: 250
  }
}));

interface Props {
  clientAPIKey: string;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

export const NGINX: React.FC<Props> = props => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;
  const classes = useStyles();

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });

  const { data, loading, error, request } = useGraphs(
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
  const processes = useGraphs(
    ['nginxProcesses'],
    clientAPIKey,
    time.start,
    time.end
  );

  React.useEffect(() => {
    request();
    processes.request();
  }, [time, clientAPIKey, lastUpdated, lastUpdatedError]);

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ start, end });
  };

  const nginx = data.Applications?.Nginx;
  const isToday = time.end - time.start < 60 * 60 * 25;
  const version = nginx?.version;
  const notice = Number(nginx?.status) > 0 ? nginx?.status_message : null;

  /**
   * We omit the longname, which would otherwise be mistaken for an NGINX user
   * @todo add an overload for this request so the typing isn't so weird
   */
  const processesData = React.useMemo(
    () =>
      (omit(
        ['longname'],
        processes.data.Processes?.nginx
      ) as NginxUserProcesses) ?? {},
    [processes.data]
  );

  if (notice !== null) {
    return <Notice warning text={notice} />;
  }

  return (
    <Grid
      container
      id="tabpanel-nginx"
      role="tabpanel"
      aria-labelledby="tab-nginx"
      direction="column"
    >
      <DocumentTitleSegment segment={'NGINX'} />
      <Grid item xs={12}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h2">
            {loading ? 'Loading...' : version ?? 'NGINX'}
          </Typography>
          <TimeRangeSelect
            small
            className={classes.root}
            handleStatsChange={handleStatsChange}
            defaultValue="Past 30 Minutes"
            label="Select Time Range"
            hideLabel
          />
        </Box>
      </Grid>
      <Grid item xs={12} className="py0">
        <NGINXGraphs
          data={data?.Applications?.Nginx}
          processesData={processesData}
          processesLoading={processes.loading}
          processesError={processes.error}
          isToday={isToday}
          loading={loading}
          error={lastUpdatedError?.[0]?.reason || error}
          timezone={timezone}
          start={time.start}
          end={time.end}
        />
      </Grid>
    </Grid>
  );
};

export default React.memo(NGINX);
