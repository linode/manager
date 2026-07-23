import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  NotificationBanner,
  Select,
} from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import {
  useAccountRoles,
  useAccountUsers,
  useAllAccountUsersQuery,
  useUserRoles,
  useUserRolesMutation,
} from '@linode/queries';
import React, { useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePermissions } from '../../hooks/usePermissions';
import { Box } from '../../Shared/Box/Box';
import {
  IAM_ROLES_PENDO_IDS,
  INTERNAL_ERROR_NO_CHANGES_SAVED,
} from '../../Shared/constants';
import { DelegateUserChip } from '../../Shared/DelegateUserChip';
import { Drawer, DrawerInlineActions } from '../../Shared/Drawer';
import styles from '../../Shared/global.module.css';
import { TruncatedUsername } from '../../Shared/TruncatedUsername/TruncatedUsername';
import { mergeAssignedRolesIntoExistingRoles } from '../../Shared/utilities';
import { AssignSingleSelectedRole } from './AssignSingleSelectedRole';

import type { RoleView } from '../../Shared/types';
import type { SelectOption } from '../../Shared/types';
import type { AssignNewRoleFormValues } from '../../Shared/utilities';
import type { User } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  selectedRoles: RoleView[];
}

interface UserOption extends SelectOption {
  userType: User['user_type'];
}

const getUserOptionPendoId = (userType: User['user_type']) => {
  if (userType === 'parent') {
    return IAM_ROLES_PENDO_IDS.assignSelectedRoleToUserParent;
  }

  if (userType === 'child') {
    return IAM_ROLES_PENDO_IDS.assignSelectedRoleToUserChild;
  }

  return IAM_ROLES_PENDO_IDS.assignSelectedRoleToUserDelegate;
};

