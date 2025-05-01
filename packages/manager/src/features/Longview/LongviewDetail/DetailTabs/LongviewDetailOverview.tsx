import { Paper } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { LongviewPackageDrawer } from '../../LongviewPackageDrawer';
import { ActiveConnections } from './ActiveConnections/ActiveConnections';
import { GaugesSection } from './GaugesSection';
import { IconSection } from './IconSection';
import { ListeningServices } from './ListeningServices/ListeningServices';
import { OverviewGraphs } from './OverviewGraphs/OverviewGraphs';
import { TopProcesses } from './TopProcesses';

import type { APIError } from '@linode/api-v4/lib/types';
import type { Props as LVDataProps } from 'src/containers/longview.stats.container';
import type {
  LongviewPortsResponse,
  LongviewTopProcesses,
} from 'src/features/Longview/request.types';

interface Props {
  client: string;
  clientAPIKey: string;
  clientID: number;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  listeningPortsData: LongviewPortsResponse;
  listeningPortsError?: APIError[];
  listeningPortsLoading: boolean;
  longviewClientData: LVDataProps['longviewClientData'];
  timezone: string;
  topProcessesData: LongviewTopProcesses;
  topProcessesError?: APIError[];
  topProcessesLoading: boolean;
}

export const LongviewDetailOverview = (props: Props) => {
  const {
    client,
    clientAPIKey,
    clientID,
    lastUpdated,
    lastUpdatedError,
    listeningPortsData,
    listeningPortsError,
    listeningPortsLoading,
    longviewClientData,
    timezone,
    topProcessesData,
    topProcessesError,
    topProcessesLoading,
  } = props;

  /**
   * Package drawer open/close logic
   */

  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);

  /**
   * Show an error for the services/connections
   * tables if the request errors, or if there is
   * a lastUpdated error (which will happen in the
   * event of a network error)
   */
  const _hasError = listeningPortsError || lastUpdatedError;
  const portsError = _hasError
    ? (_hasError?.[0].reason ?? 'Error retrieving data')
    : undefined;

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Overview" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Paper>
            <Grid
              alignItems="flex-start"
              container
              justifyContent="space-between"
              size={{ xs: 12 }}
              spacing={0}
            >
              <IconSection
                client={client}
                longviewClientData={longviewClientData}
                openPackageDrawer={() => setDrawerOpen(true)}
              />
              <GaugesSection
                clientID={clientID}
                lastUpdatedError={lastUpdatedError}
              />
              <TopProcesses
                clientID={clientID}
                lastUpdatedError={lastUpdatedError}
                topProcessesData={topProcessesData}
                topProcessesError={topProcessesError}
                topProcessesLoading={topProcessesLoading}
              />
            </Grid>
          </Paper>
        </Grid>
        <OverviewGraphs
          clientAPIKey={clientAPIKey}
          lastUpdated={lastUpdated}
          lastUpdatedError={!!lastUpdatedError}
          timezone={timezone}
        />
        <Grid
          container
          justifyContent="space-between"
          size={{ xs: 12 }}
          sx={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <ListeningServices
            services={listeningPortsData.Ports?.listening ?? []}
            servicesError={portsError}
            servicesLoading={listeningPortsLoading && !lastUpdated}
          />
          <ActiveConnections
            connections={listeningPortsData.Ports?.active ?? []}
            connectionsError={portsError}
            connectionsLoading={listeningPortsLoading && !lastUpdated}
          />
        </Grid>
      </Grid>
      <LongviewPackageDrawer
        clientID={clientID}
        clientLabel={client}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </React.Fragment>
  );
};

export default React.memo(LongviewDetailOverview);
