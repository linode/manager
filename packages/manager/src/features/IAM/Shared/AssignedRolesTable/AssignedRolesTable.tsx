import {
  Button,
  FormField,
  FormLabel,
  Icon,
  Pagination,
  Select,
  Table,
  TableBody,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import {
  useAccountRoles,
  useGetDefaultDelegationAccessQuery,
  useUserRoles,
} from '@linode/queries';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router';
import React from 'react';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { usePagination } from '../../hooks/usePagination';
import { usePermissions } from '../../hooks/usePermissions';
import { useAllAccountEntities } from '../../queries/entities/entities';
import { AssignNewRoleDrawer } from '../../Users/UserRoles/AssignNewRoleDrawer';
import { Box } from '../Box/Box';
import { CircleProgress } from '../CircleProgress/CircleProgress';
import {
  ASSIGNED_ROLES_TABLE_PREFERENCE_KEY,
  IAM_ROLES_PENDO_IDS,
} from '../constants';
import { DebouncedSearchField } from '../DebouncedSearchField/DebouncedSearchField';
import globalStyles from '../global.module.css';
import { RemoveAssignmentConfirmationDialog } from '../RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog';
import {
  getFilteredRoles,
  groupAccountEntitiesByType,
  mapEntityTypesForSelect,
} from '../utilities';
import { AssignedRolesTableBody } from './AssignedRolesTableBody';
import { AssignedRolesTableHead } from './AssignedRolesTableHead';
import { ChangeRoleDrawer } from './ChangeRoleDrawer';
import { UnassignRoleConfirmationDialog } from './UnassignRoleConfirmationDialog';
import { UpdateEntitiesDrawer } from './UpdateEntitiesDrawer';
import {
  addEntitiesNamesToRoles,
  combineRoles,
  getSearchableFields,
  mapRolesToPermissions,
} from './utils';

import type { IAMAction } from '../../routes';
import type {
  CombinedEntity,
  DrawerModes,
  EntitiesRole,
  ExtendedRoleView,
  RoleView,
  SelectOption,
} from '../types';
import type {
  AccessType,
  AccountRoleType,
  EntityRoleType,
} from '@linode/api-v4';

type OrderByKeys = 'name';

const ALL_ROLES_OPTION: SelectOption = {
  label: 'All Assigned Roles',
  value: 'all',
};

const DEFAULTS_ROLES_URL = '/iam/roles/defaults/roles';
const USER_ROLES_URL = '/iam/users/$username/roles';
const MIN_PAGE_SIZE = 25;

/** Snapshot passed via router location state so overlays survive list updates. */
type AssignedRolesLocationState = {
  overlayEntity?: CombinedEntity;
  overlayRole?: ExtendedRoleView;
};

export const AssignedRolesTable = () => {
  const { username } = useParams({ strict: false });
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as AssignedRolesLocationState;

  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const {
    action,
    entity: entityParam,
    query: queryParam,
    role: roleParam,
    roleType: roleTypeParam,
    order: orderParam,
  } = useSearch({
    from: isDefaultDelegationRolesForChildAccount
      ? DEFAULTS_ROLES_URL
      : USER_ROLES_URL,
  });
  const order: 'asc' | 'desc' = orderParam ?? 'asc';
  const orderBy: OrderByKeys = 'name';
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
  ]);

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

  const { data: defaultRolesData, isLoading: defaultRolesLoading } =
    useGetDefaultDelegationAccessQuery({
      enabled: isDefaultDelegationRolesForChildAccount,
    });

  const { data: userRolesData, isLoading: userRolesLoading } = useUserRoles(
    username ?? '',
    !isDefaultDelegationRolesForChildAccount
  );

  const assignedRoles = isDefaultDelegationRolesForChildAccount
    ? defaultRolesData
    : userRolesData;
  const assignedRolesLoading = isDefaultDelegationRolesForChildAccount
    ? defaultRolesLoading
    : userRolesLoading;

  const handleOrderChange = (newOrderBy: OrderByKeys) => {
    const nextOrder: 'asc' | 'desc' =
      orderBy === newOrderBy ? (order === 'asc' ? 'desc' : 'asc') : 'asc';
    setIsInitialLoad(false);
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ROLES_URL
        : USER_ROLES_URL,
      params:
        isDefaultDelegationRolesForChildAccount && !username
          ? undefined
          : username,
      search: (prev) => ({
        ...prev,
        order: nextOrder,
        orderBy: newOrderBy,
      }),
    });
  };

  const [drawerMode, setDrawerMode] =
    React.useState<DrawerModes>('assign-role');

  const { data: accountRoles, isLoading: accountPermissionsLoading } =
    useAccountRoles();
  const { data: entities, isLoading: entitiesLoading } = useAllAccountEntities(
    {}
  );

  const { filterableOptions, roles } = React.useMemo(() => {
    if (!assignedRoles || !accountRoles) {
      return { filterableOptions: [], roles: [] };
    }

    const userRoles = combineRoles(assignedRoles);
    let roles = mapRolesToPermissions(accountRoles, userRoles);

    const filterableOptions = [
      ALL_ROLES_OPTION,
      ...mapEntityTypesForSelect(roles, ' Roles'),
    ];

    if (entities) {
      const transformedEntities = groupAccountEntitiesByType(entities);

      roles = addEntitiesNamesToRoles(roles, transformedEntities);
    }

    return { filterableOptions, roles };
  }, [assignedRoles, accountRoles, entities]);

  const selectedEntityTypeOption = React.useMemo<null | SelectOption>(() => {
    const value = roleTypeParam ?? ALL_ROLES_OPTION.value;
    return (
      filterableOptions.find((opt) => opt.value === value) || ALL_ROLES_OPTION
    );
  }, [filterableOptions, roleTypeParam]);

  const handleViewEntities = (roleName: AccountRoleType | EntityRoleType) => {
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? '/iam/roles/defaults/entity-access'
        : '/iam/users/$username/entities',
      params: { username: username || '' },
      search: { selectedRole: roleName },
    });
  };

  const filteredAndSortedRoles = React.useMemo(() => {
    const rolesToFilter = getFilteredRoles({
      entityType: roleTypeParam ?? 'all',
      getSearchableFields,
      query: queryParam ?? '',
      roles,
    }) as RoleView[];

    return [...rolesToFilter].sort((a, b) => {
      if (isInitialLoad && a.access !== b.access) {
        return a.access === 'account_access' ? -1 : 1;
      }

      if (a[orderBy] < b[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [roles, queryParam, roleTypeParam, order, orderBy, isInitialLoad]);

  const pagination = usePagination({
    currentRoute: isDefaultDelegationRolesForChildAccount
      ? DEFAULTS_ROLES_URL
      : USER_ROLES_URL,
    initialPage: 1,
    preferenceKey: ASSIGNED_ROLES_TABLE_PREFERENCE_KEY,
    clientSidePaginationData: filteredAndSortedRoles,
  });

  const filteredAndSortedRolesCount = filteredAndSortedRoles.length;

  const onSearch = React.useCallback(
    (value: string) => {
      navigate({
        to: isDefaultDelegationRolesForChildAccount
          ? DEFAULTS_ROLES_URL
          : USER_ROLES_URL,
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

  const actionHandler = (
    nextAction: IAMAction,
    options?: {
      entity?: string;
      overlayEntity?: CombinedEntity;
      overlayRole?: ExtendedRoleView;
      role?: string;
      username?: string;
    }
  ) => {
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ROLES_URL
        : USER_ROLES_URL,
      search: (prev) => ({
        ...prev,
        action: nextAction,
        username: options?.username,
        role: options?.role,
        entity: options?.entity,
      }),
      state: (prev) => ({
        ...prev,
        overlayRole: options?.overlayRole,
        overlayEntity: options?.overlayEntity,
      }),
    });
  };

  // Prefer the location-state snapshot (set when opening). Fall back to a list
  // lookup for deep links / refresh where history state is empty.
  const selectedRole =
    locationState.overlayRole?.name === roleParam
      ? locationState.overlayRole
      : roleParam && roles
        ? roles.find((r) => r.name === roleParam)
        : undefined;

  const selectedEntity = React.useMemo<CombinedEntity | undefined>(() => {
    if (
      locationState.overlayEntity?.name === entityParam &&
      locationState.overlayEntity
    ) {
      return locationState.overlayEntity;
    }
    if (!entityParam || !entities) return undefined;
    const e = entities.find((entity) => entity.label === entityParam);
    return e ? { id: e.id, name: e.label } : undefined;
  }, [entityParam, entities, locationState.overlayEntity]);

  const handleAssignNewRoles = () => {
    actionHandler('assign-new-roles');
  };

  const handleChangeRole = (role: ExtendedRoleView) => {
    actionHandler('change-role', { role: role.name, overlayRole: role });
    setDrawerMode('change-role');
  };

  const handleUnassignRole = (role: ExtendedRoleView) => {
    actionHandler('unassign-role', { role: role.name, overlayRole: role });
  };

  const handleUpdateEntities = (role: ExtendedRoleView) => {
    actionHandler('update-entities', { role: role.name, overlayRole: role });
  };

  const handleRemoveAssignment = (
    entity: CombinedEntity,
    role: ExtendedRoleView
  ) => {
    actionHandler('remove-entity', {
      role: role.name,
      entity: entity.name,
      overlayRole: role,
      overlayEntity: entity,
    });
  };

  const clearDialogAction = (expectedAction?: IAMAction) => {
    // Both overlays share the same `action` search param. Guard ensures a close
    // event from one overlay cannot wipe the other's URL state.
    if (expectedAction && action !== expectedAction) {
      return;
    }

    // Only clear `action` here so URL `role`/`entity` and location-state
    // snapshots remain during the exit animation. Cleared in `clearDialogParams`.
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ROLES_URL
        : USER_ROLES_URL,
      search: (prev) => ({
        ...prev,
        action: undefined,
      }),
      // navigate() without state replaces history state with {} — keep snapshot.
      state: (prev) => prev,
    });
  };

  const clearDialogParams = () => {
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ROLES_URL
        : USER_ROLES_URL,
      search: (prev) => ({
        ...prev,
        role: undefined,
        username: undefined,
        entity: undefined,
      }),
      state: (prev) => ({
        ...prev,
        overlayRole: undefined,
        overlayEntity: undefined,
      }),
    });
  };

  const closeDrawer = (expectedAction: IAMAction) => {
    if (expectedAction && action !== expectedAction) {
      return;
    }

    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ROLES_URL
        : USER_ROLES_URL,
      search: (prev) => ({
        ...prev,
        action: undefined,
        role: undefined,
        username: undefined,
        entity: undefined,
      }),
      state: (prev) => ({
        ...prev,
        overlayRole: undefined,
        overlayEntity: undefined,
      }),
    });
  };

  const isRolesLoading =
    assignedRolesLoading || accountPermissionsLoading || entitiesLoading;

  let selectedRoleDetails: EntitiesRole | undefined;

  if (selectedRole && selectedEntity) {
    selectedRoleDetails = {
      access: 'entity_access',
      entity_id: selectedEntity.id,
      entity_name: selectedEntity.name,
      entity_type: selectedRole.entity_type,
      id: selectedRole.id,
      role_name: selectedRole.name as EntityRoleType,
    };
  }

  const rolesPermissions = {
    is_account_admin: permissions?.is_account_admin ?? false,
    update_default_delegate_access:
      permissions?.update_default_delegate_access ?? false,
  };

  return (
    <>
      {isRolesLoading ? (
        <CircleProgress />
      ) : (
        <>
          <Box
            direction="row"
            spacing={1}
            style={{
              justifyContent: 'space-between',
              marginBottom: Spacing.S12,
            }}
          >
            <Box direction="row" spacing={1}>
              <FormField
                labelPosition="top"
                style={{ padding: 0, marginRight: Spacing.S16 }}
              >
                <FormLabel
                  className={globalStyles.visuallyHidden}
                  htmlFor="filter-roles"
                  slot="label"
                >
                  Search Roles
                </FormLabel>
                <DebouncedSearchField
                  id="filter-roles"
                  onSearch={onSearch}
                  placeholder="Search"
                  value={queryParam ?? ''}
                />
              </FormField>
              <Select
                items={filterableOptions}
                onChange={(event) => {
                  const selected =
                    event.detail as unknown as null | SelectOption;
                  const nextRoleType = (selected?.value ??
                    ALL_ROLES_OPTION.value) as 'all' | AccessType;

                  navigate({
                    to: isDefaultDelegationRolesForChildAccount
                      ? DEFAULTS_ROLES_URL
                      : USER_ROLES_URL,
                    params: isDefaultDelegationRolesForChildAccount
                      ? undefined
                      : { username: username || '' },
                    search: (prev) => ({
                      ...prev,
                      page: 1,
                      roleType: nextRoleType,
                    }),
                  });
                }}
                placeholder="All Assigned Roles"
                selected={selectedEntityTypeOption}
                style={{ minWidth: 250, maxWidth: 362 }}
                valueFn={(item) => (item as SelectOption).label}
              />
            </Box>
            <Tooltip
              disabled={permissionToCheck}
              tooltipPlacement="bottom"
              tooltipText={
                !permissionToCheck
                  ? 'You do not have permission to assign roles.'
                  : undefined
              }
            >
              <Button
                data-pendo-id={
                  isDefaultDelegationRolesForChildAccount
                    ? IAM_ROLES_PENDO_IDS.addNewDefaultRoles
                    : undefined
                }
                disabled={!permissionToCheck}
                onClick={handleAssignNewRoles}
                variant="primary"
              >
                {isDefaultDelegationRolesForChildAccount
                  ? 'Add New Default Roles'
                  : 'Assign New Roles'}
                {!permissionToCheck && <Icon icon="info-outline" size="m" />}
              </Button>
            </Tooltip>
          </Box>
          <Table aria-label="collapsible table">
            <AssignedRolesTableHead
              handleOrderChange={handleOrderChange}
              order={order}
              orderBy={orderBy}
            />
            <TableBody>
              <AssignedRolesTableBody
                handleChangeRole={handleChangeRole}
                handleRemoveAssignment={handleRemoveAssignment}
                handleUnassignRole={handleUnassignRole}
                handleUpdateEntities={handleUpdateEntities}
                handleViewEntities={handleViewEntities}
                paginatedData={pagination.paginatedData}
                permissions={rolesPermissions}
              />
            </TableBody>
          </Table>
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
              style={{ border: 0 }}
            />
          )}
        </>
      )}
      <AssignNewRoleDrawer
        assignedRoles={assignedRoles}
        onClose={() => closeDrawer('assign-new-roles')}
        open={action === 'assign-new-roles'}
      />
      <ChangeRoleDrawer
        isRolesLoading={isRolesLoading}
        mode={drawerMode}
        onClose={() => closeDrawer('change-role')}
        open={action === 'change-role'}
        role={selectedRole}
      />
      <UnassignRoleConfirmationDialog
        isRolesLoading={isRolesLoading}
        onClose={() => clearDialogAction('unassign-role')}
        onExited={clearDialogParams}
        open={action === 'unassign-role'}
        role={selectedRole}
      />
      <UpdateEntitiesDrawer
        isRolesLoading={isRolesLoading}
        onClose={() => closeDrawer('update-entities')}
        open={action === 'update-entities'}
        role={selectedRole}
      />
      <RemoveAssignmentConfirmationDialog
        isRolesLoading={isRolesLoading}
        onClose={() => clearDialogAction('remove-entity')}
        onExited={clearDialogParams}
        open={action === 'remove-entity'}
        role={selectedRoleDetails}
        username={username}
      />
    </>
  );
};
