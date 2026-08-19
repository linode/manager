import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { LoadingSpinner } from '@akamai/cds-components/react/LoadingSpinner';
import { Spacing } from '@akamai/cds-tokens';
import React from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Drawer, DrawerInlineActions } from '../../Shared/Drawer';
import styles from '../../Shared/global.module.css';
import { UpdateEntitiesForm } from './UpdateEntitiesForm';

import type { EntitiesOption, ExtendedRoleView } from '../types';

interface Props {
  isRolesLoading?: boolean;
  onClose: () => void;
  open: boolean;
  role: ExtendedRoleView | undefined;
}

export const UpdateEntitiesDrawer = ({
  isRolesLoading = false,
  onClose,
  open,
  role,
}: Props) => {
  const isSMUp = useBreakpoint('up', 'sm');

  const formattedAssignedEntities: EntitiesOption[] = React.useMemo(() => {
    if (!role || !role.entity_names || !role.entity_ids) {
      return [];
    }

    return role.entity_names.map((name, index) => ({
      label: name,
      value: role.entity_ids![index],
    }));
  }, [role]);

  return (
    <Drawer
      className={styles.noMargin}
      onClose={onClose}
      open={open}
      title="Update Entities"
      width={isSMUp ? '600px' : '100%'}
    >
      <div slot="header">Update Entities</div>
      {isRolesLoading ? (
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
      ) : role ? (
        <UpdateEntitiesForm
          formattedAssignedEntities={formattedAssignedEntities}
          onClose={onClose}
          role={role}
        />
      ) : (
        <div slot="body">
          <NotificationBanner type="error">
            <p style={{ marginBottom: Spacing.S0 }}>
              This role is no longer assigned or could not be found.
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
