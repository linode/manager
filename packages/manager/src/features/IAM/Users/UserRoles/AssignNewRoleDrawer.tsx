import {
  iamQueries,
  useAccountRoles,
  useUserRolesMutation,
} from '@linode/queries';
import {
  ActionsPanel,
  Drawer,
  LinkButton,
  Notice,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { AssignSingleRole } from 'src/features/IAM/Users/UserRoles/AssignSingleRole';

import {
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
  const { username } = useParams({
    from: '/iam/users/$username',
  });
  const queryClient = useQueryClient();

  const { data: accountRoles } = useAccountRoles();

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
  }, [accountRoles, assignedRoles, roles]);

  const { mutateAsync: updateUserRoles, isPending } =
    useUserRolesMutation(username);

  const onSubmit = async (values: AssignNewRoleFormValues) => {
    try {
      const queryKey = iamQueries.user(username)._ctx.roles.queryKey;
      const currentRoles = queryClient.getQueryData<IamUserRoles>(queryKey);

      const mergedRoles = mergeAssignedRolesIntoExistingRoles(
        values,
        structuredClone(currentRoles)
      );

      await updateUserRoles(mergedRoles);

      enqueueSnackbar(`Roles added.`, { variant: 'success' });
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

  return (
    <Drawer onClose={handleClose} open={open} title="Assign New Roles">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {formState.errors.root?.message && (
            <Notice text={formState.errors.root?.message} variant="error" />
          )}

          <Typography sx={{ marginBottom: 2.5 }}>
            Select a role you want to assign to a user. Some roles require
            selecting entities they should apply to. Configure the first role
            and continue adding roles or save the assignment.{' '}
            <Link to={ROLES_LEARN_MORE_LINK}>
              Learn more about roles and permissions
            </Link>
            .
          </Typography>
          <Grid
            container
            direction="row"
            spacing={2}
            sx={() => ({
              justifyContent: 'space-between',
              marginBottom: theme.tokens.spacing.S16,
            })}
          >
            <Typography variant={'h3'}>Roles</Typography>
            {roles.length > 0 && roles.some((field) => field.role) && (
              <StyledLinkButtonBox sx={{ marginTop: 0 }}>
                <LinkButton
                  onClick={() => setAreDetailsHidden(!areDetailsHidden)}
                >
                  {areDetailsHidden ? 'Show' : 'Hide'} details
                </LinkButton>
              </StyledLinkButtonBox>
            )}
          </Grid>

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
            <StyledLinkButtonBox sx={{ marginTop: theme.tokens.spacing.S12 }}>
              <LinkButton onClick={() => append({ role: null })}>
                Add another role
              </LinkButton>
            </StyledLinkButtonBox>
          )}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Assign',
              type: 'submit',
              loading: isPending || formState.isSubmitting,
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
