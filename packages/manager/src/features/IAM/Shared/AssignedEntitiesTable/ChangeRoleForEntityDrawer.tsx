import {
  useAccountRoles,
  useUpdateDefaultDelegationAccessQuery,
  useUserRoles,
  useUserRolesMutation,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  Notice,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { AssignedPermissionsPanel } from '../AssignedPermissionsPanel/AssignedPermissionsPanel';
import {
  INTERNAL_ERROR_NO_CHANGES_SAVED,
  ROLES_LEARN_MORE_LINK,
} from '../constants';
import { changeRoleForEntity, getAllRoles, getRoleByName } from '../utilities';

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
  const theme = useTheme();

  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const { data: accountRoles, isLoading: accountPermissionsLoading } =
    useAccountRoles();

  const { data: assignedRoles } = useUserRoles(username ?? '');

  const { mutateAsync: updateUserRoles } = useUserRolesMutation(username ?? '');

  const { mutateAsync: updateDefaultDelegationRoles } =
    useUpdateDefaultDelegationAccessQuery();

  // filtered roles by entity_type and access
  const allRoles = React.useMemo(() => {
    if (!accountRoles) {
      return [];
    }

    return getAllRoles(accountRoles).filter(
      (el) => el.entity_type === role?.entity_type && el.access === role?.access
    );
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

  return (
    <Drawer onClose={handleClose} open={open} title="Change Role">
      {errors.root?.message && (
        <Notice text={errors.root?.message} variant="error" />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography sx={{ marginBottom: 2.5 }}>
          Select a role you want the entity to be attached to.{' '}
          <Link to={ROLES_LEARN_MORE_LINK}>
            Learn more about roles and permissions
          </Link>
          .
        </Typography>

        <Typography sx={{ marginBottom: theme.tokens.spacing.S8 }}>
          Change the role for <strong>{role?.entity_name}</strong> from{' '}
          <strong>{role?.role_name}</strong> to:
        </Typography>

        <Controller
          control={control}
          name="roleName"
          render={({ field, fieldState }) => (
            <Autocomplete
              errorText={fieldState.error?.message}
              label="Assign New Roles"
              loading={accountPermissionsLoading}
              onChange={(_, value) => field.onChange(value)}
              options={allRoles}
              placeholder="Select a Role"
              sx={{ marginBottom: theme.spacingFunction(16) }}
              textFieldProps={{ hideLabel: true, noMarginTop: true }}
              value={field.value || null}
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

        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Save Changes',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      </form>
    </Drawer>
  );
};
