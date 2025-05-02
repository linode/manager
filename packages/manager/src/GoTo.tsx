import { Dialog, Select } from '@linode/ui';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { useIsDatabasesEnabled } from './features/Databases/utilities';
import { useIsPlacementGroupsEnabled } from './features/PlacementGroups/utils';
import { useAccountManagement } from './hooks/useAccountManagement';
import { useGlobalKeyboardListener } from './hooks/useGlobalKeyboardListener';

import type { SelectOption } from '@linode/ui';

export const GoTo = React.memo(() => {
  const routerHistory = useHistory();
  const { _hasAccountAccess, _isManagedAccount } = useAccountManagement();

  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const { goToOpen, setGoToOpen } = useGlobalKeyboardListener();

  const onClose = () => {
    setGoToOpen(false);
  };

  const onSelect = (item: SelectOption<string>) => {
    routerHistory.push(item.value);
    onClose();
  };

  const links = React.useMemo(
    () => [
      {
        display: 'Managed',
        hide: !_isManagedAccount,
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
        display: 'Marketplace',
        href: '/linodes/create?type=One-Click',
      },
      {
        display: 'Account',
        hide: !_hasAccountAccess,
        href: '/account/billing',
      },
      {
        display: 'Help & Support',
        href: '/support',
      },
      {
        display: 'Profile',
        href: '/profile/display',
      },
    ],
    [_hasAccountAccess, _isManagedAccount, isPlacementGroupsEnabled]
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
      PaperProps={{
        sx: {
          '& .MuiAutocomplete-listbox': {
            border: 0,
            maxHeight: '75%',
          },
          '& .MuiDialogContent-root ': {
            padding: '0 !important',
          },
          '& [data-qa-close-drawer="true"], & [data-qa-dialog-title="Go To..."], & [aria-label="Close"]': {
            display: 'none',
          },
          height: '80%',
          minHeight: '50%',
          minWidth: 'auto !important',
          padding: '0 !important',
          width: 400,
        },
      }}
      enableCloseOnBackdropClick
      onClose={onClose}
      open={goToOpen}
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
