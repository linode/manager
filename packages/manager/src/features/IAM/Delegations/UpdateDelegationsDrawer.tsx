import {
  Button,
  LoadingSpinner,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import React from 'react';

import { useBreakpoint } from '../hooks/useBreakpoint';
import { Drawer, DrawerInlineActions } from '../Shared/Drawer';
import styles from '../Shared/global.module.css';
import { UpdateDelegationForm } from './UpdateDelegationForm';

import type { ChildAccount, ChildAccountWithDelegates } from '@linode/api-v4';

interface Props {
  delegation: ChildAccount | ChildAccountWithDelegates | undefined;
  isDelegationsLoading?: boolean;
  onClose: () => void;
  open: boolean;
}

export const UpdateDelegationsDrawer = ({
  delegation,
  onClose,
  isDelegationsLoading = false,
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
      {isDelegationsLoading ? (
        <div
          slot="body"
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: Spacing.S24,
          }}
        >
          <LoadingSpinner data-testid="circle-progress" size="medium" />
        </div>
      ) : delegation ? (
        <UpdateDelegationForm
          delegation={delegation}
          formattedCurrentUsers={formattedCurrentUsers}
          onClose={onClose}
        />
      ) : (
        <div slot="body">
          <NotificationBanner type="error">
            <p style={{ marginBottom: Spacing.S0 }}>
              This account could not be found.
            </p>
          </NotificationBanner>
          <DrawerInlineActions>
            <Button data-testid="cancel" onClick={onClose} variant="secondary">
              Close
            </Button>
          </DrawerInlineActions>
        </div>
      )}
    </Drawer>
  );
};
