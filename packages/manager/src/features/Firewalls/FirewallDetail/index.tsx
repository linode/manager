import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';

import Box from 'src/components/core/Box';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';

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

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const [updateError, setUpdateError] = React.useState<string | undefined>();
  const [idx, setIndex] = React.useState(0);

  const getIndex = React.useCallback(() => {
    return Math.max(
      tabs.findIndex(tab => matches(tab.routeName)),
      0
    );
  }, [tabs]);

  React.useEffect(() => {
    setIndex(getIndex());
  }, [props.match, tabs, getIndex]);

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  // Find the Firewall in the store.
  const thisFirewall = props.itemsById[thisFirewallId];

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

  const handleLabelChange = (newLabel: string) => {
    setUpdateError(undefined);

    return props
      .updateFirewall({ firewallID: thisFirewall.id, label: newLabel })
      .catch(e => {
        setUpdateError(e[0].reason);
        return Promise.reject(e);
      });
  };

  const resetEditableLabel = () => {
    setUpdateError(undefined);
    return thisFirewall.label;
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={thisFirewall.label} />
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        paddingBottom={'20px'}
      >
        <Breadcrumb
          pathname={props.location.pathname}
          firstAndLastOnly
          onEditHandlers={{
            editableTextTitle: thisFirewall.label,
            onEdit: handleLabelChange,
            onCancel: resetEditableLabel,
            errorText: updateError
          }}
        />
        <DocumentationButton href="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/" />
      </Box>
      <Tabs index={idx} onChange={navToURL}>
        <TabLinkList tabs={tabs} />

        <TabPanels>
          <SafeTabPanel index={0}>
            <FirewallRulesLanding
              firewallID={+thisFirewallId}
              rules={thisFirewall.rules}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <FirewallLinodesLanding
              firewallID={+thisFirewallId}
              firewallLabel={thisFirewall.label}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};

const enhanced = compose(withFirewalls());

export default enhanced(FirewallDetail);
