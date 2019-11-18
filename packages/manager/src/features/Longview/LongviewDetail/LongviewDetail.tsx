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
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import DefaultLoader from 'src/components/DefaultLoader';
import DocumentationButton from 'src/components/DocumentationButton';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import TabLink from 'src/components/TabLink';
import withLongviewClients, {
  DispatchProps,
  Props as LVProps
} from 'src/containers/longview.container';
import { get } from 'src/features/Longview/request';
import { LongviewTopProcesses } from 'src/features/Longview/request.types';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import useFlags from 'src/hooks/useFlags';
import { useClientLastUpdated } from '../shared/useClientLastUpdated';
import ProcessesLanding from './DetailTabs/Processes/ProcessesLanding';

const topProcessesEmptyDataSet: LongviewTopProcesses = { Processes: {} };

import withClientStats, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';

interface Props {
  client?: LongviewClient;
  longviewClientsLastUpdated: number;
  longviewClientsLoading: LVProps['longviewClientsLoading'];
  longviewClientsError: LVProps['longviewClientsError'];
}

interface DataProps {
  clientID: number;
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
  DispatchProps;

export const LongviewDetail: React.FC<CombinedProps> = props => {
  const {
    client,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsError,
    longviewClientData
  } = props;

  React.useEffect(() => {
    /** request clients if they haven't already been requested */
    if (longviewClientsLastUpdated === 0) {
      props.getLongviewClients();
    }

    if (client) {
      props.getClientStats(client.api_key);
    }
  }, [client]);
  const clientAPIKey = client && client.api_key;
  const flags = useFlags();
  const showAllTabs = Boolean(flags.longviewTabs);
  const { lastUpdated, lastUpdatedError } = useClientLastUpdated(clientAPIKey);

  const topProcesses = useAPIRequest<LongviewTopProcesses>(
    // We can only make this request if we have a clientAPIKey, so we use `null`
    // if we don't (which will happen the first time this component mounts). We
    // also check for `lastUpdated`, otherwise we'd make an extraneous request
    // when it is retrieved.
    clientAPIKey && lastUpdated
      ? () => get(clientAPIKey, 'getTopProcesses')
      : null,
    topProcessesEmptyDataSet,
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
      display: showAllTabs,
      routeName: `${props.match.url}/processes`
    },
    {
      title: 'Network',
      display: showAllTabs,
      routeName: `${props.match.url}/network`
    },
    {
      title: 'Disks',
      display: showAllTabs,
      routeName: `${props.match.url}/disks`
    },
    {
      title: 'Apache',
      display: (client && client.apps.apache && showAllTabs) || false,
      routeName: `${props.match.url}/apache`
    },
    {
      title: 'Nginx',
      display: (client && client.apps.nginx && showAllTabs) || false,
      routeName: `${props.match.url}/nginx`
    },
    {
      title: 'MySQL',
      display: (client && client.apps.mysql && showAllTabs) || false,
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
        />
        <DocumentationButton href={'https://google.com'} />
      </Box>
      <AppBar position="static" color="default">
        <Tabs
          value={tabs.findIndex(tab => matches(tab.routeName)) || 0}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
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
        {showAllTabs && (
          <Route
            exact
            strict
            path={`${url}/processes`}
            render={() => <ProcessesLanding />}
          />
        )}
        {showAllTabs && (
          <Route
            exact
            strict
            path={`${url}/network`}
            render={() => <h2>Network</h2>}
          />
        )}
        {showAllTabs && (
          <Route
            exact
            strict
            path={`${url}/disks`}
            render={routerProps => (
              <Disks
                clientID={client.id}
                clientAPIKey={client.api_key}
                {...routerProps}
              />
            )}
          />
        )}
        {showAllTabs && (
          <Route
            exact
            strict
            path={`${url}/apache`}
            render={() => <h2>Apache</h2>}
          />
        )}
        {showAllTabs && (
          <Route
            exact
            strict
            path={`${url}/nginx`}
            render={() => <h2>Nginx</h2>}
          />
        )}

        {showAllTabs && (
          <Route
            exact
            strict
            path={`${url}/mysql`}
            render={() => <h2>MySQL</h2>}
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
              longviewClientData={longviewClientData}
              {...routerProps}
              topProcessesData={topProcesses.data}
              topProcessesLoading={topProcesses.loading}
              topProcessesError={topProcesses.error}
              lastUpdatedError={lastUpdatedError}
            />
          )}
        />
        <Redirect to={`${url}/overview`} />
      </Switch>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withClientStats<DataProps>(props => props.clientID),
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
