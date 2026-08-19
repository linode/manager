import { toast } from '@akamai/cds-components/notification-toast';
import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { Font, Spacing } from '@akamai/cds-tokens';
import {
  useGetDefaultDelegationAccessQuery,
  useUpdateDefaultDelegationAccessQuery,
  useUserRoles,
  useUserRolesMutation,
} from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { usePermissions } from '../../hooks/usePermissions';
import { AssignedPermissionsPanel } from '../AssignedPermissionsPanel/AssignedPermissionsPanel';
import { INTERNAL_ERROR_NO_CHANGES_SAVED } from '../constants';
import { DrawerInlineActions } from '../Drawer/DrawerInlineActions';
import { toEntityAccess, type UpdateEntitiesFormValues } from '../utilities';

import type { EntitiesOption, ExtendedRoleView } from '../types';
import type { EntityRoleType } from '@linode/api-v4';

interface Props {
  formattedAssignedEntities: EntitiesOption[];
  onClose: () => void;
  role: ExtendedRoleView;
}

export const UpdateEntitiesForm = ({
  onClose,
  role,
  formattedAssignedEntities,
}: Props) => {
  const { username } = useParams({ strict: false });
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const { data: defaultRolesData } = useGetDefaultDelegationAccessQuery({
    enabled: isDefaultDelegationRolesForChildAccount,
  });

  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
  ]);

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

  const { data: userRolesData } = useUserRoles(
    username,
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

  const form = useForm<UpdateEntitiesFormValues>({
    values: {
      entities: formattedAssignedEntities,
    },
  });

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = form;

  const onSubmit = async (values: UpdateEntitiesFormValues) => {
    const entityIds = values.entities.map(
      (entity: EntitiesOption) => entity.value
    );

    const areIdsEqual =
      role.entity_ids &&
      entityIds.length === role.entity_ids.length &&
      role.entity_ids.every((id, index) => id === entityIds[index]);

    if (areIdsEqual) {
      handleClose();
      return;
    }

    try {
      const roleName: EntityRoleType = role.name as EntityRoleType;

      const entityAccess = toEntityAccess(
        assignedRoles!.entity_access,
        entityIds,
        roleName,
        role.entity_type
      );

      await mutationFn({
        ...assignedRoles!,
        entity_access: entityAccess,
      });

      toast.open({
        text: 'List of entities updated.',
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
    reset();
    onClose();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} slot="body">
        {!permissionToCheck && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S8 }}
            text="You do not have permission to update this role."
            type="error"
          />
        )}
        {errors.root?.message && (
          <NotificationBanner text={errors.root?.message} type="error" />
        )}
        <p style={{ marginBottom: Spacing.S16 }}>
          Add or remove entities attached to the role.
        </p>

        <p
          style={{
            fontSize: Font.FontSize.S,
            // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
            fontWeight: Font.FontWeight.Bold,
            marginBottom: Spacing.S8,
          }}
        >
          {role.name}
        </p>

        <Controller
          control={control}
          name="entities"
          render={({ field, fieldState }) => (
            <AssignedPermissionsPanel
              errorText={fieldState.error?.message}
              key={role.name}
              onChange={field.onChange}
              role={role}
              style={{ marginBottom: Spacing.S16 }}
              value={field.value}
            />
          )}
          rules={{ required: 'Select entities.' }}
        />
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
            disabled={!permissionToCheck}
            processing={isSubmitting}
            type="submit"
            variant="primary"
          >
            Update
          </Button>
        </DrawerInlineActions>
      </form>
    </FormProvider>
  );
};
