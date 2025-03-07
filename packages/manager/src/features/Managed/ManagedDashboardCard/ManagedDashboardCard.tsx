import { CircleProgress, ErrorState } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import {
  useAllManagedIssuesQuery,
  useAllManagedMonitorsQuery,
} from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import ManagedChartPanel from './ManagedChartPanel';
import {
  StyledDashboardCard,
  StyledMonitorStatusOuterGrid,
  StyledOuterContainerGrid,
} from './ManagedDashboardCard.styles';
import MonitorStatus from './MonitorStatus';
import MonitorTickets from './MonitorTickets';

export const ManagedDashboardCard = () => {
  const {
    data: monitors,
    error: monitorsError,
    isLoading: monitorsLoading,
  } = useAllManagedMonitorsQuery();

  const {
    data: issues,
    error: issuesError,
    isLoading: issuesLoading,
  } = useAllManagedIssuesQuery();

  const defaultError = 'Error loading your Managed service information.';

  if (monitorsError) {
    const error = getAPIErrorOrDefault(monitorsError, defaultError)[0].reason;

    return <ErrorState compact errorText={error} />;
  }

  if (issuesError) {
    const error = getAPIErrorOrDefault(issuesError, defaultError)[0].reason;

    return <ErrorState compact errorText={error} />;
  }

  if (monitorsLoading || issuesLoading) {
    return <CircleProgress />;
  }

  return (
    <StyledDashboardCard alignItems="center" noHeaderActionStyles>
      <StyledOuterContainerGrid
        alignItems="center"
        container
        direction="row"
        justifyContent="center"
      >
        <Grid
          alignItems="center"
          container
          direction="column"
          justifyContent="space-around"
          size={{ sm: 5, xs: 12 }}
        >
          <StyledMonitorStatusOuterGrid>
            <MonitorStatus monitors={monitors || []} />
          </StyledMonitorStatusOuterGrid>
          <Grid>
            <MonitorTickets issues={issues || []} />
          </Grid>
        </Grid>
        <ManagedChartPanel />
      </StyledOuterContainerGrid>
    </StyledDashboardCard>
  );
};

export default ManagedDashboardCard;
