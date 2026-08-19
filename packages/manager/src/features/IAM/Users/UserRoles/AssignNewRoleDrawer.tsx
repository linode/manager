import { toast } from '@akamai/cds-components/notification-toast';
import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import {
  delegationQueries,
  iamQueries,
  useAccountRoles,
  useQueryClient,
  useUpdateDefaultDelegationAccessQuery,
  useUserRolesMutation,
} from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { usePermissions } from '../../hooks/usePermissions';
import { Box } from '../../Shared/Box/Box';
import {
  IAM_ROLES_PENDO_IDS,
  INTERNAL_ERROR_NO_CHANGES_SAVED,
  ROLES_LEARN_MORE_LINK,
} from '../../Shared/constants';
import { Drawer, DrawerInlineActions } from '../../Shared/Drawer';
import styles from '../../Shared/global.module.css';
import { Link } from '../../Shared/Link/Link';
import {
  getAllRoles,
  isAccountRole,
  isEntityRole,
  mergeAssignedRolesIntoExistingRoles,
} from '../../Shared/utilities';
import { AssignSingleRole } from '../UserRoles/AssignSingleRole';

import type { AssignNewRoleFormValues } from '../../Shared/utilities';
import type { IamUserRoles } from '@linode/api-v4';

interface Props {
  assignedRoles?: IamUserRoles;
  onClose: () => void;
  open: boolean;
}

export const AssignNewRoleDrawer = ({
  assignedRoles,
  onClose,
  open,
}: Props) => {
  const queryClient = useQueryClient();
  const { username } = useParams({ strict: false });
  const { data: accountRoles } = useAccountRoles();
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
  ]);

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

  const form = useForm<AssignNewRoleFormValues>({
    defaultValues: {
      roles: [
        {
          entities: null,
          role: null,
        },
      ],
    },
  });
  const isSMUp = useBreakpoint('up', 'sm');

  const { control, handleSubmit, reset, watch, formState, setError } = form;
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'roles',
  });

  const [areDetailsHidden, setAreDetailsHidden] = useState(false);

  // to watch changes to this value since we're conditionally rendering "Add another role"
  const roles = watch('roles');

  const allRoles = React.useMemo(() => {
    if (!accountRoles) {
      return [];
    }
    return getAllRoles(accountRoles)
      .filter((role) => {
        // exclude account and entities roles that are already assigned to the user
        if (isAccountRole(role)) {
          return !assignedRoles?.account_access.includes(role.value);
        }

        if (isEntityRole(role)) {
          return !assignedRoles?.entity_access.some((entity) =>
            entity.roles.includes(role.value)
          );
        }

        return true;
      })
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [accountRoles, assignedRoles]);

  const { mutateAsync: updateUserRoles, isPending: isUserRolesPending } =
    useUserRolesMutation(username);

  const { mutateAsync: updateDefaultRoles, isPending: isDefaultRolesPending } =
    useUpdateDefaultDelegationAccessQuery();

  const onSubmit = async (values: AssignNewRoleFormValues) => {
    try {
      if (isDefaultDelegationRolesForChildAccount) {
        const currentDefaultRoles = queryClient.getQueryData<IamUserRoles>(
          delegationQueries.defaultAccess.queryKey
        );
        const mergedDefaultRoles = mergeAssignedRolesIntoExistingRoles(
          values,
          structuredClone(currentDefaultRoles)
        );
        await updateDefaultRoles(mergedDefaultRoles);
      } else {
        if (!username) {
          return;
        }
        const queryKey = iamQueries.user(username ?? '')._ctx.roles.queryKey;
        const currentRoles = queryClient.getQueryData<IamUserRoles>(queryKey);

        const mergedRoles = mergeAssignedRolesIntoExistingRoles(
          values,
          structuredClone(currentRoles)
        );
        await updateUserRoles(mergedRoles);
      }
      toast.open({
        text: 'Roles added.',
        type: 'success',
      });
      handleClose();
    } catch (error) {
      setError(error.field ?? 'root', {
        message: INTERNAL_ERROR_NO_CHANGES_SAVED,
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (open) {
      reset({
        roles: [{ role: null, entities: null }],
      });
    }
  }, [open, reset]);

  const drawerTitle = isDefaultDelegationRolesForChildAccount
    ? 'Add New Default Roles'
    : 'Assign New Roles';

  return (
    <Drawer
      className={styles.noMargin}
      onClose={handleClose}
      open={open}
      title={drawerTitle}
      width={isSMUp ? '600px' : '100%'}
    >
      <div slot="header">{drawerTitle}</div>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} slot="body">
          {!permissionToCheck && (
            <NotificationBanner
              style={{ marginBottom: Spacing.S8 }}
              text="You do not have permission to assign roles."
              type="error"
            />
          )}
          {formState.errors.root?.message && (
            <NotificationBanner
              text={formState.errors.root?.message}
              type="error"
            />
          )}

          <p style={{ marginBottom: Spacing.S20, marginTop: Spacing.S0 }}>
            {isDefaultDelegationRolesForChildAccount
              ? 'Add a role you want to assign by default to new delegate users. Some roles require selecting entities they should apply to. Configure the first role and continue adding roles or save the assignment.'
              : 'Select a role you want to assign to a user. Some roles require selecting entities they should apply to. Configure the first role and continue adding roles or save the assignment.'}{' '}
            <Link to={ROLES_LEARN_MORE_LINK}>
              Learn more about roles and permissions
            </Link>
            .
          </p>
          <Box
            direction="row"
            style={{
              justifyContent: 'space-between',
              marginBottom: Spacing.S16,
            }}
          >
            <h3 style={{ font: Typography.Heading.S }}>Roles</h3>
            {roles.length > 0 && roles.some((field) => field.role) && (
              <Button
                onClick={() => setAreDetailsHidden(!areDetailsHidden)}
                variant="link"
              >
                {areDetailsHidden ? 'Show' : 'Hide'} details
              </Button>
            )}
          </Box>

          {!!accountRoles &&
            fields.map((field, index) => (
              <AssignSingleRole
                hideDetails={areDetailsHidden}
                index={index}
                key={field.id}
                onRemove={() => remove(index)}
                options={allRoles}
                permissions={accountRoles}
              />
            ))}

          {/* If all roles are filled, allow them to add another */}
          {roles.length > 0 && roles.every((field) => field.role?.value) && (
            <div
              style={{
                marginTop: Spacing.S12,
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <Button onClick={() => append({ role: null })} variant="link">
                Add another role
              </Button>
            </div>
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
              data-pendo-id={
                isDefaultDelegationRolesForChildAccount
                  ? IAM_ROLES_PENDO_IDS.addNewDefaultRolesDrawer
                  : undefined
              }
              data-testid="submit"
              disabled={!permissionToCheck}
              processing={
                isUserRolesPending ||
                isDefaultRolesPending ||
                formState.isSubmitting
              }
              type="submit"
              variant="primary"
            >
              Save
            </Button>
          </DrawerInlineActions>
        </form>
      </FormProvider>
    </Drawer>
  );
};
