import {
  useAccountRoles,
  useAccountUsersInfiniteQuery,
  useUserRoles,
  useUserRolesMutation,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  LinkButton,
  Notice,
  Typography,
} from '@linode/ui';
import { useDebouncedValue } from '@linode/utilities';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { enqueueSnackbar } from 'notistack';
import React, { useCallback, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { AssignSingleSelectedRole } from 'src/features/IAM/Roles/RolesTable/AssignSingleSelectedRole';

import { INTERNAL_ERROR_NO_CHANGES_SAVED } from '../../Shared/constants';
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

  const [usernameInput, setUsernameInput] = useState<string>('');
  const debouncedUsernameInput = useDebouncedValue(usernameInput);
  const username = form.watch('username');
  const userSearchFilter = debouncedUsernameInput
    ? {
        ['+or']: [
          { username: { ['+contains']: debouncedUsernameInput } },
          { email: { ['+contains']: debouncedUsernameInput } },
        ],
      }
    : undefined;

  const {
    data: accountUsers,
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingAccountUsers,
    isLoading: isLoadingAccountUsers,
  } = useAccountUsersInfiniteQuery({
    ...userSearchFilter,
    '+order': 'asc',
    '+order_by': 'username',
  });

  const getUserOptions = useCallback(() => {
    const users = accountUsers?.pages.flatMap((page) => page.data);
    return users?.map((user: User) => ({
      label: user.username,
      value: user.username,
    }));
  }, [accountUsers]);

  const { handleSubmit, reset, control, formState, setError } = form;

  const { data: accountRoles } = useAccountRoles();

  const { data: existingRoles } = useUserRoles(username ?? '');

  const [areDetailsHidden, setAreDetailsHidden] = useState(false);

  const { mutateAsync: updateUserRoles, isPending } = useUserRolesMutation(
    username ?? ''
  );

  const onSubmit = async (values: AssignNewRoleFormValues) => {
    try {
      const mergedRoles = mergeAssignedRolesIntoExistingRoles(
        values,
        existingRoles
      );

      await updateUserRoles(mergedRoles);
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
      setError(error.field ?? 'root', {
        message: INTERNAL_ERROR_NO_CHANGES_SAVED,
      });
    }
  };

  const handleClose = () => {
    reset();

    onClose();
  };

  const handleScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight >=
        listboxNode.scrollHeight &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  };

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`Assign Role${selectedRoles.length > 1 ? `s` : ``}`}
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {formState.errors.root?.message && (
            <Notice text={formState.errors.root?.message} variant="error" />
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

            <Controller
              control={control}
              name={`username`}
              render={({ field: { onChange }, fieldState }) => (
                <Autocomplete
                  errorText={fieldState.error?.message}
                  getOptionLabel={(option) => option.label}
                  label="Select a User"
                  loading={isLoadingAccountUsers || isFetchingAccountUsers}
                  noMarginTop
                  onChange={(_, option) => {
                    onChange(option?.label || null);
                    // Form now has the username, so we can clear the input
                    // This will prevent refetching all users with an existing user as a filter
                    setUsernameInput('');
                  }}
                  onInputChange={(_, value) => {
                    // We set an input state separately for when we query the API
                    setUsernameInput(value);
                  }}
                  options={getUserOptions() || []}
                  placeholder="Select a User"
                  slotProps={{
                    listbox: {
                      onScroll: handleScroll,
                    },
                  }}
                  textFieldProps={{ hideLabel: true }}
                />
              )}
              rules={{ required: 'Select a user.' }}
            />
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

          {!!accountRoles &&
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
