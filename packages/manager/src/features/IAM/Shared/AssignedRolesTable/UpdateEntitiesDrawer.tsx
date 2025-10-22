import { useUserRoles, useUserRolesMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Notice, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { AssignedPermissionsPanel } from '../AssignedPermissionsPanel/AssignedPermissionsPanel';
import { INTERNAL_ERROR_NO_CHANGES_SAVED } from '../constants';
import { toEntityAccess } from '../utilities';

import type { EntitiesOption, ExtendedRoleView } from '../types';
import type { UpdateEntitiesFormValues } from '../utilities';
import type { EntityRoleType } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  role: ExtendedRoleView | undefined;
  username?: string;
}

export const UpdateEntitiesDrawer = ({
  onClose,
  open,
  role,
  username,
}: Props) => {
  const theme = useTheme();

  const { data: assignedRoles } = useUserRoles(username || '');

  const { mutateAsync: updateUserRoles } = useUserRolesMutation(username || '');

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

    const areIdsEqual =
      role?.entity_ids &&
      entityIds.length === role.entity_ids.length &&
      role.entity_ids.every((id, index) => id === entityIds[index]);

    if (areIdsEqual) {
      handleClose();
      return;
    }

    try {
      const roleName: EntityRoleType = role!.name as EntityRoleType;

      const entityAccess = toEntityAccess(
        assignedRoles!.entity_access,
        entityIds,
        roleName,
        role!.entity_type
      );

      await updateUserRoles({
        ...assignedRoles!,
        entity_access: entityAccess,
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
    reset();
    onClose();
  };

  return (
    <Drawer onClose={handleClose} open={open} title="Update List of Entities">
      {errors.root?.message && (
        <Notice text={errors.root?.message} variant="error" />
      )}
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography sx={{ marginBottom: theme.tokens.spacing.S16 }}>
            Add or remove entities attached to the role.
          </Typography>

          {role && (
            <Typography
              sx={{
                font: theme.tokens.alias.Typography.Heading.S,
                marginBottom: theme.tokens.spacing.S8,
              }}
            >
              {role.name}
            </Typography>
          )}

          <Controller
            control={control}
            name="entities"
            render={({ field, fieldState }) => (
              <AssignedPermissionsPanel
                errorText={fieldState.error?.message}
                key={role?.name}
                onChange={field.onChange}
                role={role!}
                sx={{ marginBottom: theme.tokens.spacing.S16 }}
                value={field.value}
              />
            )}
            rules={{ required: 'Select entities.' }}
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
