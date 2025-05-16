import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import MonitorFailed from 'src/assets/icons/monitor-failed.svg';
import MonitorOK from 'src/assets/icons/monitor-ok.svg';
import { Link } from 'src/components/Link';

import {
  StyledIconGrid,
  StyledRootGrid,
  StyledTypography,
} from './MonitorStatus.styles';

import type { ManagedServiceMonitor } from '@linode/api-v4/lib/managed';

export interface MonitorStatusProps {
  monitors: ManagedServiceMonitor[];
}

export const MonitorStatus = (props: MonitorStatusProps) => {
  const { monitors } = props;

  const failedMonitors = getFailedMonitors(monitors);
  const iconSize = 50;

  return (
    <StyledRootGrid
      alignItems="center"
      container
      direction="column"
      justifyContent="center"
    >
      <Grid>
        <StyledIconGrid>
          {failedMonitors.length === 0 ? (
            <MonitorOK height={iconSize} width={iconSize} />
          ) : (
            <MonitorFailed height={iconSize} width={iconSize} />
          )}
        </StyledIconGrid>
      </Grid>
      <Grid>
        <Typography variant="h2">
          {failedMonitors.length === 0
            ? 'All monitored services are up'
            : `${failedMonitors.length} monitored ${
                failedMonitors.length === 1 ? 'service is' : 'services are'
              } down`}
        </Typography>
      </Grid>
      {failedMonitors.length > 0 && (
        <Grid>
          {failedMonitors.map((thisMonitor, idx) => (
            <StyledTypography
              key={`failed-monitor-list-${idx}`}
              variant="body1"
            >
              {thisMonitor}
            </StyledTypography>
          ))}
        </Grid>
      )}
      <Grid>
        <Typography sx={{ maxWidth: 250 }}>
          <Link to="/managed/monitors">View your list of service monitors</Link>
          {` `}
          {failedMonitors.length === 0
            ? 'to see details or to update your monitors.'
            : 'for details.'}
        </Typography>
      </Grid>
    </StyledRootGrid>
  );
};

const getFailedMonitors = (monitors: ManagedServiceMonitor[]): string[] => {
  /**
   * This assumes that a status of "failed" is the only
   * error state; but if all a user's monitors are pending
   * or disabled, they'll all pass the test here and the
   * user will get a message saying that all monitors are
   * verified.
   */
  return monitors.reduce((accum, thisMonitor) => {
    if (thisMonitor.status === 'problem') {
      return [...accum, thisMonitor.label];
    } else {
      return accum;
    }
  }, []);
};

export default MonitorStatus;
