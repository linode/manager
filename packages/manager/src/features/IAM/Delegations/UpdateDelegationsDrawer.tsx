import {
  useAccountUsers,
  useUpdateChildAccountDelegatesQuery,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  Notice,
  Typography,
  useTheme,
} from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { usePermissions } from '../hooks/usePermissions';
import { INTERNAL_ERROR_NO_CHANGES_SAVED } from '../Shared/constants';
import { getPlaceholder } from '../Shared/Entities/utils';

import type { ChildAccount, ChildAccountWithDelegates } from '@linode/api-v4';

interface UserOption {
  label: string;
  value: string;
}

interface UpdateDelegationsFormValues {
  users: UserOption[];
}

interface Props {
  delegation: ChildAccount | ChildAccountWithDelegates | undefined;
  onClose: () => void;
  open: boolean;
}

export const UpdateDelegationsDrawer = ({
  delegation,
  onClose,
  open,
}: Props) => {
  const theme = useTheme();

  // Get all parent accounts as options for delegation
  const { data: allParentAccounts, isLoading } = useAccountUsers({
    enabled: open,
    filters: { user_type: 'parent' },
  });

  const { data: permissions } = usePermissions('account', [
    'update_delegate_users',
  ]);

  const { mutateAsync: updateDelegates } =
    useUpdateChildAccountDelegatesQuery();

  const formattedCurrentUsers = React.useMemo(() => {
    if (delegation && 'users' in delegation && delegation.users) {
      return delegation.users.map((username) => ({
        label: username,
        value: username,
      }));
    }
    return [];
  }, [delegation]);

  const userOptions = React.useMemo(() => {
    if (!allParentAccounts?.data) return [];
    return allParentAccounts.data.map((user) => ({
      label: user.username,
      value: user.username,
    }));
  }, [allParentAccounts]);

  const form = useForm<UpdateDelegationsFormValues>({
    defaultValues: {
      users: [],
    },
  });

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = form;

  // Reinitialize form values when the drawer opens or delegated users change
  React.useEffect(() => {
    if (!open) return;
    reset({ users: formattedCurrentUsers }, { keepDirtyValues: true });
  }, [open, formattedCurrentUsers, reset]);

  const onSubmit = async (values: UpdateDelegationsFormValues) => {
    if (!delegation) return;

    const usersList = values.users.map((user) => user.value);

    try {
      await updateDelegates({
        euuid: delegation.euuid,
        users: usersList,
      });
      enqueueSnackbar(`Delegation updated`, { variant: 'success' });
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
    <Drawer onClose={handleClose} open={open} title="Update Delegations">
      {errors.root?.message && (
        <Notice text={errors.root?.message} variant="error" />
      )}
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography sx={{ marginBottom: theme.tokens.spacing.S16 }}>
            Add or remove users who should have access to the child account.
            Users removed from this list will lose the role assignment on the
            child account and they won’t be visible in the user list on the
            child account.
          </Typography>

          {delegation && (
            <Typography
              sx={{
                marginBottom: theme.tokens.spacing.S8,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Update delegation for <strong>{delegation.company}:</strong>
            </Typography>
          )}

          <Controller
            control={control}
            name="users"
            render={({ field, fieldState }) => (
              <Autocomplete
                data-testid="delegates-autocomplete"
                errorText={fieldState.error?.message}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                label={'Delegate Users'}
                loading={isLoading}
                multiple
                noMarginTop
                onChange={(_, newValue) => {
                  field.onChange(newValue || []);
                }}
                options={userOptions}
                placeholder={getPlaceholder(
                  'delegates',
                  field.value.length,
                  userOptions.length
                )}
                textFieldProps={{
                  hideLabel: true,
                }}
                value={field.value}
              />
            )}
          />

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Update',
              loading: isSubmitting,
              type: 'submit',
              disabled: !permissions?.update_delegate_users,
              tooltipText: !permissions?.update_delegate_users
                ? 'You do not have permission to update delegations.'
                : undefined,
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
