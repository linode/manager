import { LongviewClient } from '@linode/api-v4/lib/longview';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, matchPath } from 'react-router-dom';
import { compose } from 'recompose';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { NotFound } from 'src/components/NotFound';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import withLongviewClients, {
  DispatchProps,
  Props as LVProps,
} from 'src/containers/longview.container';
import withClientStats, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';
import { get } from 'src/features/Longview/request';
import {
  LongviewPortsResponse,
  LongviewTopProcesses,
} from 'src/features/Longview/request.types';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { useProfile } from 'src/queries/profile';

import { useClientLastUpdated } from '../shared/useClientLastUpdated';
import Apache from './DetailTabs/Apache';
import MySQLLanding from './DetailTabs/MySQL';
import NGINX from './DetailTabs/NGINX';
import NetworkLanding from './DetailTabs/Network';
import ProcessesLanding from './DetailTabs/Processes/ProcessesLanding';

const useStyles = makeStyles((theme: Theme) => ({
  tabList: {
    marginBottom: `calc(${theme.spacing(3)} + 6px)`,
  },
}));

const topProcessesEmptyDataSet: LongviewTopProcesses = { Processes: {} };

interface Props {
  client?: LongviewClient;
  longviewClientsError: LVProps['longviewClientsError'];
  longviewClientsLastUpdated: number;
  longviewClientsLoading: LVProps['longviewClientsLoading'];
}

const Overview = React.lazy(
  () => import('./DetailTabs/LongviewDetailOverview')
);
const Installation = React.lazy(() => import('./DetailTabs/Installation'));
const Disks = React.lazy(() => import('./DetailTabs/Disks'));

export type CombinedProps = RouteComponentProps<{ id: string }> &
  Props &
  LVDataProps &
  DispatchProps;

