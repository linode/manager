import { ActionsPanel, Drawer, Notice, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { AssignSingleRole } from 'src/features/IAM/Users/UserRoles/AssignSingleRole';
import {
  useAccountPermissions,
  useAccountUserPermissionsMutation,
} from 'src/queries/iam/iam';
import { iamQueries } from 'src/queries/iam/queries';

import {
  INTERNAL_ERROR_UPDATE_PERMISSION,
  NO_CHANGES_SAVED,
} from '../../Shared/constants';
import {
  getAllRoles,
  mergeAssignedRolesIntoExistingRoles,
} from '../../Shared/utilities';

import type { AssignNewRoleFormValues } from '../../Shared/utilities';
import type { IamUserPermissions } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const AssignNewRoleDrawer = ({ onClose, open }: Props) => {
  const theme = useTheme();
  const { username } = useParams<{ username: string }>();
  const queryClient = useQueryClient();

  const { data: accountPermissions } = useAccountPermissions();

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
    if (!accountPermissions) {
      return [];
    }
    return getAllRoles(accountPermissions);
  }, [accountPermissions]);

  const { mutateAsync: updateUserRolePermissions, isPending } =
    useAccountUserPermissionsMutation(username);

  const onSubmit = async (values: AssignNewRoleFormValues) => {
    try {
      const queryKey = iamQueries.user(username)._ctx.permissions.queryKey;
      const currentRoles =
        queryClient.getQueryData<IamUserPermissions>(queryKey);

      const mergedRoles = mergeAssignedRolesIntoExistingRoles(
        values,
        structuredClone(currentRoles)
      );

      await updateUserRolePermissions(mergedRoles);

      enqueueSnackbar(`Roles added.`, { variant: 'success' });
      handleClose();
    } catch (error) {
      setError(error.field ?? 'root', { message: error[0].reason });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // TODO - add a link 'Learn more" - UIE-8534
  return (
    <Drawer onClose={handleClose} open={open} title="Assign New Roles">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {formState.errors.root?.message && (
            <Notice variant="error">
              <Typography>
                {INTERNAL_ERROR_UPDATE_PERMISSION}
                <br />
                {NO_CHANGES_SAVED}
              </Typography>
            </Notice>
          )}

          <Typography sx={{ marginBottom: 2.5 }}>
            Select a role you want to assign to a user. Some roles require
            selecting entities they should apply to. Configure the first role
            and continue adding roles or save the assignment.
            <Link to=""> Learn more about roles and permissions.</Link>
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

          {!!accountPermissions &&
            fields.map((field, index) => (
              <AssignSingleRole
                hideDetails={areDetailsHidden}
                index={index}
                key={field.id}
                onRemove={() => remove(index)}
                options={allRoles}
                permissions={accountPermissions}
              />
            ))}

          {/* If all roles are filled, allow them to add another */}
          {roles.length > 0 && roles.every((field) => field.role) && (
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
