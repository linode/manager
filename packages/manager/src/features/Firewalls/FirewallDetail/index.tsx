import * as React from 'react';
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
import {
  matchPath,
  useHistory,
  useLocation,
  useRouteMatch,
  useParams,
} from 'react-router-dom';

const FirewallLinodesLanding = React.lazy(() => import('./Devices'));
const FirewallRulesLanding = React.lazy(
  () => import('./Rules/FirewallRulesLanding')
);

export const FirewallDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { url } = useRouteMatch();
  const location = useLocation();
  const history = useHistory();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const firewallId = Number(id);

  const userCanModifyFirewall =
    !profile?.restricted ||
    grants?.firewall?.find((firewall) => firewall.id === firewallId)
      ?.permissions === 'read_write';

  const tabs = [
    {
      title: 'Rules',
      routeName: `${url}/rules`,
    },
    {
      title: 'Linodes',
      routeName: `${url}/linodes`,
    },
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
  };

  const { data: firewall, isLoading, error } = useFirewallQuery(firewallId);

  const {
    mutateAsync: updateFirewall,
    error: updateError,
    reset,
  } = useMutateFirewall(firewallId);

  const errorText = getErrorStringOrDefault(updateError ?? '');

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState errorText="There was a problem retrieving your Firewall. Please try again." />
    );
  }

  if (!firewall) {
    return <NotFound />;
  }

  const handleLabelChange = (newLabel: string) => {
    if (updateError) {
      reset();
    }
    return updateFirewall({ label: newLabel });
  };

  const resetEditableLabel = () => {
    return firewall.label;
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={firewall.label} />
      <LandingHeader
        title="Firewall Details"
        docsLabel="Docs"
        docsLink="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/"
        breadcrumbProps={{
          pathname: location.pathname,
          onEditHandlers: {
            editableTextTitle: firewall.label,
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
              firewallID={firewallId}
              rules={firewall.rules}
              disabled={!userCanModifyFirewall}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <FirewallLinodesLanding
              firewallID={firewallId}
              firewallLabel={firewall.label}
              disabled={!userCanModifyFirewall}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};

export default FirewallDetail;
