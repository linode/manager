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
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import DefaultLoader from 'src/components/DefaultLoader';
import DocumentationButton from 'src/components/DocumentationButton';
import TabLink from 'src/components/TabLink';

import withLongviewClients, {
  DispatchProps,
  Props as LVProps
} from 'src/containers/longview.container';

interface Props {
  clients: LVProps['longviewClientsData'];
  longviewClientsLastUpdated: number;
}

const Overview = DefaultLoader({
  loader: () => import('./LongviewDetailOverview')
});

type CombinedProps = RouteComponentProps<{ id: string }> &
  Props &
  DispatchProps;

const LongviewDetail: React.FC<CombinedProps> = props => {
  const {
    match: {
      params: { id }
    },
    clients,
    longviewClientsLastUpdated
  } = props;

  React.useEffect(() => {
    /** request clients if they haven't already been requested */
    if (longviewClientsLastUpdated === 0) {
      props.getLongviewClients();
    }
  }, []);

  const client = clients[id];

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

  if (!client) {
    return <CircleProgress />;
  }

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={props.location.pathname}
          removeCrumbX={2}
          labelTitle={(client && client.label) || 'Client Label'}
        />
        <DocumentationButton href={'https://google.com'} />
      </Box>
      <AppBar position="static" color="default">
        <Tabs
          value={tabs.findIndex(tab => matches(tab.routeName))}
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
          path={`${url}/overview`}
          render={() => <Overview {...props} />}
        />
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
          render={() => <h2>Installation</h2>}
        />
        <Redirect to={`${url}/overview`} />
      </Switch>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withLongviewClients<Props, {}>(
    (own, { longviewClientsData, longviewClientsLastUpdated }) => ({
      clients: longviewClientsData,
      longviewClientsLastUpdated
    })
  )
)(LongviewDetail);
