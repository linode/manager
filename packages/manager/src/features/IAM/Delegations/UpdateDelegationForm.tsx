import {
  useAccountUsersInfiniteQuery,
  useAllAccountUsersQuery,
  useUpdateChildAccountDelegatesQuery,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  CloseIcon,
  IconButton,
  Notice,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
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

  const totalUserCount = data?.pages[0]?.results ?? 0;

  const {
    data: allUsers,
    isFetching: isFetchingAllUsers,
    refetch: refetchAllUsers,
  } = useAllAccountUsersQuery(allUserSelected, {
    user_type: 'parent',
  });

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
    watch,
  } = form;

  const selectedUsers = watch('users');

  const users =
    allUserSelected && allUsers
      ? allUsers.map((user) => ({
          label: user.username,
          value: user.username,
        }))
      : !inputValue &&
          totalUserCount > 0 &&
          selectedUsers.length >= totalUserCount
        ? selectedUsers
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
                autoHighlight
                clearOnBlur
                data-testid="delegates-autocomplete"
                disableClearable={true}
                disabled={isFetchingAllUsers || isSubmitting}
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
                onSelectAllClick={(_event) => {
                  const allCurrentOptionsSelected =
                    totalUserCount > 0 &&
                    selectedUsers.length >= totalUserCount;
                  if (allCurrentOptionsSelected) {
                    setValue('users', []);
                    setAllUserSelected(false);
                  } else {
                    onSelectAllClick();
                  }
                }}
                options={users}
                renderTags={() => null}
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
                  placeholder: getPlaceholder(
                    'delegates',
                    selectedUsers.length,
                    totalUserCount
                  ),
                }}
                value={field.value}
              />
            )}
          />
          <Typography sx={{ mb: 1, mt: 2 }}>
            Users in the account delegation
            {isFetchingAllUsers ? '' : ` (${selectedUsers.length})`}:
          </Typography>
          <Paper
            sx={(theme) => ({
              backgroundColor: isFetchingAllUsers
                ? theme.tokens.alias.Interaction.Background.Disabled
                : theme.palette.background.paper,
              maxHeight: 370,
              overflowY: 'auto',
              p: 2,
              py: 1,
            })}
            variant="outlined"
          >
            <Stack spacing={1}>
              {selectedUsers.length === 0 && (
                <Typography py={1} textAlign="center">
                  No users selected
                </Typography>
              )}
              {selectedUsers.map((user) => (
                <DelegationUserRow
                  isSubmitting={isSubmitting}
                  key={user.value}
                  onRemove={() =>
                    setValue(
                      'users',
                      selectedUsers.filter((u) => u.value !== user.value)
                    )
                  }
                  username={user.label}
                />
              ))}
            </Stack>
          </Paper>

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

interface DelegationUserRowProps {
  isSubmitting: boolean;
  onRemove: () => void;
  username: string;
}

const DelegationUserRow = ({
  onRemove,
  username,
  isSubmitting,
}: DelegationUserRowProps) => {
  return (
    <Stack alignItems="center" direction="row" justifyContent="space-between">
      <Typography>{username}</Typography>
      <IconButton
        aria-label={`Remove ${username}`}
        disabled={isSubmitting}
        onClick={onRemove}
        sx={{ p: 0.75 }}
      >
        <CloseIcon />
      </IconButton>
    </Stack>
  );
};
