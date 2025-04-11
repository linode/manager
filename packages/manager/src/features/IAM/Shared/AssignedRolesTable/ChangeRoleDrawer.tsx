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
import { useParams } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import {
  useAccountPermissions,
  useAccountUserPermissions,
  useAccountUserPermissionsMutation,
} from 'src/queries/iam/iam';

import { AssignedPermissionsPanel } from '../AssignedPermissionsPanel/AssignedPermissionsPanel';
import { getAllRoles, getRoleByName, updateUserRoles } from '../utilities';

import type { EntitiesOption, ExtendedRoleMap, RolesType } from '../utilities';

interface Props {
  onClose: () => void;
  open: boolean;
  role: ExtendedRoleMap | undefined;
}

export const ChangeRoleDrawer = ({ onClose, open, role }: Props) => {
  const theme = useTheme();
  const { username } = useParams<{ username: string }>();

  const {
    data: accountPermissions,
    isLoading: accountPermissionsLoading,
  } = useAccountPermissions();

  const { data: assignedRoles } = useAccountUserPermissions(username ?? '');

  const {
    mutateAsync: updateUserPermissions,
  } = useAccountUserPermissionsMutation(username);

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
  } = useForm<{ roleName: RolesType | null }>({
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

  const onSubmit = async (data: { roleName: RolesType }) => {
    if (role?.name === data.roleName.label) {
      handleClose();
      return;
    }
    try {
      const initialRole = role?.name;
      const newRole = data.roleName.label;
      const access = data.roleName.access;

      const updatedUserRoles = updateUserRoles({
        access,
        assignedRoles,
        initialRole,
        newRole,
      });

      await updateUserPermissions(updatedUserRoles);

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
    <Drawer
      NotFoundComponent={NotFound}
      onClose={handleClose}
      open={open}
      title="Change Role"
    >
      {errors.root?.message && (
        <Notice text={errors.root?.message} variant="error" />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography sx={{ marginBottom: 2.5 }}>
          Select a role you want to assign.
          <Link to=""> Learn more about roles and permissions.</Link>
        </Typography>

        <Typography sx={{ marginBottom: theme.tokens.spacing.S12 }}>
          Change from role <strong>{role?.name}</strong> to:
        </Typography>

        <Controller
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
          control={control}
          name="roleName"
          rules={{ required: 'Role is required.' }}
        />

        {selectedRole && (
          <AssignedPermissionsPanel
            assignedEntities={formattedAssignedEntities ?? []}
            key={selectedRole.name}
            role={selectedRole}
          />
        )}

        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Save Change',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
          sx={{ marginTop: 2 }}
        />
      </form>
    </Drawer>
  );
};
