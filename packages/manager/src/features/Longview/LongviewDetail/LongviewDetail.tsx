import { LongviewClient } from '@linode/api-v4/lib/longview';
import { pathOr } from 'ramda';
import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import DocumentationButton from 'src/components/DocumentationButton';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import Notice from 'src/components/Notice';
import SuspenseLoader from 'src/components/SuspenseLoader';
import withLongviewClients, {
  DispatchProps,
  Props as LVProps
} from 'src/containers/longview.container';
import withClientStats, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import withProfile from 'src/containers/profile.container';
import { get } from 'src/features/Longview/request';
import {
  LongviewPortsResponse,
  LongviewTopProcesses
} from 'src/features/Longview/request.types';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { useClientLastUpdated } from '../shared/useClientLastUpdated';
import Apache from './DetailTabs/Apache';
import MySQLLanding from './DetailTabs/MySQL';
import NetworkLanding from './DetailTabs/Network';
import NGINX from './DetailTabs/NGINX';
import ProcessesLanding from './DetailTabs/Processes/ProcessesLanding';

const useStyles = makeStyles((theme: Theme) => ({
  tabList: {
    marginBottom: theme.spacing(3) + 6
  }
}));

const topProcessesEmptyDataSet: LongviewTopProcesses = { Processes: {} };

interface Props {
  client?: LongviewClient;
  longviewClientsLastUpdated: number;
  longviewClientsLoading: LVProps['longviewClientsLoading'];
  longviewClientsError: LVProps['longviewClientsError'];
}

const Overview = React.lazy(() =>
  import('./DetailTabs/LongviewDetailOverview')
);
const Installation = React.lazy(() => import('./DetailTabs/Installation'));
const Disks = React.lazy(() => import('./DetailTabs/Disks'));

export type CombinedProps = RouteComponentProps<{ id: string }> &
  Props &
  LVDataProps &
  ProfileProps &
  DispatchProps;

