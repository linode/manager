import {
  Button,
  Checkbox,
  LoadingSpinner,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from '@akamai/cds-components/react';
import {
  useAccountUsersInfiniteQuery,
  useAllAccountUsersQuery,
  useUpdateChildAccountDelegatesQuery,
} from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useDebouncedValue } from '@linode/utilities';
import { useTheme } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { usePermissions } from '../hooks/usePermissions';
import {
  IAM_PARENT_USERS_PENDO_IDS,
  INTERNAL_ERROR_NO_CHANGES_SAVED,
} from '../Shared/constants';
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

  const {
    data,
    error: fetchError,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useAccountUsersInfiniteQuery(apiFilter);

  const totalUserCount = data?.pages[0]?.results ?? 0;

  const {
    data: allUsers,
    isFetching: isFetchingAllUsers,
    refetch: refetchAllUsers,
  } = useAllAccountUsersQuery(allUserSelected, {
    user_type: 'parent',
  });

  const { mutateAsync: updateDelegates } =
    useUpdateChildAccountDelegatesQuery();

  const form = useForm<UpdateDelegationsFormValues>({
    defaultValues: {
      users: formattedCurrentUsers,
    },
  });

  const {
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
    setShowOnly(false);
  };

  const [showOnly, setShowOnly] = React.useState(false);

  const view = React.useMemo((): Array<{
    name: string;
    option: UserOption;
    rank: number;
  }> => {
    const source = (showOnly ? selectedUsers : users) as UserOption[];
    return source.map((u, idx) => ({ rank: idx, name: u.label, option: u }));
  }, [users, selectedUsers, showOnly]);

  const showNoUsersText =
    !isFetching && !isSearching && !fetchError && view.length === 0;

  const selected = React.useMemo(() => {
    const map: Record<number, boolean> = {};
    view.forEach((p) => {
      if (selectedUsers.some((u) => u.value === p.option.value)) {
        map[p.rank] = true;
      }
    });
    return map;
  }, [view, selectedUsers]);

  const clearDisabled = !view.some((p) =>
    selectedUsers.some((u) => u.value === p.option.value)
  );

  const clearVisible = () => {
    const visibleValues = new Set(view.map((p) => p.option.value));
    setValue(
      'users',
      selectedUsers.filter((u) => !visibleValues.has(u.value))
    );
  };

  const handleSelectAll = () => {
    const allCurrentOptionsSelected =
      totalUserCount > 0 && selectedUsers.length >= totalUserCount;
    if (allCurrentOptionsSelected) {
      setValue('users', []);
      setAllUserSelected(false);
    } else {
      onSelectAllClick();
    }
  };

  const setSel = (rank: number, checked: boolean) => {
    const p = view.find((item) => item.rank === rank);
    if (!p) return;
    if (checked) {
      if (!selectedUsers.some((u) => u.value === p.option.value)) {
        setValue('users', [...selectedUsers, p.option]);
      }
    } else {
      setValue(
        'users',
        selectedUsers.filter((u) => u.value !== p.option.value)
      );
    }
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

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.tokens.spacing.S8,
              width: '100%',
            }}
          >
            <TextField
              disabled={isFetchingAllUsers || isSubmitting}
              onChange={(e: CustomEvent<string>) =>
                setInputValue(String(e.detail ?? ''))
              }
              placeholder={getPlaceholder(
                'delegates',
                selectedUsers.length,
                totalUserCount
              )}
              value={inputValue}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: theme.tokens.spacing.S6,
                minHeight: '40px',
                padding: `${theme.tokens.spacing.S4} ${theme.tokens.spacing.S12}`,
                border: `1px solid ${theme.tokens.component.Pagination.Border}`,
                background: theme.tokens.component.Pagination.Background,
                fontSize: theme.tokens.font.FontSize.Xs,
                color: theme.tokens.component.Pagination.Text.Default,
              }}
            >
              <span style={{ flex: 1 }}>
                Items: {showOnly ? view.length : totalUserCount} | Selected:{' '}
                {selectedUsers.length}
              </span>
              <Checkbox
                checked={showOnly}
                onChange={(e: CustomEvent<boolean>) => setShowOnly(!!e.detail)}
              >
                Show only selected
              </Checkbox>
              <div style={{ width: '100%', display: 'flex', gap: '6px' }}>
                <Button
                  disabled={clearDisabled || isSubmitting}
                  onClick={clearVisible}
                  type="button"
                  variant="link"
                >
                  Clear
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={handleSelectAll}
                  type="button"
                  variant="link"
                >
                  {totalUserCount > 0 && selectedUsers.length >= totalUserCount
                    ? 'Deselect all'
                    : 'Select all'}
                </Button>
              </div>
            </div>
            <div
              onScroll={(e) => {
                if (showOnly) return;
                const { scrollTop, scrollHeight, clientHeight } =
                  e.currentTarget;
                if (
                  scrollHeight - scrollTop <= clientHeight * 1.5 &&
                  hasNextPage &&
                  !isFetching
                ) {
                  fetchNextPage();
                }
              }}
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                overflowX: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Table>
                <TableBody>
                  {view.map((p) => (
                    <TableRow
                      hoverable
                      key={p.rank}
                      onClick={(e: React.MouseEvent) => {
                        if (isSubmitting) return;
                        const t = e.target as Element;
                        if (t.closest?.('cds-checkbox')) return;
                        setSel(p.rank, !selected[p.rank]);
                      }}
                      rowborder
                      selected={!!selected[p.rank]}
                    >
                      <TableCell>
                        <Checkbox
                          checked={!!selected[p.rank]}
                          disabled={isSubmitting}
                          onChange={(e: CustomEvent<boolean>) => {
                            setSel(p.rank, !!e.detail);
                          }}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                        <span
                          style={{
                            flex: 1,
                            lineHeight: '20px',
                            minWidth: 0,
                          }}
                        >
                          {p.name}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!showOnly && isFetching && (
                    <TableRow>
                      <TableCell style={{ justifyContent: 'center' }}>
                        <LoadingSpinner />
                      </TableCell>
                    </TableRow>
                  )}
                  {showNoUsersText && (
                    <TableRow>
                      <TableCell style={{ justifyContent: 'center' }}>
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                  {fetchError && (
                    <TableRow>
                      <TableCell style={{ justifyContent: 'center' }}>
                        {fetchError[0]?.reason ?? 'Failed to load users'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Save Changes',
              'data-pendo-id': IAM_PARENT_USERS_PENDO_IDS.updateDelegationSave,
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
