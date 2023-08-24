import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { NotFound } from 'src/components/NotFound';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { useFirewallQuery, useMutateFirewall } from 'src/queries/firewalls';
import { useGrants, useProfile } from 'src/queries/profile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { checkIfUserCanModifyFirewall } from '../shared';

const FirewallRulesLanding = React.lazy(() =>
  import('./Rules/FirewallRulesLanding').then((module) => ({
    default: module.FirewallRulesLanding,
  }))
);

const FirewallDeviceLanding = React.lazy(() =>
  import('./Devices/FirewallDeviceLanding').then((module) => ({
    default: module.FirewallDeviceLanding,
  }))
);

export const FirewallDetail = () => {
  const { id, tab } = useParams<{ id: string; tab?: string }>();
  const history = useHistory();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const firewallID = Number(id);

  const userCanModifyFirewall = checkIfUserCanModifyFirewall(
    firewallID,
    profile,
    grants
  );

  const { data: allDevices } = useAllFirewallDevicesQuery(firewallID);

  const { linodeCount, nodebalancerCount } = allDevices?.reduce(
    (acc, device) => {
      if (device.entity.type === 'linode') {
        acc.linodeCount += 1;
      } else if (device.entity.type === 'nodebalancer') {
        acc.nodebalancerCount += 1;
      }
      return acc;
    },
    { linodeCount: 0, nodebalancerCount: 0 }
  ) || { linodeCount: 0, nodebalancerCount: 0 };

  const tabs = [
    {
      routeName: `/firewalls/${id}/rules`,
      title: 'Rules',
    },
    {
      routeName: `/firewalls/${id}/linodes`,
      title: `Linodes (${linodeCount})`,
    },
    {
      routeName: `/firewalls/${id}/nodebalancers`,
      title: `NodeBalancers (${nodebalancerCount})`,
    },
  ];

  const tabIndex = tab ? tabs.findIndex((t) => t.routeName.endsWith(tab)) : -1;

  const { data: firewall, error, isLoading } = useFirewallQuery(firewallID);

  const {
    error: updateError,
    mutateAsync: updateFirewall,
    reset,
  } = useMutateFirewall(firewallID);

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

  function getBreadcrumb() {
    let breadcrumb = '';
    switch (tab) {
      case 'linodes':
        breadcrumb = ' / Assigned Linodes';
        break;
      case 'nodebalancers':
        breadcrumb = ' / Assigned NodeBalancers';
        break;
    }
    return firewall?.label + breadcrumb;
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={firewall.label} />
      <LandingHeader
        breadcrumbProps={{
          onEditHandlers: {
            editableTextTitle: getBreadcrumb(),
            errorText,
            onCancel: resetEditableLabel,
            onEdit: handleLabelChange,
          },
          pathname: `/firewalls/${firewall.label}`,
        }}
        docsLabel="Docs"
        docsLink="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/"
        title="Firewall Details"
      />
      <Tabs
        index={tabIndex === -1 ? 0 : tabIndex}
        onChange={(i) => history.push(tabs[i].routeName)}
      >
        <TabLinkList tabs={tabs} />

        <TabPanels>
          <SafeTabPanel index={0}>
            <FirewallRulesLanding
              disabled={!userCanModifyFirewall}
              firewallID={firewallID}
              rules={firewall.rules}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <FirewallDeviceLanding
              disabled={!userCanModifyFirewall}
              firewallID={firewallID}
              firewallLabel={firewall.label}
              type="linode"
            />
          </SafeTabPanel>
          <SafeTabPanel index={2}>
            <FirewallDeviceLanding
              disabled={!userCanModifyFirewall}
              firewallID={firewallID}
              firewallLabel={firewall.label}
              type="nodebalancer"
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};

export default FirewallDetail;
