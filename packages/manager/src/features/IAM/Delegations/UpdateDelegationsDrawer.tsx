import React from 'react';

import { useBreakpoint } from '../hooks/useBreakpoint';
import { Drawer } from '../Shared/Drawer';
import styles from '../Shared/global.module.css';
import { UpdateDelegationForm } from './UpdateDelegationForm';

import type { ChildAccount, ChildAccountWithDelegates } from '@linode/api-v4';

interface Props {
  delegation: ChildAccount | ChildAccountWithDelegates | null;
  onClose: () => void;
  open: boolean;
}

export const UpdateDelegationsDrawer = ({
  delegation,
  onClose,
  open,
}: Props) => {
  const isSMUp = useBreakpoint('up', 'sm');
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
    <Drawer
      className={styles.noMargin}
      onClose={onClose}
      open={open}
      title="Update Delegation"
      width={isSMUp ? '600px' : '100%'}
    >
      <div slot="header">Update Delegation</div>
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
