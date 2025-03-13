import {
  useAllFirewallDevicesQuery,
  useFirewallQuery,
  useGrants,
  useMutateFirewall,
  useProfile,
} from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { AkamaiBanner } from 'src/components/AkamaiBanner/AkamaiBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { GenerateFirewallDialog } from 'src/components/GenerateFirewallDialog/GenerateFirewallDialog';
import { LandingHeader } from 'src/components/LandingHeader';
import { LinkButton } from 'src/components/LinkButton';
import { NotFound } from 'src/components/NotFound';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useSecureVMNoticesEnabled } from 'src/hooks/useSecureVMNoticesEnabled';
import { useTabs } from 'src/hooks/useTabs';
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
  const { id } = useParams({
    strict: false,
  });
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { secureVMNoticesEnabled } = useSecureVMNoticesEnabled();
  const flags = useFlags();
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = React.useState(false);

  const secureVMFirewallBanner =
    (secureVMNoticesEnabled && flags.secureVmCopy) ?? false;

  const firewallId = Number(id);

  const userCanModifyFirewall = checkIfUserCanModifyFirewall(
    firewallId,
    profile,
    grants
  );

  const { data: allDevices } = useAllFirewallDevicesQuery(firewallId);

  const { linodeCount, nodebalancerCount } = allDevices?.reduce(
    (acc, device) => {
      if (device.entity.type === 'linode') {
        acc.linodeCount += 1;
      } else if (device.entity.type === 'nodebalancer') {
        acc.nodebalancerCount += 1;
      } else if (device.entity.type === 'interface') {
        const linodeId = device.entity.url.split('/')[4];
        if (!acc.seenLinodeIdsForInterfaces.has(linodeId)) {
          acc.linodeCount += 1;
        }
        acc.seenLinodeIdsForInterfaces.add(linodeId);
      }
      return acc;
    },
    {
      linodeCount: 0,
      nodebalancerCount: 0,
      seenLinodeIdsForInterfaces: new Set<string>(),
    }
  ) || { linodeCount: 0, nodebalancerCount: 0 };

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Rules',
      to: `/firewalls/$id/rules`,
    },
    {
      title: `Linodes (${linodeCount})`,
      to: `/firewalls/$id/linodes`,
    },
    {
      title: `NodeBalancers (${nodebalancerCount})`,
      to: `/firewalls/$id/nodebalancers`,
    },
  ]);

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
            editableTextTitle: firewall?.label,
            errorText,
            onCancel: resetEditableLabel,
            onEdit: handleLabelChange,
          },
          pathname: `/firewalls/${firewall.label}`,
        }}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-cloud-firewalls"
        title="Firewall Details"
      />
      {secureVMFirewallBanner && secureVMFirewallBanner.firewallDetails && (
        <AkamaiBanner
          action={
            secureVMFirewallBanner.generateActionText ? (
              <LinkButton onClick={() => setIsGenerateDialogOpen(true)}>
                {secureVMFirewallBanner.generateActionText}
              </LinkButton>
            ) : undefined
          }
          margin={3}
          {...secureVMFirewallBanner.firewallDetails}
        />
      )}
      <Tabs index={tabIndex === -1 ? 0 : tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <FirewallRulesLanding
              disabled={!userCanModifyFirewall}
              firewallID={firewallId}
              rules={firewall.rules}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <FirewallDeviceLanding
              disabled={!userCanModifyFirewall}
              firewallId={firewallId}
              firewallLabel={firewall.label}
              type="linode"
            />
          </SafeTabPanel>
          <SafeTabPanel index={2}>
            <FirewallDeviceLanding
              disabled={!userCanModifyFirewall}
              firewallId={firewallId}
              firewallLabel={firewall.label}
              type="nodebalancer"
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
      <GenerateFirewallDialog
        onClose={() => setIsGenerateDialogOpen(false)}
        open={isGenerateDialogOpen}
      />
    </React.Fragment>
  );
};
