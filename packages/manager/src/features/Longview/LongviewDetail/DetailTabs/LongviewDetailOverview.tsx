import { APIError } from '@linode/api-v4/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { Props as LVDataProps } from 'src/containers/longview.stats.container';
import {
  LongviewPortsResponse,
  LongviewTopProcesses,
} from 'src/features/Longview/request.types';
import LongviewPackageDrawer from '../../LongviewPackageDrawer';
import ActiveConnections from './ActiveConnections';
import GaugesSection from './GaugesSection';
import IconSection from './IconSection';
import ListeningServices from './ListeningServices';
import OverviewGraphs from './OverviewGraphs';
import TopProcesses from './TopProcesses';

interface Props {
  client: string;
  clientID: number;
  clientAPIKey: string;
  longviewClientData: LVDataProps['longviewClientData'];
  timezone: string;
  topProcessesData: LongviewTopProcesses;
  topProcessesLoading: boolean;
  topProcessesError?: APIError[];
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  listeningPortsLoading: boolean;
  listeningPortsError?: APIError[];
  listeningPortsData: LongviewPortsResponse;
}

export type CombinedProps = Props;

export const LongviewDetailOverview: React.FC<CombinedProps> = (props) => {
  const {
    client,
    clientID,
    longviewClientData,
    clientAPIKey,
    lastUpdated,
    listeningPortsData,
    listeningPortsError,
    listeningPortsLoading,
    topProcessesData,
    topProcessesLoading,
    topProcessesError,
    lastUpdatedError,
    timezone,
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
  const portsError = Boolean(_hasError)
    ? pathOr<string>('Error retrieving data', [0, 'reason'], _hasError)
    : undefined;

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Overview" />
      <Grid container>
        <Grid item xs={12}>
          <Paper>
            <Grid
              container
              justifyContent="space-between"
              alignItems="flex-start"
              item
              xs={12}
              spacing={0}
            >
              <IconSection
                longviewClientData={longviewClientData}
                client={client}
                openPackageDrawer={() => setDrawerOpen(true)}
              />
              <GaugesSection
                clientID={clientID}
                lastUpdatedError={lastUpdatedError}
              />
              <TopProcesses
                clientID={clientID}
                topProcessesData={topProcessesData}
                topProcessesLoading={topProcessesLoading}
                topProcessesError={topProcessesError}
                lastUpdatedError={lastUpdatedError}
              />
            </Grid>
          </Paper>
        </Grid>
        <OverviewGraphs
          clientAPIKey={clientAPIKey}
          timezone={timezone}
          lastUpdated={lastUpdated}
          lastUpdatedError={!!lastUpdatedError}
        />
        <Grid container justifyContent="space-between" item spacing={0}>
          <ListeningServices
            services={pathOr([], ['Ports', 'listening'], listeningPortsData)}
            servicesLoading={listeningPortsLoading && !lastUpdated}
            servicesError={portsError}
          />
          <ActiveConnections
            connections={pathOr([], ['Ports', 'active'], listeningPortsData)}
            connectionsLoading={listeningPortsLoading && !lastUpdated}
            connectionsError={portsError}
          />
        </Grid>
      </Grid>
      <LongviewPackageDrawer
        clientLabel={client}
        clientID={clientID}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </React.Fragment>
  );
};

export default React.memo(LongviewDetailOverview);
