import { useUpdateChildAccountDelegatesQuery } from '@linode/queries';
import { ActionsPanel, Autocomplete, Notice, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { usePermissions } from '../hooks/usePermissions';
import { INTERNAL_ERROR_NO_CHANGES_SAVED } from '../Shared/constants';
import { getPlaceholder } from '../Shared/Entities/utils';

import type { ChildAccount, ChildAccountWithDelegates } from '@linode/api-v4';

interface UpdateDelegationsFormValues {
  users: UserOption[];
}

interface UserOption {
  label: string;
  value: string;
}

interface DelegationsFormProps {
  delegation: ChildAccount | ChildAccountWithDelegates;
  formattedCurrentUsers: UserOption[];
  isLoading: boolean;
  onClose: () => void;
  userOptions: UserOption[];
}
export const UpdateDelegationForm = ({
  delegation,
  formattedCurrentUsers,
  isLoading,
  onClose,
  userOptions,
}: DelegationsFormProps) => {
  const theme = useTheme();

  const { data: permissions } = usePermissions('account', [
    'update_delegate_users',
  ]);

  const { mutateAsync: updateDelegates } =
    useUpdateChildAccountDelegatesQuery();

  const form = useForm<UpdateDelegationsFormValues>({
    defaultValues: {
      users: formattedCurrentUsers,
    },
  });

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = form;

  const onSubmit = async (values: UpdateDelegationsFormValues) => {
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
        setError('root', {
          message: error.reason ?? INTERNAL_ERROR_NO_CHANGES_SAVED,
        });
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      {errors.root?.message && (
        <Notice text={errors.root?.message} variant="error" />
      )}
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography sx={{ marginBottom: theme.tokens.spacing.S16 }}>
            Add or remove users who should have access to the child account.
            Users removed from this list will lose the role assignment on the
            child account and they won&apos;t be visible in the user list on the
            child account.
          </Typography>

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
              label: 'Save Changes',
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
    </>
  );
};
