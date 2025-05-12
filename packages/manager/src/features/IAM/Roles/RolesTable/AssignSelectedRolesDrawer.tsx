import { useAccountUsers } from '@linode/queries';
import { ActionsPanel, Autocomplete, Drawer, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React, { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { AssignSingleSelectedRole } from 'src/features/IAM/Roles/RolesTable/AssignSingleSelectedRole';
import {
  useAccountPermissions,
  useAccountUserPermissions,
  useAccountUserPermissionsMutation,
} from 'src/queries/iam/iam';

import { mergeAssignedRolesIntoExistingRoles } from '../../Shared/utilities';

import type {
  AssignNewRoleFormValues,
  RolesType,
} from '../../Shared/utilities';
import type { RoleView } from 'src/features/IAM/Shared/types';

interface Props {
  onClose: () => void;
  open: boolean;
  selectedRoles: RoleView[];
}

export const AssignSelectedRolesDrawer = ({
  onClose,
  open,
  selectedRoles,
}: Props) => {
  const theme = useTheme();

  const { data: allUsers } = useAccountUsers({});
  const [username, setUsername] = useState<string>('');

  const getUserOptions = () => {
    return allUsers?.data.map((user) => ({
      label: user.username,
      value: user.username,
    }));
  };

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
  const { control, handleSubmit, reset } = form;
  const { update } = useFieldArray({
    control,
    name: 'roles',
  });

  // Add the roles that were selected
  useEffect(() => {
    selectedRoles.forEach((role, idx) => {
      update(idx, {
        entities: null,
        role: role.name as unknown as RolesType,
      });
    });
  }, [selectedRoles, update]);

  const [areDetailsHidden, setAreDetailsHidden] = useState(false);

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

  return (
    <Drawer onClose={onClose} open={open} title="Assign Selected Roles to User">
      {' '}
      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <Typography sx={{ marginBottom: 2.5 }}>
            Select the user you want to assign selected roles to. Some roles
            require selecting entities they should apply to.
          </Typography>
          <Grid
            container
            direction="column"
            sx={() => ({
              justifyContent: 'space-between',
              marginBottom: theme.spacingFunction(16),
            })}
          >
            <Typography variant={'h3'}>Users</Typography>
            {allUsers && allUsers?.data?.length > 0 && (
              <Autocomplete
                getOptionLabel={(option) => option.label}
                label=""
                noMarginTop
                onChange={(_, option) => {
                  setUsername(option?.label || '');
                }}
                options={getUserOptions() || []}
                placeholder="Select a User"
                sx={{ marginTop: theme.tokens.spacing.S12 }}
              />
            )}
          </Grid>

          <Grid
            container
            direction="row"
            spacing={2}
            sx={() => ({
              justifyContent: 'space-between',
              marginBottom: theme.spacingFunction(16),
            })}
          >
            <Typography variant={'h3'}>Roles</Typography>
            {selectedRoles.length > 0 && (
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
            selectedRoles.map((role, index) => (
              <AssignSingleSelectedRole
                hideDetails={areDetailsHidden}
                index={index}
                key={role.id}
                permissions={accountPermissions}
                role={role}
              />
            ))}

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
