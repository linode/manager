import { LongviewClient } from 'linode-js-sdk/lib/longview';
import * as React from 'react';
import {
  matchPath,
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

interface Props {
  client?: LongviewClient;
  longviewClientsLastUpdated: number;
  longviewClientsLoading: LVProps['longviewClientsLoading'];
  longviewClientsError: LVProps['longviewClientsError'];
}

const Overview = DefaultLoader({
  loader: () => import('./LongviewDetailOverview')
});

const Installation = DefaultLoader({
  loader: () => import('./DetailTabs/Installation')
});

type CombinedProps = RouteComponentProps<{ id: string }> &
  Props &
  DispatchProps;

const LongviewDetail: React.FC<CombinedProps> = props => {
  const {
    client,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsError
  } = props;

  React.useEffect(() => {
    /** request clients if they haven't already been requested */
    if (longviewClientsLastUpdated === 0) {
      props.getLongviewClients();
    }
  }, []);

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
      display: (client && client.apps.apache) || false,
      routeName: `${props.match.url}/apache`
    },
    {
      title: 'Nginx',
      display: (client && client.apps.nginx) || false,
      routeName: `${props.match.url}/nginx`
    },
    {
      title: 'MySQL',
      display: (client && client.apps.mysql) || false,
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

  React.useEffect(() => {
    /** request clients if they haven't already been requested */
    if (longviewClientsLastUpdated === 0) {
      props.getLongviewClients();
    }
  }, []);

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
        <Route
          exact
          strict
          path={`${url}/processes`}
          render={() => <h2>Processes</h2>}
        />
        <Route
          exact
          strict
          path={`${url}/network`}
          render={() => <h2>Network</h2>}
        />
        <Route
          exact
          strict
          path={`${url}/disks`}
          render={() => <h2>Disks</h2>}
        />
        <Route
          exact
          strict
          path={`${url}/apache`}
          render={() => <h2>Apache</h2>}
        />
        <Route
          exact
          strict
          path={`${url}/nginx`}
          render={() => <h2>Nginx</h2>}
        />
        <Route
          exact
          strict
          path={`${url}/mysql`}
          render={() => <h2>MySQL</h2>}
        />
        <Route
          exact
          strict
          path={`${url}/installation`}
          render={routerProps => (
            <Installation
              clientInstallationKey={client.install_code}
              {...routerProps}
            />
          )}
        />
        <Route strict component={Overview} />
      </Switch>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withLongviewClients<Props, RouteComponentProps<{ id: string }>>(
    (
      own,
      {
        longviewClientsData,
        longviewClientsLastUpdated,
        longviewClientsLoading,
        longviewClientsError
      }
    ) => ({
      client: longviewClientsData[own.match.params.id],
      longviewClientsLastUpdated,
      longviewClientsLoading,
      longviewClientsError
    })
  )
)(LongviewDetail);
