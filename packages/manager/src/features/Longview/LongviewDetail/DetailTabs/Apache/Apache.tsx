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
import ApacheGraphs from './ApacheGraphs';

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

export const Apache: React.FC<Props> = props => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;
  const classes = useStyles();
  const [version, setVersion] = React.useState<string | undefined>();

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });

  const { data, loading, error, request } = useGraphs(
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
    setTimeBox({ start, end });
  };

  const apache = data.Applications?.Apache;
  const isToday = _isToday(time.start, time.end);
  const notice = Number(apache?.status) > 0 ? apache?.status_message : null;

  if (notice !== null) {
    const message = (
      <>
        <Typography>{notice}</Typography>
        <Typography>
          See our{' '}
          <ExternalLink
            fixedIcon
            link="https://www.linode.com/docs/platform/longview/longview-app-for-apache/#troubleshooting"
            text="guide"
          />{' '}
          for help troubleshooting the Apache Longview app.
        </Typography>
      </>
    );
    return <Notice warning text={message} />;
  }

  return (
    <Grid
      container
      id="tabpanel-apache"
      role="tabpanel"
      aria-labelledby="tab-apache"
      direction="column"
    >
      <DocumentTitleSegment segment={'Apache'} />
      <Grid item xs={12}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <div>
            <Typography variant="h2">{'Apache'}</Typography>
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
        <ApacheGraphs
          data={data?.Applications?.Apache}
          processesData={apacheProcesses.data?.Processes ?? {}}
          processesLoading={apacheProcesses.loading}
          processesError={apacheProcesses.error}
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

export default React.memo(Apache);
