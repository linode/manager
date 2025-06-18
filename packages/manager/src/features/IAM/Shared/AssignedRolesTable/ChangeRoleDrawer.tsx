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
import {
  useAccountRoles,
  useUserRoles,
  useUserRolesMutation,
} from 'src/queries/iam/iam';

import { AssignedPermissionsPanel } from '../AssignedPermissionsPanel/AssignedPermissionsPanel';
import { changeUserRole, getAllRoles, getRoleByName } from '../utilities';

import type { DrawerModes, EntitiesOption, ExtendedRoleView } from '../types';
import type { RolesType } from '../utilities';

interface Props {
  mode: DrawerModes;
  onClose: () => void;
  open: boolean;
  role: ExtendedRoleView | undefined;
}

export const ChangeRoleDrawer = ({ mode, onClose, open, role }: Props) => {
  const theme = useTheme();
  const { username } = useParams<{ username: string }>();

  const { data: accountRoles, isLoading: accountPermissionsLoading } =
    useAccountRoles();

  const { data: assignedRoles } = useUserRoles(username ?? '');

  const { mutateAsync: updateUserRoles } = useUserRolesMutation(username);

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

      await updateUserRoles(updatedUserRoles);

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
          Select a role you want{' '}
          {role?.access === 'account_access'
            ? 'to assign.'
            : 'the entities to be attached to.'}
          <Link to=""> Learn more about roles and permissions.</Link>
        </Typography>

        <Typography sx={{ marginBottom: theme.tokens.spacing.S8 }}>
          Change from role <strong>{role?.name}</strong> to:
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
            sx={{ marginBottom: theme.tokens.spacing.S16 }}
            value={formattedAssignedEntities ?? []}
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
        />
      </form>
    </Drawer>
  );
};
