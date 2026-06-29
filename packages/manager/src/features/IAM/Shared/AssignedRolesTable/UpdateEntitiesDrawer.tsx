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

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { Drawer, DrawerInlineActions } from '../../Shared/Drawer';
import styles from '../../Shared/global.module.css';
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
}

export const UpdateEntitiesDrawer = ({ onClose, open, role }: Props) => {
  const { username } = useParams({ strict: false });
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();
  const { data: defaultRolesData } = useGetDefaultDelegationAccessQuery({
    enabled: isDefaultDelegationRolesForChildAccount,
  });
  const isSMUp = useBreakpoint('up', 'sm');

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
    <Drawer
      className={styles.noMargin}
      onClose={handleClose}
      open={open}
      title="Update Entities"
      width={isSMUp ? '600px' : '100%'}
    >
      <div slot="header">Update Entities</div>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} slot="body">
          {errors.root?.message && (
            <NotificationBanner text={errors.root?.message} type="error" />
          )}
          <p style={{ marginBottom: Spacing.S16 }}>
            Add or remove entities attached to the role.
          </p>

          {role && (
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
              processing={isSubmitting}
              type="submit"
              variant="primary"
            >
              Update
            </Button>
          </DrawerInlineActions>
        </form>
      </FormProvider>
    </Drawer>
  );
};
