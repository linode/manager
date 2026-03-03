import {
  useAccountUsersInfiniteQuery,
  useAllAccountUsersQuery,
  useUpdateChildAccountDelegatesQuery,
} from '@linode/queries';
import { ActionsPanel, Autocomplete, Notice, Typography } from '@linode/ui';
import { useDebouncedValue } from '@linode/utilities';
import { useTheme } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { usePermissions } from '../hooks/usePermissions';
import { INTERNAL_ERROR_NO_CHANGES_SAVED } from '../Shared/constants';
import { getPlaceholder } from '../Shared/Entities/utils';

import type {
  ChildAccount,
  ChildAccountWithDelegates,
  Filter,
} from '@linode/api-v4';

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
  onClose: () => void;
}

export const UpdateDelegationForm = ({
  delegation,
  formattedCurrentUsers,
  onClose,
}: DelegationsFormProps) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = React.useState<string>('');
  const [allUserSelected, setAllUserSelected] = React.useState<boolean>(false);
  const debouncedInputValue = useDebouncedValue(inputValue);

  const { data: permissions } = usePermissions('account', [
    'update_delegate_users',
  ]);

  const apiFilter: Filter = {
    user_type: 'parent',
    username: { '+contains': debouncedInputValue },
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching } =
    useAccountUsersInfiniteQuery(apiFilter);

  const {
    data: allUsers,
    isFetching: isFetchingAllUsers,
    refetch: refetchAllUsers,
  } = useAllAccountUsersQuery(allUserSelected, {
    user_type: 'parent',
  });

  const users =
    allUserSelected && allUsers
      ? allUsers.map((user) => ({
          label: user.username,
          value: user.username,
        }))
      : (data?.pages.flatMap((page) => {
          return page.data.map((user) => ({
            label: user.username,
            value: user.username,
          }));
        }) ?? []);

  const isSearching =
    inputValue.length > 0 && debouncedInputValue !== inputValue;

  const isLoadingOptions = isFetching || isFetchingAllUsers;

  const showNoOptionsText = !isLoadingOptions && !isSearching;

  const isSelectAllFetching = allUserSelected && isFetchingAllUsers;

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
    setValue,
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

  const onSelectAllClick = async () => {
    setAllUserSelected(true);
    const { data } = await refetchAllUsers();
    if (data) {
      setValue(
        'users',
        data.map((user) => ({ label: user.username, value: user.username }))
      );
    }
  };

  const handleClose = () => {
    reset();
    onClose();
    setAllUserSelected(false);
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
                disabled={isFetchingAllUsers}
                errorText={fieldState.error?.message ?? error?.[0].reason}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                label="Delegate Users"
                loading={isFetching || isFetchingAllUsers}
                multiple
                noMarginTop
                noOptionsText={showNoOptionsText ? 'No users found' : ' '}
                onChange={(_, newValue) => {
                  field.onChange(newValue || []);
                }}
                onInputChange={(_, value) => {
                  setInputValue(value);
                }}
                onSelectAllClick={(isSelectAllActive) => {
                  if (isSelectAllActive && !allUserSelected) {
                    onSelectAllClick();
                  }
                }}
                options={users}
                placeholder={getPlaceholder(
                  'delegates',
                  field.value.length,
                  users?.length ?? 0
                )}
                slotProps={{
                  listbox: {
                    onScroll: (event: React.SyntheticEvent) => {
                      const listboxNode = event.currentTarget;
                      if (
                        listboxNode.scrollTop + listboxNode.clientHeight >=
                          listboxNode.scrollHeight &&
                        hasNextPage
                      ) {
                        fetchNextPage();
                      }
                    },
                  },
                }}
                textFieldProps={{
                  hideLabel: true,
                  helperText: isSelectAllFetching
                    ? 'Fetching all users...'
                    : undefined,
                  InputProps: isSelectAllFetching
                    ? { startAdornment: null }
                    : undefined,
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
