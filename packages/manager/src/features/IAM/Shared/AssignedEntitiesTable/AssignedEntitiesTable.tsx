import {
  FormField,
  FormLabel,
  Pagination,
  Select,
  Table,
  TableBody,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import {
  useGetDefaultDelegationAccessQuery,
  useUserRoles,
} from '@linode/queries';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { usePagination } from '../../hooks/usePagination';
import { usePermissions } from '../../hooks/usePermissions';
import { useAllAccountEntities } from '../../queries/entities/entities';
import {
  addEntityNamesToRoles,
  getSearchableFields,
} from '../../Users/UserEntities/utils';
import { Box } from '../Box/Box';
import { ENTITIES_TABLE_PREFERENCE_KEY } from '../constants';
import { DebouncedSearchField } from '../DebouncedSearchField/DebouncedSearchField';
import globalStyles from '../global.module.css';
import { RemoveAssignmentConfirmationDialog } from '../RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog';
import {
  getFilteredRoles,
  groupAccountEntitiesByType,
  mapEntityTypesForSelect,
} from '../utilities';
import { AssignedEntitiesTableBody } from './AssignedEntitiesTableBody';
import { AssignedEntitiesTableHead } from './AssignedEntitiesTableHead';
import { ChangeRoleForEntityDrawer } from './ChangeRoleForEntityDrawer';

import type { IAMAction } from '../../routes';
import type { DrawerModes, EntitiesRole, SelectOption } from '../types';
import type { EntityType } from '@linode/api-v4';

const ALL_ENTITIES_OPTION: SelectOption = {
  label: 'All Entities',
  value: 'all',
};

type SortOrder = 'asc' | 'desc';

type OrderByKeys = 'entity_name' | 'entity_type' | 'role_name';

interface Props {
  username?: string;
}

const DEFAULTS_ENTITIES_URL = '/iam/roles/defaults/entity-access';
const USER_ENTITIES_URL = '/iam/users/$username/entities';
const MIN_PAGE_SIZE = 25;

export const AssignedEntitiesTable = ({ username }: Props) => {
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
    'list_entities',
  ]);
  const navigate = useNavigate();

  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const {
    action,
    query: queryParam,
    entity: entityParam,
    entityType: entityTypeParam,
    order: orderParam,
    role: roleParam,
    selectedRole: selectedRoleSearchParam,
    orderBy: orderByParam,
  } = useSearch({
    from: isDefaultDelegationRolesForChildAccount
      ? DEFAULTS_ENTITIES_URL
      : USER_ENTITIES_URL,
  });

  const order: SortOrder = orderParam ?? 'asc';

  const ORDERABLE_KEYS = ['entity_name', 'entity_type', 'role_name'] as const;
  const isValidOrderBy = (v: unknown): v is OrderByKeys =>
    ORDERABLE_KEYS.includes(v as OrderByKeys);
  const orderBy: OrderByKeys = isValidOrderBy(orderByParam)
    ? orderByParam
    : 'entity_name';

  const handleOrderChange = (key: string, order?: SortOrder | undefined) => {
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ENTITIES_URL
        : USER_ENTITIES_URL,
      params: isDefaultDelegationRolesForChildAccount
        ? undefined
        : { username: username || '' },
      search: (prev) => ({
        ...prev,
        order,
        orderBy: key,
      }),
    });
  };

  const appliedQuery = queryParam ?? selectedRoleSearchParam ?? '';

  const [drawerMode, setDrawerMode] =
    React.useState<DrawerModes>('assign-role');

  const {
    data: entities,
    error: entitiesError,
    isLoading: entitiesLoading,
  } = useAllAccountEntities({
    enabled: permissions?.list_entities,
  });

  const {
    data: assignedUserRoles,
    error: assignedUserRolesError,
    isLoading: assignedUserRolesLoading,
  } = useUserRoles(username ?? '', !isDefaultDelegationRolesForChildAccount);

  const {
    data: delegateDefaultRoles,
    error: delegateDefaultRolesError,
    isLoading: delegateDefaultRolesLoading,
  } = useGetDefaultDelegationAccessQuery({
    enabled: isDefaultDelegationRolesForChildAccount,
  });

  const assignedRoles = isDefaultDelegationRolesForChildAccount
    ? delegateDefaultRoles
    : assignedUserRoles;

  const error = isDefaultDelegationRolesForChildAccount
    ? delegateDefaultRolesError
    : assignedUserRolesError;

  const loading = isDefaultDelegationRolesForChildAccount
    ? delegateDefaultRolesLoading
    : assignedUserRolesLoading;

  const { filterableOptions, roles } = React.useMemo(() => {
    if (!assignedRoles || !entities) {
      return { filterableOptions: [], roles: [] };
    }
    const transformedEntities = groupAccountEntitiesByType(entities);

    const roles = addEntityNamesToRoles(assignedRoles, transformedEntities);

    const filterableOptions = [
      ALL_ENTITIES_OPTION,
      ...mapEntityTypesForSelect(roles, 's'),
    ];

    return { filterableOptions, roles };
  }, [assignedRoles, entities]);

  const selectedEntityTypeOption = React.useMemo<null | SelectOption>(() => {
    const value = entityTypeParam ?? ALL_ENTITIES_OPTION.value;
    return (
      filterableOptions.find((opt) => opt.value === value) ||
      ALL_ENTITIES_OPTION
    );
  }, [filterableOptions, entityTypeParam]);

  const selectedRole = React.useMemo(
    () =>
      roleParam && roles
        ? roles.find(
            (r) =>
              r.role_name === roleParam &&
              (!entityParam || r.entity_name === entityParam)
          )
        : undefined,
    [roleParam, entityParam, roles]
  );

  const actionHandler = (
    action: IAMAction,
    username?: string,
    role?: string,
    entity?: string
  ) => {
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ENTITIES_URL
        : USER_ENTITIES_URL,
      search: (prev) => ({
        ...prev,
        action,
        username,
        role,
        entity,
      }),
    });
  };

  const handleChangeRole = (role: EntitiesRole) => {
    setDrawerMode('change-role-for-entity');
    actionHandler(
      'change-role-for-entity',
      undefined,
      role.role_name,
      role.entity_name
    );
  };

  const handleRemoveAssignment = (role: EntitiesRole) => {
    actionHandler('remove-entity', undefined, role.role_name, role.entity_name);
  };

  const clearDialogAction = (expectedAction?: IAMAction) => {
    // Both overlays share the same `action` search param. Guard ensures a close
    // event from one overlay cannot wipe the other's URL state.
    if (expectedAction && action !== expectedAction) {
      return;
    }

    // Only clear `action` here so modal bodies keep `role`/`entity` during the
    // exit animation. Remaining params are cleared in `clearDialogParams`.
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ENTITIES_URL
        : USER_ENTITIES_URL,
      search: (prev) => ({
        ...prev,
        action: undefined,
      }),
    });
  };

  const clearDialogParams = () => {
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ENTITIES_URL
        : USER_ENTITIES_URL,
      search: (prev) => ({
        ...prev,
        role: undefined,
        username: undefined,
        entity: undefined,
      }),
    });
  };

  const closeDrawer = (expectedAction: IAMAction) => {
    if (expectedAction && action !== expectedAction) {
      return;
    }

    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ENTITIES_URL
        : USER_ENTITIES_URL,
      search: (prev) => ({
        ...prev,
        action: undefined,
        role: undefined,
        username: undefined,
        entity: undefined,
      }),
    });
  };

  const isRolesLoading = loading || entitiesLoading;

  const filteredRoles = getFilteredRoles({
    entityType: entityTypeParam ?? 'all',
    getSearchableFields,
    query: appliedQuery,
    roles,
  }) as EntitiesRole[];

  const filteredAndSortedRoles = [...filteredRoles].sort((a, b) => {
    const aValue = a[orderBy]?.toLowerCase();
    const bValue = b[orderBy]?.toLowerCase();

    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const pagination = usePagination({
    currentRoute: isDefaultDelegationRolesForChildAccount
      ? DEFAULTS_ENTITIES_URL
      : USER_ENTITIES_URL,
    initialPage: 1,
    preferenceKey: ENTITIES_TABLE_PREFERENCE_KEY,
    clientSidePaginationData: filteredAndSortedRoles,
  });

  const filteredAndSortedRolesCount = React.useMemo(() => {
    return filteredAndSortedRoles.length;
  }, [filteredAndSortedRoles]);

  const onSearch = React.useCallback(
    (value: string) => {
      navigate({
        to: isDefaultDelegationRolesForChildAccount
          ? DEFAULTS_ENTITIES_URL
          : USER_ENTITIES_URL,
        params:
          isDefaultDelegationRolesForChildAccount && !username
            ? undefined
            : username,
        search: (prev) => ({
          ...prev,
          page: 1,
          query: value !== '' ? value : undefined,
        }),
      });
    },
    [navigate, isDefaultDelegationRolesForChildAccount, username]
  );

  return (
    <>
      <Box
        direction="row"
        spacing={1}
        style={{
          justifyContent: 'flex-start',
          marginBottom: Spacing.S12,
        }}
      >
        <FormField
          labelPosition="top"
          style={{ padding: 0, marginRight: Spacing.S16 }}
        >
          <FormLabel
            className={globalStyles.visuallyHidden}
            htmlFor="filter-entities"
            slot="label"
          >
            Search Entities
          </FormLabel>
          <DebouncedSearchField
            id="filter-entities"
            onSearch={onSearch}
            placeholder="Search"
            value={appliedQuery}
          />
        </FormField>
        <Select
          items={filterableOptions}
          onChange={(event) => {
            const selected = event.detail as unknown as null | SelectOption;
            const nextEntityType = (selected?.value ??
              ALL_ENTITIES_OPTION.value) as 'all' | EntityType;

            navigate({
              to: isDefaultDelegationRolesForChildAccount
                ? DEFAULTS_ENTITIES_URL
                : USER_ENTITIES_URL,
              params:
                isDefaultDelegationRolesForChildAccount && !username
                  ? undefined
                  : username,
              search: (prev) => ({
                ...prev,
                page: 1,
                entityType: nextEntityType,
              }),
            });
          }}
          placeholder="All Entities"
          selected={selectedEntityTypeOption}
          style={{ flex: '0 0 250px' }}
          valueFn={(item) => (item as SelectOption).label}
        />
      </Box>
      <Table aria-label="Assigned Entities">
        <AssignedEntitiesTableHead
          handleOrderChange={handleOrderChange}
          order={order}
          orderBy={orderBy}
        />
        <TableBody>
          <AssignedEntitiesTableBody
            assignedRoles={assignedRoles}
            entities={entities}
            entitiesError={entitiesError}
            entitiesLoading={entitiesLoading}
            error={error}
            filteredRoles={filteredRoles}
            handleChangeRole={handleChangeRole}
            handleRemoveAssignment={handleRemoveAssignment}
            loading={loading}
            paginatedData={pagination.paginatedData}
            permissions={permissions}
          />
        </TableBody>
      </Table>
      <ChangeRoleForEntityDrawer
        isRolesLoading={isRolesLoading}
        mode={drawerMode}
        onClose={() => closeDrawer('change-role-for-entity')}
        open={action === 'change-role-for-entity'}
        role={selectedRole}
        username={username}
      />
      <RemoveAssignmentConfirmationDialog
        isRolesLoading={isRolesLoading}
        onClose={() => clearDialogAction('remove-entity')}
        onExited={clearDialogParams}
        open={action === 'remove-entity'}
        role={selectedRole}
        username={username}
      />
      {filteredAndSortedRolesCount > MIN_PAGE_SIZE && (
        <Pagination
          count={filteredAndSortedRolesCount}
          onPageChange={(e: CustomEvent<number>) =>
            pagination.handlePageChange(Number(e.detail))
          }
          onPageSizeChange={(
            e: CustomEvent<{ page: number; pageSize: number }>
          ) => pagination.handlePageSizeChange(Number(e.detail.pageSize))}
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageSizes={[MIN_PAGE_SIZE, 50, 75, 100]}
          style={{ borderBottom: 0 }}
        />
      )}
    </>
  );
};
