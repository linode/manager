import { ActionsPanel, Drawer, Notice, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { NotFound } from 'src/components/NotFound';
import {
  useAccountUserPermissions,
  useAccountUserPermissionsMutation,
} from 'src/queries/iam/iam';

import { AssignedPermissionsPanel } from '../AssignedPermissionsPanel/AssignedPermissionsPanel';
import { updateUserEntities } from '../utilities';

import type {
  DrawerModes,
  EntitiesOption,
  ExtendedRoleMap,
  UpdateEntitiesFormValues,
} from '../utilities';
import type { RoleType } from '@linode/api-v4';

interface Props {
  mode: DrawerModes;
  onClose: () => void;
  open: boolean;
  role: ExtendedRoleMap | undefined;
}

export const UpdateEntitiesDrawer = ({ mode, onClose, open, role }: Props) => {
  const theme = useTheme();

  const { username } = useParams<{ username: string }>();

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

  const form = useForm<UpdateEntitiesFormValues>({
    defaultValues: {
      entities: [],
    },
  });

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = form;

  // Update the form state when formattedAssignedEntities changes
  React.useEffect(() => {
    if (formattedAssignedEntities.length > 0) {
      reset({ entities: formattedAssignedEntities });
    }
  }, [formattedAssignedEntities, reset]);

  const onSubmit = async (values: UpdateEntitiesFormValues) => {
    const entityIds = values.entities.map(
      (entity: EntitiesOption) => entity.value
    );

    // Check if `role.entity_ids` is the same as `entityIds`
    const areIdsEqual =
      role?.entity_ids &&
      entityIds.length === role.entity_ids.length &&
      role.entity_ids.every((id, index) => id === entityIds[index]);

    if (areIdsEqual) {
      handleClose();
      return;
    }

    try {
      const roleName: RoleType = role!.name as RoleType;

      const updatedUserEntities = updateUserEntities({
        assignedRoles,
        entityIds,
        roleName,
        roleType: role!.entity_type,
      });

      await updateUserPermissions(updatedUserEntities);

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

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={handleClose}
      open={open}
      title="Update List of Entities"
    >
      {errors.root?.message && (
        <Notice text={errors.root?.message} variant="error" />
      )}
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography sx={{ marginBottom: theme.tokens.spacing.S32 }}>
            Add or remove entities the role should apply to.
          </Typography>

          <Controller
            render={({ field, fieldState }) => (
              <AssignedPermissionsPanel
                errorText={fieldState.error?.message}
                key={role?.name}
                mode={mode}
                onChange={field.onChange}
                role={role!}
                sx={{ marginBottom: theme.tokens.spacing.S16 }}
                value={field.value}
              />
            )}
            control={control}
            name="entities"
            rules={{ required: 'Entities are required.' }}
          />

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Update',
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
      </FormProvider>
    </Drawer>
  );
};
