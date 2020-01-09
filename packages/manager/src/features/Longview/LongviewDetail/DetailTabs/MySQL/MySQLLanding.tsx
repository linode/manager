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
import MySQLGraphs from './MySQLGraphs';

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

export const MySQLLanding: React.FC<Props> = props => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;
  const classes = useStyles();
  const [version, setVersion] = React.useState<string | undefined>();

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });

  const { data, loading, error, request } = useGraphs(
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
    setTimeBox({ start, end });
  };

  const mySQL = data.Applications?.MySQL;
  const isToday = _isToday(time.start, time.end);
  const notice = Number(mySQL?.status) > 0 ? mySQL?.status_message : null;

  if (notice !== null) {
    const message = (
      <>
        <Typography>{notice}</Typography>
        <Typography>
          See our{' '}
          <ExternalLink
            fixedIcon
            link="https://www.linode.com/docs/platform/longview/longview-app-for-mysql/#troubleshooting"
            text="guide"
          />{' '}
          for help troubleshooting the MySQL Longview app.
        </Typography>
      </>
    );
    return <Notice warning text={message} />;
  }

  return (
    <Grid
      container
      id="tabpanel-mysql"
      role="tabpanel"
      aria-labelledby="tab-mysql"
      direction="column"
    >
      <DocumentTitleSegment segment={'MySQL'} />
      <Grid item xs={12}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <div>
            <Typography variant="h2">{'MySQL'}</Typography>
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
        <MySQLGraphs
          data={data?.Applications?.MySQL}
          processesData={MySQLProcesses.data?.Processes ?? {}}
          processesLoading={MySQLProcesses.loading}
          processesError={MySQLProcesses.error}
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

export default React.memo(MySQLLanding);
