import * as React from 'react';
import {
  matchPath,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { NotFound } from 'src/components/NotFound';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { useFirewallQuery, useMutateFirewall } from 'src/queries/firewalls';
import { useGrants, useProfile } from 'src/queries/profile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { checkIfUserCanModifyFirewall } from '../shared';

const FirewallLinodesLanding = React.lazy(
  () => import('./Devices/FirewallLinodesLanding')
);
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

  const userCanModifyFirewall = checkIfUserCanModifyFirewall(
    firewallId,
    profile,
    grants
  );

  const tabs = [
    {
      routeName: `${url}/rules`,
      title: 'Rules',
    },
    {
      routeName: `${url}/linodes`,
      title: 'Linodes',
    },
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
  };

  const { data: firewall, error, isLoading } = useFirewallQuery(firewallId);

  const {
    error: updateError,
    mutateAsync: updateFirewall,
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
        breadcrumbProps={{
          onEditHandlers: {
            editableTextTitle: firewall.label,
            errorText,
            onCancel: resetEditableLabel,
            onEdit: handleLabelChange,
          },
          pathname: location.pathname,
        }}
        docsLabel="Docs"
        docsLink="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/"
        title="Firewall Details"
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
              disabled={!userCanModifyFirewall}
              firewallID={firewallId}
              rules={firewall.rules}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <FirewallLinodesLanding
              disabled={!userCanModifyFirewall}
              firewallID={firewallId}
              firewallLabel={firewall.label}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};

export default FirewallDetail;
