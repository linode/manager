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
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import TabLink from 'src/components/TabLink';
import withFirewalls, {
  Props as WithFirewallsProps
} from 'src/containers/firewalls.container';

const FirewallRulesLanding = DefaultLoader({
  loader: () => import('./FirewallRulesLanding')
});

const FirewallLinodesLanding = DefaultLoader({
  loader: () => import('./FirewallLinodesLanding')
});

type CombinedProps = RouteComponentProps<{ id: string }> & WithFirewallsProps;

export const FirewallDetail: React.FC<CombinedProps> = props => {
  // Source the Firewall's ID from the /:id path param.
  const thisFirewallId = props.match.params.id;

  // Find the Firewall in the store.
  const thisFirewall = props.data[thisFirewallId];

  // If we're still fetching Firewalls, display a loading spinner. This will
  // probably only happen when navigating to a Firewall's Detail page directly
  // via URL bookmark (as opposed to clicking on the Firewall Landing table).
  if (props.lastUpdated === 0 && props.loading === true && !thisFirewall) {
    return <CircleProgress />;
  }

  if (props.error.read) {
    return (
      <ErrorState errorText="There was a problem retrieving your Firewall. Please try again." />
    );
  }

  // If we've already fetched Firewalls but don't have a Firewall that
  // corresponds to the ID in the path param, show a 404.
  if (!thisFirewall) {
    return <NotFound />;
  }

  const URL = props.match.url;

  const tabs = [
    {
      title: 'Rules',
      routeName: `${URL}/rules`
    },
    {
      title: 'Linodes',
      routeName: `${URL}/linodes`
    }
  ];

  const handleTabChange = (
    _: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const routeName = tabs[value].routeName;
    props.history.push(`${routeName}`);
  };

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Firewalls" />
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={props.location.pathname}
          labelTitle={thisFirewall.label}
          removeCrumbX={2}
        />
        {/* @todo: Insert real link when the doc is written. */}
        <DocumentationButton href="https://www.linode.com/docs/platform" />
      </Box>
      <AppBar position="static" color="default" role="tablist">
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
          path={`${URL}/rules`}
          component={FirewallRulesLanding}
        />
        <Route
          exact
          strict
          path={`${URL}/linodes`}
          component={FirewallLinodesLanding}
        />
        <Redirect to={`${URL}/rules`} />
      </Switch>
    </React.Fragment>
  );
};

const enhanced = compose(withFirewalls());

export default enhanced(FirewallDetail);
