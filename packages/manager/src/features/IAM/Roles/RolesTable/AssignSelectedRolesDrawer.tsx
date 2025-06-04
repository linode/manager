import { useAccountUsers } from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  Notice,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { AssignSingleSelectedRole } from 'src/features/IAM/Roles/RolesTable/AssignSingleSelectedRole';
import {
  useAccountPermissions,
  useAccountUserPermissions,
  useAccountUserPermissionsMutation,
} from 'src/queries/iam/iam';

import {
  INTERNAL_ERROR_UPDATE_PERMISSION,
  NO_CHANGES_SAVED,
} from '../../Shared/constants';
import { mergeAssignedRolesIntoExistingRoles } from '../../Shared/utilities';

import type { AssignNewRoleFormValues } from '../../Shared/utilities';
import type { User } from '@linode/api-v4';
import type { RoleView } from 'src/features/IAM/Shared/types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  selectedRoles: RoleView[];
}

export const AssignSelectedRolesDrawer = ({
  onClose,
  onSuccess,
  open,
  selectedRoles,
}: Props) => {
  const theme = useTheme();

  const { data: allUsers } = useAccountUsers({});
  const [username, setUsername] = useState<null | string>('');

  const getUserOptions = () => {
    return allUsers?.data.map((user: User) => ({
      label: user.username,
      value: user.username,
    }));
  };

  const { data: accountPermissions } = useAccountPermissions();

  const { data: existingRoles } = useAccountUserPermissions(username ?? '');

  const values = {
    roles: selectedRoles.map((r) => ({
      role: {
        access: r.access,
        entity_type: r.entity_type,
        label: r.name,
        value: r.name,
      },
      entities: null,
    })),
    username: null,
  };

  const form = useForm<AssignNewRoleFormValues>({
    defaultValues: values,
    values,
  });

  const { handleSubmit, reset, control, formState, setError } = form;

  const [areDetailsHidden, setAreDetailsHidden] = useState(false);

  const { mutateAsync: updateUserRolePermissions, isPending } =
    useAccountUserPermissionsMutation(username ?? '');

  const onSubmit = async (values: AssignNewRoleFormValues) => {
    try {
      const mergedRoles = mergeAssignedRolesIntoExistingRoles(
        values,
        existingRoles
      );

      await updateUserRolePermissions(mergedRoles);
      const successMessage = (
        <Typography>
          Roles assigned. See user&apos;s{' '}
          {<Link to={`/iam/users/${username}/roles`}>Assigned Roles</Link>} to
          review them.
        </Typography>
      );
      enqueueSnackbar(successMessage, {
        variant: 'success',
      });
      onSuccess();

      handleClose();
    } catch (error) {
      setError(error.field ?? 'root', { message: error[0].reason });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Assign Role${selectedRoles.length > 1 ? `s` : ``}`}
    >
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
            Select the user you want to assign selected roles to. Some roles
            require selecting entities they should apply to.
          </Typography>
          <Grid
            container
            direction="column"
            sx={() => ({
              justifyContent: 'space-between',
              marginBottom: theme.spacingFunction(20),
            })}
          >
            <Typography mb={theme.spacingFunction(8)} variant="h3">
              Users
            </Typography>
            {allUsers && allUsers?.data?.length > 0 && (
              <Controller
                control={control}
                name={`username`}
                render={({ field: { onChange }, fieldState }) => (
                  <Autocomplete
                    errorText={fieldState.error?.message}
                    getOptionLabel={(option) => option.label}
                    label="Select a User"
                    noMarginTop
                    onChange={(_, option) => {
                      const username = option?.label || null;
                      onChange(username);
                      setUsername(username);
                    }}
                    options={getUserOptions() || []}
                    placeholder="Select a User"
                    textFieldProps={{ hideLabel: true }}
                  />
                )}
                rules={{ required: 'Select a user.' }}
              />
            )}
          </Grid>

          <Grid
            container
            direction="row"
            spacing={2}
            sx={() => ({
              justifyContent: 'space-between',
            })}
          >
            <Typography variant={'h3'}>
              Role
              {selectedRoles.length > 1 ? `s` : ``}
            </Typography>
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
                role={role}
              />
            ))}

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
