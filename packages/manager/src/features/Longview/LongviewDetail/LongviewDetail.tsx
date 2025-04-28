import { useProfile } from '@linode/queries';
import { CircleProgress, ErrorState, Notice, Paper } from '@linode/ui';
import * as React from 'react';
import { compose } from 'recompose';

import { LandingHeader } from 'src/components/LandingHeader';
import { NotFound } from '@linode/ui';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import withLongviewClients from 'src/containers/longview.container';
import withClientStats from 'src/containers/longview.stats.container';
import { get } from 'src/features/Longview/request';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { useTabs } from 'src/hooks/useTabs';

import { useClientLastUpdated } from '../shared/useClientLastUpdated';
import { Apache } from './DetailTabs/Apache/Apache';
import { MySQLLanding } from './DetailTabs/MySQL/MySQLLanding';
import { NetworkLanding } from './DetailTabs/Network/NetworkLanding';
import { NGINX } from './DetailTabs/NGINX/NGINX';
import { ProcessesLanding } from './DetailTabs/Processes/ProcessesLanding';
import { StyledTabs } from './LongviewDetail.styles';

import type { LongviewClient } from '@linode/api-v4/lib/longview';
import type {
  DispatchProps,
  Props as LVProps,
} from 'src/containers/longview.container';
import type { Props as LVDataProps } from 'src/containers/longview.stats.container';
import type {
  LongviewPortsResponse,
  LongviewTopProcesses,
} from 'src/features/Longview/request.types';

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
const Disks = React.lazy(() => import('./DetailTabs/Disks/Disks'));

export type CombinedProps = Props & LVDataProps & DispatchProps;

export const LongviewDetail = (props: CombinedProps) => {
  const {
    client,
    longviewClientData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
  } = props;

  const { data: profile } = useProfile();

  const timezone = profile?.timezone || 'US/Eastern';

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

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Overview',
      to: '/longview/clients/$id/overview',
    },
    {
      title: 'Processes',
      to: '/longview/clients/$id/processes',
    },
    {
      title: 'Network',
      to: '/longview/clients/$id/network',
    },
    {
      title: 'Disks',
      to: '/longview/clients/$id/disks',
    },
    {
      hide: !client?.apps.apache,
      title: 'Apache',
      to: '/longview/clients/$id/apache',
    },
    {
      hide: !client?.apps.nginx,
      title: 'Nginx',
      to: '/longview/clients/$id/nginx',
    },
    {
      hide: !client?.apps.mysql,
      title: 'MySQL',
      to: '/longview/clients/$id/mysql',
    },
    {
      title: 'Installation',
      to: '/longview/clients/$id/installation',
    },
  ]);

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

  return (
    <React.Fragment>
      <LandingHeader
        breadcrumbProps={{
          firstAndLastOnly: true,
          labelOptions: { noCap: true },
          labelTitle: `longview${client?.id}`,
          pathname: `/longview/clients/${client?.id}`,
        }}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-longview"
        title={client.label}
      />
      {notifications.map((thisNotification, idx) => (
        <Notice
          key={`lv-warning-${idx}`}
          spacingBottom={0}
          spacingTop={8}
          text={thisNotification.TEXT}
          variant="warning"
        />
      ))}
      <StyledTabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />

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

            <SafeTabPanel index={tabs.length - 1}>
              <Installation
                clientAPIKey={client.api_key}
                clientInstallationKey={client.install_code}
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </StyledTabs>
    </React.Fragment>
  );
};

type LongviewDetailParams = {
  id: string;
};

const EnhancedLongviewDetail = compose<CombinedProps, {}>(
  React.memo,

  withClientStats<{ match: { params: LongviewDetailParams } }>((ownProps) => {
    return +(ownProps?.match?.params?.id ?? '');
  }),
  withLongviewClients<Props, { match: { params: LongviewDetailParams } }>(
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
        longviewClientsData[own?.match.params.id ?? ''];

      return {
        client,
        longviewClientsError,
        longviewClientsLastUpdated,
        longviewClientsLoading,
      };
    }
  )
)(LongviewDetail);

export default EnhancedLongviewDetail;