export const LongviewDetail: React.FC<CombinedProps> = props => {
  const {
    client,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsError,
    longviewClientData,
    timezone
  } = props;
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
      ? _lastUpdated => props.getClientStats(clientAPIKey, _lastUpdated)
      : undefined
  );

  const topProcesses = useAPIRequest<LongviewTopProcesses>(
    // We can only make this request if we have a clientAPIKey, so we use `null`
    // if we don't (which will happen the first time this component mounts). We
    // also check for `lastUpdated`, otherwise we'd make an extraneous request
    // when it is retrieved.
    clientAPIKey && lastUpdated
      ? () =>
          get(clientAPIKey, 'getTopProcesses').then(response => response.DATA)
      : null,
    topProcessesEmptyDataSet,
    [clientAPIKey, lastUpdated]
  );

  const listeningPorts = useAPIRequest<LongviewPortsResponse>(
    clientAPIKey && lastUpdated
      ? () =>
          get(clientAPIKey, 'getValues', {
            fields: ['listeningServices', 'activeConnections']
          }).then(response => response.DATA)
      : null,
    { Ports: { listening: [], active: [] } },
    [clientAPIKey, lastUpdated]
  );

  const tabOptions = [
    {
      title: 'Overview',
      display: true,
      routeName: `${props.match.url}/overview`
    },
    {
      title: 'Processes',
      display: true,
      routeName: `${props.match.url}/processes`
    },
    {
      title: 'Network',
      display: true,
      routeName: `${props.match.url}/network`
    },
    {
      title: 'Disks',
      display: true,
      routeName: `${props.match.url}/disks`
    },
    {
      title: 'Apache',
      display: client && client.apps.apache,
      routeName: `${props.match.url}/apache`
    },
    {
      title: 'Nginx',
      display: client && client.apps.nginx,
      routeName: `${props.match.url}/nginx`
    },
    {
      title: 'MySQL',
      display: client && client.apps.mysql,
      routeName: `${props.match.url}/mysql`
    },
    {
      title: 'Installation',
      display: true,
      routeName: `${props.match.url}/installation`
    }
  ];

  // Filtering out conditional tabs if they don't exist on client
  const tabs = tabOptions.filter(tab => tab.display === true);

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
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
  const displayedTabs = tabs.filter(tab => tab.display === true);

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={props.location.pathname}
          firstAndLastOnly
          labelTitle={client.label}
          labelOptions={{ noCap: true }}
        />
        <DocumentationButton
          href={'https://www.linode.com/docs/platform/longview/longview/'}
        />
      </Box>
      {notifications.map((thisNotification, idx) => (
        <Notice
          key={`lv-warning-${idx}`}
          warning
          spacingTop={8}
          spacingBottom={0}
          text={thisNotification.TEXT}
        />
      ))}
      <Tabs
        defaultIndex={tabs.findIndex(tab => matches(tab.routeName)) || 0}
        className={classes.tabList}
      >
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <Overview
                client={client.label}
                clientID={client.id}
                clientAPIKey={client.api_key}
                longviewClientData={longviewClientData}
                timezone={timezone}
                topProcessesData={topProcesses.data}
                topProcessesLoading={topProcesses.loading}
                topProcessesError={topProcesses.error}
                listeningPortsData={listeningPorts.data}
                listeningPortsError={listeningPorts.error}
                listeningPortsLoading={listeningPorts.loading}
                lastUpdatedError={lastUpdatedError}
                lastUpdated={lastUpdated}
              />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <ProcessesLanding
                clientID={client.id}
                clientAPIKey={client.api_key}
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
                clientID={client.id}
                clientAPIKey={client.api_key}
                lastUpdated={lastUpdated}
                clientLastUpdated={lastUpdated}
                lastUpdatedError={lastUpdatedError}
                timezone={props.timezone}
              />
            </SafeTabPanel>

            {client && client.apps.apache && (
              <SafeTabPanel index={client && client.apps.apache ? 4 : null}>
                <Apache
                  timezone={timezone}
                  clientAPIKey={clientAPIKey}
                  lastUpdated={lastUpdated}
                  lastUpdatedError={lastUpdatedError}
                />
              </SafeTabPanel>
            )}

            {client && client.apps.nginx && (
              <SafeTabPanel
                index={
                  client.apps.nginx && client.apps.apache
                    ? 5
                    : client.apps.nginx && !client.apps.apache
                    ? 4
                    : null
                }
              >
                <NGINX
                  timezone={timezone}
                  clientAPIKey={clientAPIKey}
                  lastUpdated={lastUpdated}
                  lastUpdatedError={lastUpdatedError}
                />
              </SafeTabPanel>
            )}

            {client && client.apps.mysql && (
              <SafeTabPanel
                index={
                  client.apps.mysql && client.apps.nginx && client.apps.apache
                    ? 6
                    : (client.apps.mysql && !client.apps.apache) ||
                      !client.apps.nginx
                    ? 5
                    : client.apps.mysql &&
                      !client.apps.apache &&
                      !client.apps.nginx
                    ? 4
                    : null
                }
              >
                <MySQLLanding
                  timezone={timezone}
                  clientAPIKey={clientAPIKey}
                  lastUpdated={lastUpdated}
                  lastUpdatedError={lastUpdatedError}
                />
              </SafeTabPanel>
            )}

            <SafeTabPanel index={Number(displayedTabs.length - 1)}>
              <Installation
                clientInstallationKey={client.install_code}
                clientAPIKey={client.api_key}
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};

interface ProfileProps {
  timezone: string;
}

export default compose<CombinedProps, {}>(
  React.memo,
  withClientStats<RouteComponentProps<{ id: string }>>(ownProps => {
    return +pathOr<string>('', ['match', 'params', 'id'], ownProps);
  }),
  withProfile<ProfileProps, {}>((own, { profileData }) => ({
    timezone: (profileData || {}).timezone || 'GMT'
  })),
  withLongviewClients<Props, RouteComponentProps<{ id: string }>>(
    (
      own,
      {
        longviewClientsData,
        longviewClientsLastUpdated,
        longviewClientsLoading,
        longviewClientsError
      }
    ) => {
      // This is explicitly typed, otherwise `client` would be typed as
      // `LongviewClient`, even though there's a chance it could be undefined.
      const client: LongviewClient | undefined =
        longviewClientsData[pathOr<string>('', ['match', 'params', 'id'], own)];

      return {
        client,
        longviewClientsLastUpdated,
        longviewClientsLoading,
        longviewClientsError
      };
    }
  )
)(LongviewDetail);
