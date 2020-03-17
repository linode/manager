import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';

import Box from 'src/components/core/Box';
import Tabs from 'src/components/core/Tabs';
import TabList from 'src/components/core/TabList';
import TabPanels from 'src/components/core/TabPanels';
import TabPanel from 'src/components/core/TabPanel';
import Tab from 'src/components/core/Tab';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import TabLink from 'src/components/TabLink';
import withFirewalls, {
  Props as WithFirewallsProps
} from 'src/containers/firewalls.container';

const FirewallRulesLanding = React.lazy(() =>
  import('./Rules/FirewallRulesLanding')
);

const FirewallLinodesLanding = React.lazy(() => import('./Devices'));

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
      <Tabs>
        <TabList>
          {tabs.map(tab => (
            <Tab key={tab.title} data-qa-tab={tab.title}>
              <TabLink to={tab.routeName} title={tab.title} />
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel>
            <FirewallRulesLanding rules={thisFirewall.rules} />
          </TabPanel>

          <TabPanel>
            <FirewallLinodesLanding
              firewallID={+thisFirewallId}
              firewallLabel={thisFirewall.label}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};

const enhanced = compose(withFirewalls());

export default enhanced(FirewallDetail);
