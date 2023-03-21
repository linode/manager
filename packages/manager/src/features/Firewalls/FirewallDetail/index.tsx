import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import { useProfile, useGrants } from 'src/queries/profile';
import { useFirewallQuery, useMutateFirewall } from 'src/queries/firewalls';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import LandingHeader from 'src/components/LandingHeader';

const FirewallRulesLanding = React.lazy(
  () => import('./Rules/FirewallRulesLanding')
);

const FirewallLinodesLanding = React.lazy(() => import('./Devices'));

type CombinedProps = RouteComponentProps<{ id: string }>;

export const FirewallDetail: React.FC<CombinedProps> = (props) => {
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  // Source the Firewall's ID from the /:id path param.
  const thisFirewallId = props.match.params.id;
  const userCanModifyFirewall =
    !profile?.restricted ||
    grants?.firewall?.find((firewall) => firewall.id === +thisFirewallId)
      ?.permissions === 'read_write';

  const URL = props.match.url;

  const tabs = [
    {
      title: 'Rules',
      routeName: `${URL}/rules`,
    },
    {
      title: 'Linodes',
      routeName: `${URL}/linodes`,
    },
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  const { data, isLoading, error: allFirewallsError } = useFirewallQuery();
  const thisFirewall = data?.[thisFirewallId];

  const { mutateAsync: updateFirewall, error, reset } = useMutateFirewall();

  const errorText = getErrorStringOrDefault(error ?? '');

  // If we're still fetching Firewalls, display a loading spinner. This will
  // probably only happen when navigating to a Firewall's Detail page directly
  // via URL bookmark (as opposed to clicking on the Firewall Landing table).
  if (isLoading && !thisFirewall) {
    return <CircleProgress />;
  }

  if (allFirewallsError) {
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
    return updateFirewall({
      id: Number(thisFirewallId),
      payload: { label: newLabel },
    });
  };

  const resetEditableLabel = () => {
    return thisFirewall.label;
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={thisFirewall.label} />
      <LandingHeader
        title="Firewall Details"
        docsLabel="Docs"
        docsLink="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/"
        breadcrumbProps={{
          pathname: props.location.pathname,
          onEditHandlers: {
            editableTextTitle: thisFirewall.label,
            onEdit: handleLabelChange,
            onCancel: resetEditableLabel,
            errorText,
          },
        }}
      />
      <Tabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
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
              disabled={!userCanModifyFirewall}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <FirewallLinodesLanding
              firewallID={+thisFirewallId}
              firewallLabel={thisFirewall.label}
              disabled={!userCanModifyFirewall}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};

export default FirewallDetail;
