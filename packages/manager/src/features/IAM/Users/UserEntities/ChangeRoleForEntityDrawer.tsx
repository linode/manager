import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  Notice,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { useParams } from '@tanstack/react-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import {
  useAccountPermissions,
  useAccountUserPermissions,
  useAccountUserPermissionsMutation,
} from 'src/queries/iam/iam';

import { AssignedPermissionsPanel } from '../../Shared/AssignedPermissionsPanel/AssignedPermissionsPanel';
import {
  changeRoleForEntity,
  getAllRoles,
  getRoleByName,
} from '../../Shared/utilities';

import type { DrawerModes, EntitiesRole } from '../../Shared/types';
import type { ExtendedEntityRole } from '../../Shared/utilities';

interface Props {
  mode: DrawerModes;
  onClose: () => void;
  open: boolean;
  role: EntitiesRole | undefined;
}

export const ChangeRoleForEntityDrawer = ({
  mode,
  onClose,
  open,
  role,
}: Props) => {
  const theme = useTheme();
  const { username } = useParams({
    from: '/iam/users/$username/entities',
  });

  const { data: accountPermissions, isLoading: accountPermissionsLoading } =
    useAccountPermissions();

  const { data: assignedRoles } = useAccountUserPermissions(username ?? '');

  const { mutateAsync: updateUserPermissions } =
    useAccountUserPermissionsMutation(username);

  // filtered roles by entity_type and access
  const allRoles = React.useMemo(() => {
    if (!accountPermissions) {
      return [];
    }

    return getAllRoles(accountPermissions).filter(
      (el) => el.entity_type === role?.entity_type && el.access === role?.access
    );
  }, [accountPermissions, role]);

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
    if (!selectedOptions || !accountPermissions) {
      return null;
    }

    return getRoleByName(accountPermissions, selectedOptions.value);
  }, [selectedOptions, accountPermissions]);

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

      await updateUserPermissions({
        ...assignedRoles!,
        entity_access: updatedEntityRoles,
      });

      handleClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const handleClose = () => {
    reset({ roleName: null });
    onClose();
  };

  // TODO - add a link 'Learn more" - UIE-8534
  return (
    <Drawer onClose={handleClose} open={open} title="Change Role">
      {errors.root?.message && (
        <Notice text={errors.root?.message} variant="error" />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography sx={{ marginBottom: 2.5 }}>
          Select a role you want the entity to be attached to.
          <Link to=""> Learn more about roles and permissions.</Link>
        </Typography>

        <Typography sx={{ marginBottom: theme.tokens.spacing.S12 }}>
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
