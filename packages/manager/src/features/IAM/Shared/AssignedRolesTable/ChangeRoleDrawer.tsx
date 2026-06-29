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
import { useParams } from '@tanstack/react-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import styles from 'src/features/IAM/Shared/global.module.css';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { Drawer, DrawerInlineActions } from '../../Shared/Drawer';
import { AssignedPermissionsPanel } from '../AssignedPermissionsPanel/AssignedPermissionsPanel';
import { ROLES_LEARN_MORE_LINK } from '../constants';
import { Link } from '../Link/Link';
import {
  changeUserRole,
  getAllRoles,
  getErrorMessage,
  getRoleByName,
  isAccountRole,
  isEntityRole,
} from '../utilities';

import type { DrawerModes, EntitiesOption, ExtendedRoleView } from '../types';
import type { RolesType } from '../utilities';

interface Props {
  mode: DrawerModes;
  onClose: () => void;
  open: boolean;
  role: ExtendedRoleView | undefined;
}

export const ChangeRoleDrawer = ({ mode, onClose, open, role }: Props) => {
  const { username } = useParams({ strict: false });
  const { data: accountRoles, isLoading: accountPermissionsLoading } =
    useAccountRoles();

  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();
  const { data: defaultRolesData } = useGetDefaultDelegationAccessQuery({
    enabled: isDefaultDelegationRolesForChildAccount,
  });
  const isSMUp = useBreakpoint('up', 'sm');

  const { data: userRolesData } = useUserRoles(
    username ?? '',
    !isDefaultDelegationRolesForChildAccount
  );

  const assignedRoles = isDefaultDelegationRolesForChildAccount
    ? defaultRolesData
    : userRolesData;
  const { mutateAsync: updateUserRoles } = useUserRolesMutation(username);

  const { mutateAsync: updateDefaultRoles } =
    useUpdateDefaultDelegationAccessQuery();

  const mutationFn = isDefaultDelegationRolesForChildAccount
    ? updateDefaultRoles
    : updateUserRoles;
  const formattedAssignedEntities: EntitiesOption[] = React.useMemo(() => {
    if (!role || !role.entity_names || !role.entity_ids) {
      return [];
    }

    return role.entity_names.map((name, index) => ({
      label: name,
      value: role.entity_ids![index],
    }));
  }, [role]);

  // filtered roles by entity_type and access
  const allRoles = React.useMemo(() => {
    if (!accountRoles) {
      return [];
    }
    return getAllRoles(accountRoles).filter((el) => {
      const matchesRoleContext =
        el.entity_type === role?.entity_type &&
        el.access === role?.access &&
        el.value !== role?.name;
      // Exclude account roles already assigned to the user
      if (isAccountRole(el)) {
        return matchesRoleContext;
      }
      // Exclude entity roles already assigned to the user
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
  } = useForm<{ roleName: null | RolesType }>({
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

  const onSubmit = async (data: { roleName: RolesType }) => {
    if (role?.name === data.roleName.label) {
      handleClose();
      return;
    }
    try {
      const initialRole = role?.name;
      const newRole = data.roleName.label;
      const access = data.roleName.access;

      const updatedUserRoles = changeUserRole({
        access,
        assignedRoles,
        initialRole,
        newRole,
      });

      await mutationFn(updatedUserRoles);

      toast.open({
        text: 'Role changed.',
        type: 'success',
      });

      handleClose();
    } catch (errors) {
      setError('root', {
        message: getErrorMessage(errors),
      });
    }
  };

  const handleClose = () => {
    reset({ roleName: null });
    onClose();
  };

  return (
    <Drawer
      className={styles.noMargin}
      onClose={handleClose}
      open={open}
      title="Change Role"
      width={isSMUp ? '600px' : '100%'}
    >
      <div slot="header">Change Role</div>
      <form
        id="change-role-drawer-form"
        onSubmit={handleSubmit(onSubmit)}
        slot="body"
      >
        {errors.root?.message && (
          <NotificationBanner text={errors.root?.message} type="error" />
        )}
        <p style={{ marginBottom: Spacing.S20 }}>
          Select a role you want{' '}
          {role?.access === 'account_access'
            ? isDefaultDelegationRolesForChildAccount
              ? 'to assign by default to new delegate users.'
              : 'to assign.'
            : 'the entities to be attached to.'}{' '}
          <Link to={ROLES_LEARN_MORE_LINK}>
            Learn more about roles and permissions
          </Link>
          .
        </p>

        <p style={{ marginBottom: Spacing.S8 }}>
          Change the role from <strong>{role?.name}</strong> to:
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
                const newValue = event.detail as unknown as null | RolesType;
                field.onChange(newValue);
              }}
              placeholder="Select a Role"
              selected={field.value || null}
              style={{ marginBottom: Spacing.S16 }}
              valueFn={(item) => (item as RolesType).label}
            />
          )}
          rules={{ required: 'Role is required.' }}
        />

        {selectedRole && (
          <AssignedPermissionsPanel
            key={selectedRole.name}
            mode={mode}
            role={selectedRole}
            style={{ marginBottom: Spacing.S16 }}
            value={formattedAssignedEntities ?? []}
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