export const AssignSelectedRolesDrawer = ({
  onClose,
  onSuccess,
  open,
  selectedRoles,
}: Props) => {
  const isSMUp = useBreakpoint('up', 'sm');

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
  const [hasEngagedUserSelect, setHasEngagedUserSelect] = useState(false);
  const debouncedUsernameInput = useDebouncedValue(usernameInput);
  const username = form.watch('username');
  const isSearching = debouncedUsernameInput.length > 0;
  const isPendingSearch =
    usernameInput.length > 0 && debouncedUsernameInput !== usernameInput;

  const userSearchFilter = isSearching
    ? {
        ['+or']: [
          { username: { ['+contains']: debouncedUsernameInput } },
          { email: { ['+contains']: debouncedUsernameInput } },
        ],
      }
    : undefined;

  const { data: permissions } = usePermissions('account', ['view_user']);

  const canFetchUsers = open && permissions?.view_user && hasEngagedUserSelect;

  // TODO - CDS - UIE-11455: replace with useAccountUsersInfiniteQuery when tag input supports infinite loading
  const { data: browseUsers, isLoading: isLoadingBrowseUsers } =
    useAllAccountUsersQuery(canFetchUsers && !isSearching, {
      '+order': 'asc',
      '+order_by': 'username',
    });

  const {
    data: searchResults,
    isFetching: isFetchingSearchUsers,
    isLoading: isLoadingSearchUsers,
  } = useAccountUsers({
    enabled: canFetchUsers && isSearching,
    filters: userSearchFilter,
    params: { page: 1, page_size: 100 },
  });

  const accountUsers: undefined | User[] = isSearching
    ? searchResults?.data
    : browseUsers;

  const isLoadingAccountUsers = isSearching
    ? isLoadingSearchUsers || isFetchingSearchUsers || isPendingSearch
    : isLoadingBrowseUsers;

  const userOptions = useMemo<UserOption[]>(() => {
    return (
      accountUsers?.map((user) => ({
        label: user.username,
        userType: user.user_type,
        value: user.username,
      })) ?? []
    );
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
      toast.open({
        text: "Roles successfully assigned. See the user's Assigned Roles page to review them.",
        type: 'success',
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
    setUsernameInput('');
    setHasEngagedUserSelect(false);
    onClose();
  };

  const drawerTitle = `Assign Selected Role${selectedRoles.length > 1 ? `s` : ``} to a User`;

  return (
    <Drawer
      aria-label={drawerTitle}
      className={styles.noMargin}
      onClose={handleClose}
      open={open}
      width={isSMUp ? '600px' : '100%'}
    >
      <div slot="header">{drawerTitle}</div>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} slot="body">
          {formState.errors.root?.message && (
            <NotificationBanner
              text={formState.errors.root?.message}
              type="error"
            />
          )}
          <p style={{ marginBottom: Spacing.S20 }}>
            Select the user you want to assign selected roles to. Some roles
            require selecting entities they should apply to.
          </p>
          <Box
            direction="column"
            style={{
              justifyContent: 'space-between',
              marginBottom: Spacing.S20,
            }}
          >
            <h3
              style={{
                marginBottom: Spacing.S8,
                marginTop: Spacing.S0,
                font: Typography.Heading.S,
              }}
            >
              User
            </h3>

            <Controller
              control={control}
              name={`username`}
              render={({ field: { onChange, value }, fieldState }) => (
                <Select<UserOption>
                  autocomplete
                  clearable
                  data-pendo-id={
                    IAM_ROLES_PENDO_IDS.assignSelectedRolesToUserOpen
                  }
                  error={Boolean(fieldState.error?.message)}
                  errorMessage={fieldState.error?.message ?? ''}
                  filterFn={() => true}
                  isLoading={isLoadingAccountUsers}
                  items={userOptions}
                  itemTemplateFn={(option) => (
                    <Box
                      data-pendo-id={getUserOptionPendoId(option.userType)}
                      direction="row"
                      style={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: Spacing.S8,
                        justifyContent: 'space-between',
                      }}
                      wrap="nowrap"
                    >
                      <TruncatedUsername
                        tooltipStyle={{ whiteSpace: 'normal' }}
                        username={option.label}
                      />
                      {option.userType === 'delegate' && <DelegateUserChip />}
                    </Box>
                  )}
                  loadingLabel={
                    isSearching ? 'Searching users...' : 'Fetching users...'
                  }
                  noItemsLabel={
                    hasEngagedUserSelect
                      ? 'No users found'
                      : 'Search by username or email'
                  }
                  onChange={(event) => {
                    const selected =
                      event.detail as unknown as null | UserOption;
                    onChange(selected?.value ?? null);
                    setUsernameInput('');
                  }}
                  onFocus={() => setHasEngagedUserSelect(true)}
                  onSearchChange={(event) => {
                    setHasEngagedUserSelect(true);
                    setUsernameInput(event.detail as unknown as string);
                  }}
                  placeholder="Search by username or email"
                  selected={
                    userOptions.find((option) => option.value === value) ??
                    (value ? { label: value, userType: 'parent', value } : null)
                  }
                  valueFn={(item) => (item as UserOption).label}
                />
              )}
              rules={{ required: 'Select a user.' }}
            />
          </Box>

          <Box
            direction="row"
            style={{
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ font: Typography.Heading.S }}>
              Role
              {selectedRoles.length > 1 ? `s` : ``}
            </h3>
            {selectedRoles.length > 0 && (
              <Button
                onClick={() => setAreDetailsHidden(!areDetailsHidden)}
                variant="link"
              >
                {areDetailsHidden ? 'Show' : 'Hide'} details
              </Button>
            )}
          </Box>

          {!!accountRoles &&
            selectedRoles.map((role, index) => (
              <AssignSingleSelectedRole
                hideDetails={areDetailsHidden}
                index={index}
                key={role.id}
                role={role}
              />
            ))}
          <DrawerInlineActions>
            <Button
              data-testid="cancel"
              onClick={handleClose}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              data-pendo-id={IAM_ROLES_PENDO_IDS.assignSelectedRoleToUserAssign}
              data-testid="submit"
              processing={isPending || formState.isSubmitting}
              type="submit"
              variant="primary"
            >
              Assign
            </Button>
          </DrawerInlineActions>
        </form>
      </FormProvider>
    </Drawer>
  );
};
