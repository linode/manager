import { ActionsPanel, Drawer, LinkButton, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React, { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { AssignSingleRole } from 'src/features/IAM/Users/UserRoles/AssignSingleRole';
import {
  useAccountPermissions,
  useAccountUserPermissions,
  useAccountUserPermissionsMutation,
} from 'src/queries/iam/iam';

import {
  getAllRoles,
  mergeAssignedRolesIntoExistingRoles,
} from '../../Shared/utilities';

import type { AssignNewRoleFormValues } from '../../Shared/utilities';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const AssignNewRoleDrawer = ({ onClose, open }: Props) => {
  const theme = useTheme();
  const { username } = useParams<{ username: string }>();

  const { data: accountPermissions } = useAccountPermissions();

  const { data: existingRoles } = useAccountUserPermissions(username ?? '');

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

  const { control, handleSubmit, reset, watch } = form;
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

  const { mutateAsync: updateUserRolePermissions } =
    useAccountUserPermissionsMutation(username);

  const onSubmit = handleSubmit(async (values: AssignNewRoleFormValues) => {
    const mergedRoles = mergeAssignedRolesIntoExistingRoles(
      values,
      existingRoles
    );
    await updateUserRolePermissions(mergedRoles);
    handleClose();
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  // TODO - add a link 'Learn more" - UIE-8534
  return (
    <Drawer onClose={onClose} open={open} title="Assign New Roles">
      {' '}
      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <Typography sx={{ marginBottom: 2.5 }}>
            Select a role you want to assign to a user. Some roles require
            selecting resources they should apply to. Configure the first role
            and continue adding roles or save the assignment.
            <Link to=""> Learn more about roles and permissions.</Link>
          </Typography>
          <Grid
            container
            direction="row"
            spacing={2}
            sx={() => ({
              justifyContent: 'space-between',
              marginBottom: theme.spacing(2),
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
