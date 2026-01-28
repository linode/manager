import { useAccountUsers } from '@linode/queries';
import { Drawer } from '@linode/ui';
import React from 'react';

import { UpdateDelegationForm } from './UpdateDelegationForm';

import type { ChildAccount, ChildAccountWithDelegates } from '@linode/api-v4';

interface Props {
  delegation: ChildAccount | ChildAccountWithDelegates | undefined;
  onClose: () => void;
  open: boolean;
}

export const UpdateDelegationsDrawer = ({
  delegation,
  onClose,
  open,
}: Props) => {
  const { data: allParentAccounts, isLoading } = useAccountUsers({
    enabled: open,
    filters: { user_type: 'parent' },
  });

  const formattedCurrentUsers = React.useMemo(() => {
    if (delegation && 'users' in delegation && delegation.users) {
      return delegation.users.map((username) => ({
        label: username,
        value: username,
      }));
    }
    return [];
  }, [delegation]);

  const userOptions = React.useMemo(() => {
    if (!allParentAccounts?.data) return [];
    return allParentAccounts.data.map((user) => ({
      label: user.username,
      value: user.username,
    }));
  }, [allParentAccounts]);

  return (
    <Drawer onClose={onClose} open={open} title="Update Delegations">
      {delegation && (
        <UpdateDelegationForm
          delegation={delegation}
          formattedCurrentUsers={formattedCurrentUsers}
          isLoading={isLoading}
          onClose={onClose}
          userOptions={userOptions}
        />
      )}
    </Drawer>
  );
};
