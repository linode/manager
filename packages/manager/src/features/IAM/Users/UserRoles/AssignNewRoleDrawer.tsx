import {
  Button,
  Drawer,
  NotificationBanner,
} from '@akamai/cds-components/react';
import {
  delegationQueries,
  iamQueries,
  useAccountRoles,
  useQueryClient,
  useUpdateDefaultDelegationAccessQuery,
  useUserRolesMutation,
} from '@linode/queries';
import { useTheme } from '@mui/material';
import { useParams } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { AssignSingleRole } from 'src/features/IAM/Users/UserRoles/AssignSingleRole';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import {
  IAM_ROLES_PENDO_IDS,
  INTERNAL_ERROR_NO_CHANGES_SAVED,
  ROLES_LEARN_MORE_LINK,
} from '../../Shared/constants';
import {
  getAllRoles,
  isAccountRole,
  isEntityRole,
  mergeAssignedRolesIntoExistingRoles,
} from '../../Shared/utilities';

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
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { username } = useParams({ strict: false });
  const { data: accountRoles } = useAccountRoles();
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();
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
    return getAllRoles(accountRoles).filter((role) => {
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
    });
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
      enqueueSnackbar(`Roles added.`, { variant: 'success' });
      handleClose();
    } catch {
      setError('root', {
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

  return (
    <Drawer onClose={handleClose} open={open}>
      <span slot="header">
        {isDefaultDelegationRolesForChildAccount
          ? 'Add New Default Roles'
          : 'Assign New Roles'}
      </span>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {formState.errors.root?.message && (
            <NotificationBanner
              style={{ marginBottom: theme.tokens.spacing.S16 }}
              text={formState.errors.root?.message}
              type="error"
            />
          )}
          <p style={{ marginBottom: theme.tokens.spacing.S20, marginTop: 0 }}>
            {isDefaultDelegationRolesForChildAccount
              ? 'Add a role you want to assign by default to new delegate users. Some roles require selecting entities they should apply to. Configure the first role and continue adding roles or save the assignment.'
              : 'Select a role you want to assign to a user. Some roles require selecting entities they should apply to. Configure the first role and continue adding roles or save the assignment.'}{' '}
            <a href={ROLES_LEARN_MORE_LINK}>
              Learn more about roles and permissions
            </a>
            .
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: theme.tokens.spacing.S16,
            }}
          >
            <h3 style={{ margin: 0, fontSize: theme.tokens.font.FontSize.S }}>
              Roles
            </h3>
            {roles.length > 0 && roles.some((field) => field.role) && (
              <Button
                onClick={() => setAreDetailsHidden(!areDetailsHidden)}
                style={{ marginTop: 0 }}
                variant="link"
              >
                {areDetailsHidden ? 'Show' : 'Hide'} details
              </Button>
            )}
          </div>

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
            <Button
              onClick={() => append({ role: null })}
              style={{ marginTop: theme.tokens.spacing.S12 }}
              variant="link"
            >
              Add another role
            </Button>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: theme.tokens.spacing.S8,
              marginTop: theme.tokens.spacing.S16,
              alignItems: 'center',
            }}
          >
            {/* <Button onClick={handleClose} variant="secondary">
              Cancel
            </Button> */}
            <Button
              onClick={handleClose}
              style={{ marginRight: theme.tokens.spacing.S8 }}
              variant="link"
            >
              Cancel
            </Button>
            <Button
              data-pendo-id={
                isDefaultDelegationRolesForChildAccount
                  ? IAM_ROLES_PENDO_IDS.addNewDefaultRolesDrawer
                  : undefined
              }
              processing={
                isUserRolesPending ||
                isDefaultRolesPending ||
                formState.isSubmitting
              }
              type="submit"
              variant="primary"
            >
              {isDefaultDelegationRolesForChildAccount ? 'Add' : 'Assign'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Drawer>
  );
};
