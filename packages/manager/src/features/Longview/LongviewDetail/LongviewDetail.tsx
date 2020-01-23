import { LongviewClient } from 'linode-js-sdk/lib/longview';
import { pathOr } from 'ramda';
import * as React from 'react';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import AppBar from 'src/components/core/AppBar';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import DefaultLoader from 'src/components/DefaultLoader';
import DocumentationButton from 'src/components/DocumentationButton';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import Notice from 'src/components/Notice';
import TabLink from 'src/components/TabLink';
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
import useFlags from 'src/hooks/useFlags';
import { useClientLastUpdated } from '../shared/useClientLastUpdated';
import Apache from './DetailTabs/Apache';
import FeatureComingSoon from './DetailTabs/FeatureComingSoon';
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

const Overview = DefaultLoader({
  loader: () => import('./DetailTabs/LongviewDetailOverview')
});

const Installation = DefaultLoader({
  loader: () => import('./DetailTabs/Installation')
});

const Disks = DefaultLoader({
  loader: () => import('./DetailTabs/Disks')
});

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
  const flags = useFlags();
  const showAllTabs = Boolean(flags.longviewTabs);

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

  const handleTabChange = (
    _: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const routeName = tabs[value].routeName;
    props.history.push(`${routeName}`);
  };

  const url = props.match.url;
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
      <AppBar position="static" color="default" role="tablist">
        <Tabs
          value={tabs.findIndex(tab => matches(tab.routeName)) || 0}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
          className={classes.tabList}
        >
          {tabs.map(tab => (
            <Tab
              key={tab.title}
              data-qa-tab={tab.title}
              component={React.forwardRef((forwardedProps, ref) => (
                <TabLink
                  to={tab.routeName}
                  title={tab.title}
                  {...forwardedProps}
                  ref={ref}
                />
              ))}
            />
          ))}
        </Tabs>
      </AppBar>
      <Switch>
        <Route
          exact
          strict
          path={`${url}/processes`}
          render={() => {
            if (!showAllTabs) {
              return (
                <FeatureComingSoon
                  title="Processes"
                  clientLabel={client.label}
                />
              );
            }

            return (
              <ProcessesLanding
                clientID={client.id}
                clientAPIKey={client.api_key}
                lastUpdated={lastUpdated}
                lastUpdatedError={lastUpdatedError}
                timezone={timezone}
              />
            );
          }}
        />
        <Route
          exact
          strict
          path={`${url}/network`}
          render={() => (
            <NetworkLanding
              clientAPIKey={client.api_key}
              lastUpdated={lastUpdated}
              lastUpdatedError={lastUpdatedError}
              timezone={timezone}
            />
          )}
        />
        <Route
          exact
          strict
          path={`${url}/disks`}
          render={routerProps => (
            <Disks
              clientID={client.id}
              clientAPIKey={client.api_key}
              lastUpdated={lastUpdated}
              clientLastUpdated={lastUpdated}
              lastUpdatedError={lastUpdatedError}
              timezone={props.timezone}
              {...routerProps}
            />
          )}
        />
        )}
        <Route
          exact
          strict
          path={`${url}/apache`}
          render={() => {
            if (!showAllTabs) {
              return (
                <FeatureComingSoon title="Apache" clientLabel={client.label} />
              );
            }
            return (
              <Apache
                timezone={timezone}
                clientAPIKey={clientAPIKey}
                lastUpdated={lastUpdated}
                lastUpdatedError={lastUpdatedError}
              />
            );
          }}
        />
        )}
        <Route
          exact
          strict
          path={`${url}/nginx`}
          render={() => {
            if (!showAllTabs) {
              return (
                <FeatureComingSoon title="NGINX" clientLabel={client.label} />
              );
            }
            return (
              <NGINX
                timezone={timezone}
                clientAPIKey={clientAPIKey}
                lastUpdated={lastUpdated}
                lastUpdatedError={lastUpdatedError}
              />
            );
          }}
        />
        )}
        <Route
          exact
          strict
          path={`${url}/mysql`}
          render={() => {
            if (!showAllTabs) {
              return (
                <FeatureComingSoon title="MySQL" clientLabel={client.label} />
              );
            }
            return (
              <MySQLLanding
                timezone={timezone}
                clientAPIKey={clientAPIKey}
                lastUpdated={lastUpdated}
                lastUpdatedError={lastUpdatedError}
              />
            );
          }}
        />
        )}
        <Route
          exact
          strict
          path={`${url}/installation`}
          render={routerProps => (
            <Installation
              clientInstallationKey={client.install_code}
              clientAPIKey={client.api_key}
              {...routerProps}
            />
          )}
        />
        <Route
          strict
          exact
          path={`${url}/overview`}
          render={routerProps => (
            <Overview
              client={client.label}
              clientID={client.id}
              clientAPIKey={client.api_key}
              longviewClientData={longviewClientData}
              timezone={timezone}
              {...routerProps}
              topProcessesData={topProcesses.data}
              topProcessesLoading={topProcesses.loading}
              topProcessesError={topProcesses.error}
              listeningPortsData={listeningPorts.data}
              listeningPortsError={listeningPorts.error}
              listeningPortsLoading={listeningPorts.loading}
              lastUpdatedError={lastUpdatedError}
              lastUpdated={lastUpdated}
            />
          )}
        />
        <Redirect to={`${url}/overview`} />
      </Switch>
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
