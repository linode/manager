import { ActionsPanel, Autocomplete, Notice, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
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
    if (!role || !role.resource_names || !role.resource_ids) {
      return [];
    }

    return role.resource_names.map((name, index) => ({
      label: name,
      value: role.resource_ids![index],
    }));
  }, [role]);

  // filtered roles by resource_type and access
  const allRoles = React.useMemo(() => {
    if (!accountPermissions) {
      return [];
    }

    return getAllRoles(accountPermissions).filter(
      (el) =>
        el.resource_type === role?.resource_type && el.access === role?.access
    );
  }, [accountPermissions, role]);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
    watch,
  } = useForm<{ roleName: RolesType }>({
    defaultValues: {
      roleName: undefined,
    },
    mode: 'onBlur',
  });

  // Effect to update form values when role changes
  React.useEffect(() => {
    if (role) {
      reset({
        roleName: {
          access: role.access,
          label: role.name,
          resource_type: role.resource_type,
          value: role.name,
        },
      });
    }
  }, [role, reset]);

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

      const updatedUserRoles = updateUserRoles(
        assignedRoles!,
        initialRole!,
        newRole,
        access
      );

      await updateUserPermissions(updatedUserRoles);

      handleClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // TODO - add a link 'Learn more" - UIE-8534
  return (
    <Drawer onClose={handleClose} open={open} title="Change Role">
      {errors.root?.message && (
        <Notice text={errors.root?.message} variant="error" />
      )}
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}
      >
        <Typography sx={{ marginBottom: 2.5 }}>
          Select a role you want to assign.
          <Link to=""> Learn more about roles and permissions.</Link>
        </Typography>

        <Typography sx={{ marginBottom: 2.5 }}>
          Change from role{' '}
          <span style={{ font: theme.font.bold }}>{role?.name}</span> to:
        </Typography>

        <Controller
          render={({ field }) => (
            <Autocomplete
              label="Assign New Roles"
              loading={accountPermissionsLoading}
              onChange={(_, value) => field.onChange(value)}
              options={allRoles}
              placeholder="Select a Role"
              textFieldProps={{ hideLabel: true, noMarginTop: true }}
              value={field.value}
            />
          )}
          control={control}
          name="roleName"
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
