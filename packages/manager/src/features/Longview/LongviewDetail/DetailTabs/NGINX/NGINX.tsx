import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { isToday as _isToday } from 'src/utilities/isToday';
import { WithStartAndEnd } from '../../../request.types';
import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import { useGraphs } from '../OverviewGraphs/useGraphs';
import NGINXGraphs from './NGINXGraphs';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: 250
  }
}));

interface Props {
  clientAPIKey?: string;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

export const NGINX: React.FC<Props> = props => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;
  const classes = useStyles();
  const [version, setVersion] = React.useState<string | undefined>();

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
    setTimeBox({ start, end });
  };

  const nginx = data.Applications?.Nginx;
  const isToday = _isToday(time.start, time.end);
  const notice = Number(nginx?.status) > 0 ? nginx?.status_message : null;

  if (notice !== null) {
    const message = (
      <>
        <Typography>{notice}</Typography>
        <Typography>
          See our{' '}
          <ExternalLink
            fixedIcon
            link="https://www.linode.com/docs/platform/longview/longview-app-for-nginx/#troubleshooting"
            text="guide"
          />{' '}
          for help troubleshooting the NGINX Longview app.
        </Typography>
      </>
    );
    return <Notice warning text={message} />;
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
          <div>
            <Typography variant="h2">{'NGINX'}</Typography>
            {version && <Typography variant="body1">{version}</Typography>}
          </div>
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
          processesData={nginxProcesses.data?.Processes ?? {}}
          processesLoading={nginxProcesses.loading}
          processesError={nginxProcesses.error}
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
