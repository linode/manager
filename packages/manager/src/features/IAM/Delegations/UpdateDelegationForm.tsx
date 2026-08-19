import { toast } from '@akamai/cds-components/notification-toast';
import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import {
  useAccountUsers,
  useAllAccountUsersQuery,
  useUpdateChildAccountDelegatesQuery,
} from '@linode/queries';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePermissions } from '../hooks/usePermissions';
import {
  IAM_PARENT_USERS_PENDO_IDS,
  INTERNAL_ERROR_NO_CHANGES_SAVED,
} from '../Shared/constants';
import { DrawerInlineActions } from '../Shared/Drawer';
import { getPlaceholder } from '../Shared/Entities/utils';
import { SelectionPanel } from '../Shared/SelectionPanel/SelectionPanel';

import type {
  ChildAccount,
  ChildAccountWithDelegates,
  Filter,
  ResourcePage,
  User,
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

const MIN_PAGE_SIZE = 25;

export const UpdateDelegationForm = ({
  delegation,
  formattedCurrentUsers,
  onClose,
}: DelegationsFormProps) => {
  const [filterText, setFilterText] = React.useState<string>('');
  const [showSelectedOnly, setShowSelectedOnly] = React.useState(false);
  const debouncedFilterText = useDebouncedValue(filterText);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(MIN_PAGE_SIZE);

  const { data: permissions } = usePermissions('account', [
    'update_delegate_users',
  ]);

  const apiFilter: Filter = {
    user_type: 'parent',
    username: { '+contains': debouncedFilterText },
  };

  const {
    data: paginatedUsers,
    error: fetchError,
    isFetching,
  } = useAccountUsers({
    enabled: !showSelectedOnly,
    filters: apiFilter,
    params: { page, page_size: pageSize },
  });

  const totalUserCount =
    (paginatedUsers as unknown as ResourcePage<User> | undefined)?.results ?? 0;

  // Fetch all users without pagination to support "Select all" functionality.
  // It is only used when the user clicks "Select all", so it won't impact the initial load performance.
  const { isFetching: isFetchingAllUsers, refetch: refetchAllUsers } =
    useAllAccountUsersQuery(false, apiFilter);

  const { mutateAsync: updateDelegates } =
    useUpdateChildAccountDelegatesQuery();

  const form = useForm<UpdateDelegationsFormValues>({
    values: {
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

  const totalCount = showSelectedOnly ? selectedUsers.length : totalUserCount;
  // Ensure the current page is valid given the total count and page size.
  const effectivePage = Math.min(
    page,
    Math.max(1, Math.ceil(totalCount / pageSize))
  );

  const onSubmit = async (values: UpdateDelegationsFormValues) => {
    const usersList = values.users.map((user) => user.value);

    try {
      await updateDelegates({
        euuid: delegation.euuid,
        users: usersList,
      });
      toast.open({
        text: 'Delegation updated',
        type: 'success',
      });
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
    setShowSelectedOnly(false);
  };

  const currentPageData = (
    paginatedUsers as unknown as ResourcePage<User> | undefined
  )?.data;

  const displayedUserRows = React.useMemo((): Array<{
    name: string;
    option: UserOption;
    rank: number;
  }> => {
    const normalizedFilter = debouncedFilterText.trim().toLowerCase();
    const matchesFilter = (u: UserOption) =>
      !normalizedFilter || u.label.toLowerCase().includes(normalizedFilter);
    const source: UserOption[] = showSelectedOnly
      ? selectedUsers.filter(matchesFilter)
      : (currentPageData ?? []).map((u) => ({
          label: u.username,
          value: u.username,
        }));
    return source.map((u, idx) => ({ rank: idx, name: u.label, option: u }));
  }, [currentPageData, debouncedFilterText, selectedUsers, showSelectedOnly]);

  const isSearching =
    filterText.length > 0 && debouncedFilterText !== filterText;

  const isLoading = isFetching || isFetchingAllUsers || isSearching;

  const showNoUsersText =
    !isFetching &&
    !isFetchingAllUsers &&
    !isSearching &&
    !fetchError &&
    displayedUserRows.length === 0;

  const paginatedDisplayedUserRows = React.useMemo(() => {
    if (showSelectedOnly) {
      const start = (effectivePage - 1) * pageSize;
      return displayedUserRows.slice(start, start + pageSize);
    }
    return displayedUserRows;
  }, [displayedUserRows, showSelectedOnly, effectivePage, pageSize]);

  const selectedUserMap = React.useMemo(() => {
    const map: Record<number, boolean> = {};
    displayedUserRows.forEach((p) => {
      if (selectedUsers.some((u) => u.value === p.option.value)) {
        map[p.rank] = true;
      }
    });
    return map;
  }, [displayedUserRows, selectedUsers]);

  const displayedSelectedUsers = React.useMemo(() => {
    const normalizedFilter = debouncedFilterText.trim().toLowerCase();
    if (!normalizedFilter) {
      return selectedUsers;
    }
    return selectedUsers.filter((user) =>
      user.label.toLowerCase().includes(normalizedFilter)
    );
  }, [debouncedFilterText, selectedUsers]);

  const clearDisabled = displayedSelectedUsers.length === 0;

  const clearDisplayedUsers = () => {
    const visibleValues = new Set(
      displayedSelectedUsers.map((user) => user.value)
    );
    const remaining = selectedUsers.filter((u) => !visibleValues.has(u.value));
    setValue('users', remaining);
    if (remaining.length === 0 && showSelectedOnly) {
      setShowSelectedOnly(false);
    }
  };

  const handleSelectAll = () => {
    const allCurrentOptionsSelected =
      totalUserCount > 0 && displayedSelectedUsers.length >= totalUserCount;
    if (allCurrentOptionsSelected) {
      setValue('users', []);
    } else {
      onSelectAllClick();
    }
  };

  const toggleUserSelection = (rank: number, checked: boolean) => {
    const p = displayedUserRows.find((item) => item.rank === rank);
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
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} slot="body">
        {errors.root?.message && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S8 }}
            text={errors.root?.message}
            type="error"
          />
        )}
        {!permissions.update_delegate_users && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S8 }}
            text="You do not have permission to update delegations."
            type="error"
          />
        )}
        <p style={{ marginBottom: Spacing.S16 }}>
          Add or remove users who should have access to the child account.
          removed from this list will lose the role assignment on the child
          account and they won&apos;t be visible in the user list on the child
          child account.
        </p>

        <p
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Update delegation for <strong>{delegation.company}:</strong>
        </p>

        <SelectionPanel
          effectivePage={effectivePage}
          errorText={
            fetchError
              ? (fetchError[0]?.reason ?? 'Failed to load users')
              : undefined
          }
          filterPlaceholder={getPlaceholder(
            'delegates',
            selectedUsers.length,
            totalUserCount
          )}
          filterText={filterText}
          isClearDisabled={
            clearDisabled || isSubmitting || !permissions?.update_delegate_users
          }
          isDisabled={isSubmitting || !permissions?.update_delegate_users}
          isFilterDisabled={isFetchingAllUsers || isSubmitting}
          isFilterLoading={isFetchingAllUsers || isSearching}
          isLoading={isLoading}
          isSelectAllDisabled={
            (totalUserCount > 0 &&
              displayedSelectedUsers.length >= totalUserCount) ||
            !permissions?.update_delegate_users
          }
          isShowSelectedOnlyDisabled={selectedUsers.length === 0}
          loadingLabel={isFetchingAllUsers ? 'Fetching all users...' : ''}
          minPageSize={MIN_PAGE_SIZE}
          noItemsText="No users found"
          onClear={clearDisplayedUsers}
          onFilterTextChange={(text) => {
            setFilterText(text);
            setPage(1);
          }}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          onSelectAll={handleSelectAll}
          onShowSelectedOnlyChange={(show) => {
            setShowSelectedOnly(show);
            setPage(1);
          }}
          onToggle={toggleUserSelection}
          pageSize={pageSize}
          pageSizes={[25, 50, 75, 100]}
          paginatedRows={paginatedDisplayedUserRows}
          selectedCount={selectedUsers.length}
          selectionLabel="Users selected:"
          selectionMap={selectedUserMap}
          showEmptyState={showNoUsersText}
          showPagination={totalCount > MIN_PAGE_SIZE && !isFetchingAllUsers}
          showSelectedOnly={showSelectedOnly}
          totalCount={totalCount}
        />
        <DrawerInlineActions>
          <Button
            data-testid="cancel"
            onClick={handleClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            data-pendo-id={IAM_PARENT_USERS_PENDO_IDS.updateDelegationSave}
            data-testid="submit"
            disabled={!permissions?.update_delegate_users}
            processing={isSubmitting}
            type="submit"
            variant="primary"
          >
            Save Changes
          </Button>
        </DrawerInlineActions>
      </form>
    </FormProvider>
  );
};