export const LongviewDetail: React.FC<CombinedProps> = (props) => {
  const {
    client,
    longviewClientData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
  } = props;

  const { data: profile } = useProfile();

  const timezone = profile?.timezone || 'US/Eastern';

  const classes = useStyles();

  React.useEffect(() => {
    /** request clients if they haven't already been requested */
    if (longviewClientsLastUpdated === 0) {
      props.getLongviewClients();
    }
  }, []);
  const clientAPIKey = client && client.api_key;

  const { lastUpdated, lastUpdatedError, notifications } = useClientLastUpdated(
    clientAPIKey,
    clientAPIKey
      ? (_lastUpdated) =>
          props.getClientStats(clientAPIKey, _lastUpdated).catch((_) => null)
      : undefined
  );

  const topProcesses = useAPIRequest<LongviewTopProcesses>(
    // We can only make this request if we have a clientAPIKey, so we use `null`
    // if we don't (which will happen the first time this component mounts). We
    // also check for `lastUpdated`, otherwise we'd make an extraneous request
    // when it is retrieved.
    clientAPIKey && lastUpdated
      ? () =>
          get(clientAPIKey, 'getTopProcesses').then((response) => response.DATA)
      : null,
    topProcessesEmptyDataSet,
    [clientAPIKey, lastUpdated]
  );

  const listeningPorts = useAPIRequest<LongviewPortsResponse>(
    clientAPIKey && lastUpdated
      ? () =>
          get(clientAPIKey, 'getValues', {
            fields: ['listeningServices', 'activeConnections'],
          }).then((response) => response.DATA)
      : null,
    { Ports: { active: [], listening: [] } },
    [clientAPIKey, lastUpdated]
  );

  const tabOptions = [
    {
      display: true,
      routeName: `${props.match.url}/overview`,
      title: 'Overview',
    },
    {
      display: true,
      routeName: `${props.match.url}/processes`,
      title: 'Processes',
    },
    {
      display: true,
      routeName: `${props.match.url}/network`,
      title: 'Network',
    },
    {
      display: true,
      routeName: `${props.match.url}/disks`,
      title: 'Disks',
    },
    {
      display: client && client.apps.apache,
      routeName: `${props.match.url}/apache`,
      title: 'Apache',
    },
    {
      display: client && client.apps.nginx,
      routeName: `${props.match.url}/nginx`,
      title: 'Nginx',
    },
    {
      display: client && client.apps.mysql,
      routeName: `${props.match.url}/mysql`,
      title: 'MySQL',
    },
    {
      display: true,
      routeName: `${props.match.url}/installation`,
      title: 'Installation',
    },
  ];

  // Filtering out conditional tabs if they don't exist on client
  const tabs = tabOptions.filter((tab) => tab.display === true);

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  if (longviewClientsLoading && longviewClientsLastUpdated === 0) {
    return (
      <Paper>
        <CircleProgress />
      </Paper>
    );
  }

  if (longviewClientsError.read && longviewClientsLastUpdated === 0) {
    return (
      <Paper>
        <ErrorState errorText={longviewClientsError.read[0].reason} />
      </Paper>
    );
  }

  if (!client && !longviewClientsLoading) {
    return <NotFound />;
  }

  if (!client) {
    /*
      this is already handled from the case above, but this is here
      so that we don't have to do undefined checking in the render method
      below
     */
    return null;
  }

  // Determining true tab count for indexing based on tab display
  const displayedTabs = tabs.filter((tab) => tab.display === true);

  return (
    <React.Fragment>
      <LandingHeader
        breadcrumbProps={{
          firstAndLastOnly: true,
          labelOptions: { noCap: true },
          pathname: props.location.pathname,
        }}
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/platform/longview/longview/"
        title={client.label}
      />
      {notifications.map((thisNotification, idx) => (
        <Notice
          key={`lv-warning-${idx}`}
          spacingBottom={0}
          spacingTop={8}
          text={thisNotification.TEXT}
          warning
        />
      ))}
      <Tabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        className={classes.tabList}
        onChange={navToURL}
      >
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <Overview
                client={client.label}
                clientAPIKey={client.api_key}
                clientID={client.id}
                lastUpdated={lastUpdated}
                lastUpdatedError={lastUpdatedError}
                listeningPortsData={listeningPorts.data}
                listeningPortsError={listeningPorts.error}
                listeningPortsLoading={listeningPorts.loading}
                longviewClientData={longviewClientData}
                timezone={timezone}
                topProcessesData={topProcesses.data}
                topProcessesError={topProcesses.error}
                topProcessesLoading={topProcesses.loading}
              />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <ProcessesLanding
                clientAPIKey={client.api_key}
                clientID={client.id}
                lastUpdated={lastUpdated}
                lastUpdatedError={lastUpdatedError}
                timezone={timezone}
              />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <NetworkLanding
                clientAPIKey={client.api_key}
                lastUpdated={lastUpdated}
                lastUpdatedError={lastUpdatedError}
                timezone={timezone}
              />
            </SafeTabPanel>
            <SafeTabPanel index={3}>
              <Disks
                clientAPIKey={client.api_key}
                clientID={client.id}
                clientLastUpdated={lastUpdated}
                lastUpdated={lastUpdated}
                lastUpdatedError={lastUpdatedError}
                timezone={timezone}
              />
            </SafeTabPanel>

            {client && client.apps.apache && (
              <SafeTabPanel index={4}>
                <Apache
                  clientAPIKey={clientAPIKey}
                  lastUpdated={lastUpdated}
                  lastUpdatedError={lastUpdatedError}
                  timezone={timezone}
                />
              </SafeTabPanel>
            )}

            {client && client.apps.nginx && (
              <SafeTabPanel index={client.apps.apache ? 5 : 4}>
                <NGINX
                  clientAPIKey={clientAPIKey}
                  lastUpdated={lastUpdated}
                  lastUpdatedError={lastUpdatedError}
                  timezone={timezone}
                />
              </SafeTabPanel>
            )}

            {client && client.apps.mysql && (
              <SafeTabPanel
                index={
                  4 + (client.apps.nginx ? 1 : 0) + (client.apps.apache ? 1 : 0)
                }
              >
                <MySQLLanding
                  clientAPIKey={clientAPIKey}
                  lastUpdated={lastUpdated}
                  lastUpdatedError={lastUpdatedError}
                  timezone={timezone}
                />
              </SafeTabPanel>
            )}

            <SafeTabPanel index={Number(displayedTabs.length - 1)}>
              <Installation
                clientAPIKey={client.api_key}
                clientInstallationKey={client.install_code}
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withClientStats<RouteComponentProps<{ id: string }>>((ownProps) => {
    return +pathOr<string>('', ['match', 'params', 'id'], ownProps);
  }),
  withLongviewClients<Props, RouteComponentProps<{ id: string }>>(
    (
      own,
      {
        longviewClientsData,
        longviewClientsError,
        longviewClientsLastUpdated,
        longviewClientsLoading,
      }
    ) => {
      // This is explicitly typed, otherwise `client` would be typed as
      // `LongviewClient`, even though there's a chance it could be undefined.
      const client: LongviewClient | undefined =
        longviewClientsData[pathOr<string>('', ['match', 'params', 'id'], own)];

      return {
        client,
        longviewClientsError,
        longviewClientsLastUpdated,
        longviewClientsLoading,
      };
    }
  )
)(LongviewDetail);
