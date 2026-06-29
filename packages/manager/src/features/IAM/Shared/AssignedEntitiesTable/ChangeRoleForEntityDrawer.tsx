import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  NotificationBanner,
  Select,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import {
  useAccountRoles,
  useGetDefaultDelegationAccessQuery,
  useUpdateDefaultDelegationAccessQuery,
  useUserRoles,
  useUserRolesMutation,
} from '@linode/queries';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { Drawer, DrawerInlineActions } from '../../Shared/Drawer';
import styles from '../../Shared/global.module.css';
import { AssignedPermissionsPanel } from '../AssignedPermissionsPanel/AssignedPermissionsPanel';
import {
  INTERNAL_ERROR_NO_CHANGES_SAVED,
  ROLES_LEARN_MORE_LINK,
} from '../constants';
import { Link } from '../Link/Link';
import {
  changeRoleForEntity,
  getAllRoles,
  getRoleByName,
  isAccountRole,
  isEntityRole,
} from '../utilities';

import type { DrawerModes, EntitiesRole } from '../types';
import type { ExtendedEntityRole } from '../utilities';

interface Props {
  mode: DrawerModes;
  onClose: () => void;
  open: boolean;
  role: EntitiesRole | undefined;
  username?: string;
}

export const ChangeRoleForEntityDrawer = ({
  mode,
  onClose,
  open,
  role,
  username,
}: Props) => {
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const { data: accountRoles, isLoading: accountPermissionsLoading } =
    useAccountRoles();

  const { data: assignedUserRoles } = useUserRoles(
    username ?? '',
    !isDefaultDelegationRolesForChildAccount
  );

  const { data: delegateDefaultRoles } = useGetDefaultDelegationAccessQuery({
    enabled: isDefaultDelegationRolesForChildAccount,
  });

  const assignedRoles = isDefaultDelegationRolesForChildAccount
    ? delegateDefaultRoles
    : assignedUserRoles;

  const { mutateAsync: updateUserRoles } = useUserRolesMutation(username ?? '');

  const { mutateAsync: updateDefaultDelegationRoles } =
    useUpdateDefaultDelegationAccessQuery();

  // filtered roles by entity_type and access
  const allRoles = React.useMemo(() => {
    if (!accountRoles) {
      return [];
    }

    return getAllRoles(accountRoles).filter((el) => {
      const matchesRoleContext =
        el.entity_type === role?.entity_type &&
        el.access === role?.access &&
        el.value !== role?.role_name;

      if (isAccountRole(el)) {
        return matchesRoleContext;
      }

      if (isEntityRole(el)) {
        return matchesRoleContext;
      }
      return true;
    });
  }, [accountRoles, role]);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
    watch,
  } = useForm<{ roleName: ExtendedEntityRole | null }>({
    defaultValues: {
      roleName: null,
    },
    mode: 'onBlur',
  });

  // Watch the selected role
  const selectedOptions = watch('roleName');

  // Get the selected role based on the `selectedOptions`
  const selectedRole = React.useMemo(() => {
    if (!selectedOptions || !accountRoles) {
      return null;
    }

    return getRoleByName(accountRoles, selectedOptions.value);
  }, [selectedOptions, accountRoles]);

  const mutationFn = isDefaultDelegationRolesForChildAccount
    ? updateDefaultDelegationRoles
    : updateUserRoles;

  const onSubmit = async (data: { roleName: ExtendedEntityRole }) => {
    if (role?.role_name === data.roleName.label) {
      handleClose();
      return;
    }
    try {
      const initialRole = role!.role_name;
      const newRole = data.roleName.label;
      const entityId = role!.entity_id;
      const entityType = role!.entity_type;

      const updatedEntityRoles = changeRoleForEntity(
        assignedRoles!.entity_access,
        entityId,
        entityType,
        initialRole,
        newRole
      );

      await mutationFn({
        ...assignedRoles!,
        entity_access: updatedEntityRoles,
      });

      toast.open({
        text: 'Role changed',
        type: 'success',
      });

      handleClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', {
          message: INTERNAL_ERROR_NO_CHANGES_SAVED,
        });
      }
    }
  };

  const handleClose = () => {
    reset({ roleName: null });
    onClose();
  };

  const drawerTitle = 'Change Role';

  return (
    <Drawer
      aria-label="Change Role"
      className={styles.noMargin}
      onClose={handleClose}
      open={open}
      title={drawerTitle}
    >
      <div slot="header">{drawerTitle}</div>
      <form onSubmit={handleSubmit(onSubmit)} slot="body">
        {errors.root?.message && (
          <NotificationBanner text={errors.root?.message} type="error" />
        )}
        <p style={{ marginBottom: Spacing.S20 }}>
          Select a role you want the entity to be attached to.{' '}
          <Link to={ROLES_LEARN_MORE_LINK}>
            Learn more about roles and permissions
          </Link>
          .
        </p>

        <p style={{ marginBottom: Spacing.S8 }}>
          Change the role for <strong>{role?.entity_name}</strong> from{' '}
          <strong>{role?.role_name}</strong> to:
        </p>

        <Controller
          control={control}
          name="roleName"
          render={({ field, fieldState }) => (
            <Select
              autocomplete
              clearable
              error={Boolean(fieldState.error?.message)}
              errorMessage={fieldState.error?.message ?? ''}
              isLoading={accountPermissionsLoading}
              items={allRoles}
              noItemsLabel="You have no options to choose from"
              onChange={(event) => {
                const newValue =
                  event.detail as unknown as ExtendedEntityRole | null;
                field.onChange(newValue);
              }}
              placeholder="Select a Role"
              selected={field.value || null}
              style={{ marginBottom: Spacing.S16 }}
              valueFn={(item) => (item as ExtendedEntityRole).label}
            />
          )}
          rules={{ required: 'Role is required.' }}
        />

        {selectedRole && (
          <AssignedPermissionsPanel
            key={selectedRole.name}
            mode={mode}
            role={selectedRole}
            value={[]}
          />
        )}
        <DrawerInlineActions>
          <Button
            data-testid="cancel"
            onClick={handleClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            data-testid="submit"
            processing={isSubmitting}
            type="submit"
            variant="primary"
          >
            Save
          </Button>
        </DrawerInlineActions>
      </form>
    </Drawer>
  );
};
