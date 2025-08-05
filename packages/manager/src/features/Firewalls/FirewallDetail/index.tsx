import {
  useAllFirewallDevicesQuery,
  useFirewallQuery,
  useFirewallSettingsQuery,
  useMutateFirewall,
} from '@linode/queries';
import {
  Chip,
  CircleProgress,
  ErrorState,
  Paper,
  Typography,
} from '@linode/ui';
import { NotFound } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { AkamaiBanner } from 'src/components/AkamaiBanner/AkamaiBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { GenerateFirewallDialog } from 'src/components/GenerateFirewallDialog/GenerateFirewallDialog';
import { LandingHeader } from 'src/components/LandingHeader';
import { LinkButton } from 'src/components/LinkButton';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';
import { useSecureVMNoticesEnabled } from 'src/hooks/useSecureVMNoticesEnabled';
import { useTabs } from 'src/hooks/useTabs';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import {
  FIREWALL_DEFAULT_ENTITY_TO_READABLE_NAME,
  getFirewallDefaultEntities,
} from '../components/FirewallSelectOption.utils';

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

  const { secureVMNoticesEnabled } = useSecureVMNoticesEnabled();
  const flags = useFlags();
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = React.useState(false);

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const secureVMFirewallBanner =
    (secureVMNoticesEnabled && flags.secureVmCopy) ?? false;

  const firewallId = Number(id);

  const { data: firewallSettings } = useFirewallSettingsQuery({
    enabled: isLinodeInterfacesEnabled,
  });

  const defaultEntities =
    firewallSettings &&
    getFirewallDefaultEntities(firewallId, firewallSettings);

  const { data: permissions } = usePermissions(
    'firewall',
    ['update_firewall_rules'],
    firewallId
  );

  const { data: allDevices } = useAllFirewallDevicesQuery(firewallId);

  const { linodeCount, nodebalancerCount } = allDevices?.reduce(
    (acc, device) => {
      if (device.entity.type === 'linode') {
        acc.linodeCount += 1;
      } else if (device.entity.type === 'nodebalancer') {
        acc.nodebalancerCount += 1;
      } else if (
        isLinodeInterfacesEnabled &&
        device.entity.type === 'linode_interface' &&
        device.entity.parent_entity
      ) {
        const linodeId = device.entity.parent_entity.id;
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
      seenLinodeIdsForInterfaces: new Set<number>(),
    }
  ) || {
    linodeCount: 0,
    nodebalancerCount: 0,
  };

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
        spacingBottom={4}
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
      {isLinodeInterfacesEnabled &&
        defaultEntities &&
        defaultEntities.length > 0 && (
          <Paper
            sx={(theme) => ({
              alignItems: 'center',
              columnGap: 1,
              display: 'flex',
              flexWrap: 'wrap',
              margin: `${theme.spacingFunction(8)} 0`,
              padding: `${theme.spacingFunction(8)} ${theme.spacingFunction(
                16
              )}`,
              rowGap: 1,
            })}
          >
            <Typography
              sx={(theme) => ({ marginRight: theme.spacingFunction(8) })}
            >
              <strong>Default</strong>
            </Typography>
            {defaultEntities.map((defaultEntity) => (
              <Chip
                key={defaultEntity}
                label={FIREWALL_DEFAULT_ENTITY_TO_READABLE_NAME[defaultEntity]}
                size="small"
              />
            ))}
          </Paper>
        )}
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <FirewallRulesLanding
                disabled={!permissions.update_firewall_rules}
                firewallID={firewallId}
                rules={firewall.rules}
              />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <FirewallDeviceLanding
                firewallId={firewallId}
                firewallLabel={firewall.label}
                type="linode"
              />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <FirewallDeviceLanding
                firewallId={firewallId}
                firewallLabel={firewall.label}
                type="nodebalancer"
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
      <GenerateFirewallDialog
        onClose={() => setIsGenerateDialogOpen(false)}
        open={isGenerateDialogOpen}
      />
    </React.Fragment>
  );
};
