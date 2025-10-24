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

import {
  DELEGATION_VALIDATION_ERROR,
  INTERNAL_ERROR_NO_CHANGES_SAVED,
} from '../Shared/constants';
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

  const { mutateAsync: updateDelegates } =
    useUpdateChildAccountDelegatesQuery();

  const currentUsers = React.useMemo(() => {
    if (delegation && 'users' in delegation && delegation.users) {
      return delegation.users;
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
      users: currentUsers.map((username) => ({
        label: username,
        value: username,
      })),
    },
  });
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
    watch,
  } = form;

  watch('users');

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
            Delegate users removed from this list will lose the role assignment
            on the child account and they won’t be visible in the user list on
            the child account.
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
            rules={{
              required: DELEGATION_VALIDATION_ERROR,
            }}
          />

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Update',
              loading: isSubmitting,
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
