import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import DocumentationButton from 'src/components/DocumentationButton';
import DocumentationButton_CMR from 'src/components/CMR_DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import withFirewalls, {
  Props as WithFirewallsProps
} from 'src/containers/firewalls.container';
import useFlags from 'src/hooks/useFlags';
import { useFirewallQuery, useMutateFirewall } from 'src/queries/firewalls';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

const FirewallRulesLanding = React.lazy(() =>
  import('./Rules/FirewallRulesLanding')
);

const FirewallLinodesLanding = React.lazy(() => import('./Devices'));

type CombinedProps = RouteComponentProps<{ id: string }> & WithFirewallsProps;

export const FirewallDetail: React.FC<CombinedProps> = props => {
  const flags = useFlags();

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

  // const [updateError, setUpdateError] = React.useState<string | undefined>();

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  const { data } = useFirewallQuery();
  const thisFirewall = data?.[thisFirewallId];

  const { mutateAsync: updateFirewall, error, reset } = useMutateFirewall(
    Number(thisFirewallId)
  );

  const errorText = getErrorStringOrDefault(error ?? '');

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
    if (error) {
      reset();
    }
    return updateFirewall({ label: newLabel });
  };

  const resetEditableLabel = () => {
    return thisFirewall.label;
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={thisFirewall.label} />
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Breadcrumb
          pathname={props.location.pathname}
          firstAndLastOnly
          onEditHandlers={{
            editableTextTitle: thisFirewall.label,
            onEdit: handleLabelChange,
            onCancel: resetEditableLabel,
            errorText
          }}
        />
        {flags.cmr ? (
          <DocumentationButton_CMR href="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/" />
        ) : (
          <DocumentationButton href="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/" />
        )}
      </Box>
      <Tabs
        index={Math.max(
          tabs.findIndex(tab => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
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
