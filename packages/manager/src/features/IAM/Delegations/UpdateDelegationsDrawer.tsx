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
  const formattedCurrentUsers = React.useMemo(() => {
    if (delegation && 'users' in delegation && delegation.users) {
      return delegation.users.map((username) => ({
        label: username,
        value: username,
      }));
    }
    return [];
  }, [delegation]);

  return (
    <Drawer onClose={onClose} open={open} title="Update Delegation">
      {delegation && (
        <UpdateDelegationForm
          delegation={delegation}
          formattedCurrentUsers={formattedCurrentUsers}
          onClose={onClose}
        />
      )}
    </Drawer>
  );
};
