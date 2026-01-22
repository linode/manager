import { useAccountSettings } from '@linode/queries';
import { Dialog, Select } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { useIsDatabasesEnabled } from './features/Databases/utilities';
import { useIsMarketplaceV2Enabled } from './features/Marketplace/utils';
import { useIsNetworkLoadBalancerEnabled } from './features/NetworkLoadBalancers/utils';
import { useIsPlacementGroupsEnabled } from './features/PlacementGroups/utils';
import { useGlobalKeyboardListener } from './hooks/useGlobalKeyboardListener';

import type { SelectOption } from '@linode/ui';

export const GoTo = React.memo(() => {
  const navigate = useNavigate();

  const { data: accountSettings } = useAccountSettings();

  const isManagedAccount = accountSettings?.managed ?? false;

  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const { isMarketplaceV2FeatureEnabled } = useIsMarketplaceV2Enabled();
  const { isNetworkLoadBalancerEnabled } = useIsNetworkLoadBalancerEnabled();

  const { goToOpen, setGoToOpen } = useGlobalKeyboardListener();

  const onClose = () => {
    setGoToOpen(false);
  };

  const onSelect = (item: SelectOption<string>) => {
    navigate({ to: item.value });
    onClose();
  };

  const links = React.useMemo(
    () => [
      {
        display: 'Managed',
        hide: !isManagedAccount,
        href: '/managed',
      },
      {
        activeLinks: ['/linodes', '/linodes/create'],
        display: 'Linodes',
        href: '/linodes',
      },
      {
        display: 'Volumes',
        href: '/volumes',
      },
      {
        display: 'VPC',
        href: '/vpcs',
      },
      {
        display: 'Network Load Balancer',
        hide: !isNetworkLoadBalancerEnabled,
        href: '/netloadbalancers',
      },
      {
        display: 'NodeBalancers',
        href: '/nodebalancers',
      },
      {
        display: 'Firewalls',
        href: '/firewalls',
      },

      {
        display: 'StackScripts',
        href: '/stackscripts',
      },
      {
        display: 'Images',
        href: '/images',
      },
      {
        display: 'Placement Groups',
        hide: !isPlacementGroupsEnabled,
        href: '/placement-groups',
      },
      {
        display: 'Databases',
        hide: !isDatabasesEnabled,
        href: '/databases',
      },
      {
        display: 'Domains',
        href: '/domains',
      },
      {
        display: 'Kubernetes',
        href: '/kubernetes/clusters',
      },
      {
        activeLinks: ['/object-storage/buckets', '/object-storage/access-keys'],
        display: 'Object Storage',
        href: '/object-storage/buckets',
      },
      {
        display: 'Longview',
        href: '/longview',
      },
      {
        display: !isMarketplaceV2FeatureEnabled
          ? 'Marketplace'
          : 'Quick Deploy Apps',
        href: '/linodes/create/marketplace',
      },
      { display: 'Billing', href: '/billing' },
      { display: 'Identity & Access', href: '/iam' },
      { display: 'Login History', href: '/login-history' },
      { display: 'Service Transfers', href: '/service-transfers' },
      { display: 'Maintenance', href: '/maintenance' },
      { display: 'Settings', href: '/settings' },
      {
        display: 'Help & Support',
        href: '/support',
      },
      {
        display: 'Profile',
        href: '/profile/display',
      },
    ],
    [
      isDatabasesEnabled,
      isManagedAccount,
      isMarketplaceV2FeatureEnabled,
      isNetworkLoadBalancerEnabled,
      isPlacementGroupsEnabled,
    ]
  );

  const options: SelectOption<string>[] = React.useMemo(
    () =>
      links
        .filter((thisLink) => !thisLink.hide)
        .map((thisLink) => ({
          label: thisLink.display,
          value: thisLink.href,
        })),
    [links]
  );

  return (
    <Dialog
      enableCloseOnBackdropClick
      onClose={onClose}
      open={goToOpen}
      PaperProps={{
        sx: {
          '& .MuiAutocomplete-listbox': {
            border: 0,
            maxHeight: '75%',
          },
          '& .MuiDialogContent-root ': {
            padding: '0 !important',
          },
          '& [data-qa-close-drawer="true"], & [data-qa-dialog-title="Go To..."], & [aria-label="Close"]':
            {
              display: 'none',
            },
          '& .MuiPaper-root': {
            boxShadow: 'none',
          },
          height: '60%',
          minHeight: '50%',
          minWidth: 'auto !important',
          padding: '0 !important',
          width: 400,
        },
      }}
      title="Go To..."
    >
      {/* I was about to put a "@todo" item for mobile display, but realized
      keyboard shortcuts are not realistic on mobile devices. So I think an
      absolute width here is fine. */}
      <div style={{ maxHeight: 600, width: 400 }}>
        <Select
          // eslint-disable-next-line
          autoFocus
          hideLabel
          label="Go To"
          onChange={(_event, value) => onSelect(value)}
          open
          options={options}
          placeholder="Go to..."
          searchable
        />
      </div>
    </Dialog>
  );
});
