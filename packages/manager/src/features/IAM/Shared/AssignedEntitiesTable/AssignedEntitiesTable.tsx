import {
  useGetDefaultDelegationAccessQuery,
  useUserRoles,
} from '@linode/queries';
import { Select, Typography, useTheme } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { PAGE_SIZES } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useAllAccountEntities } from 'src/queries/entities/entities';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { usePermissions } from '../../hooks/usePermissions';
import {
  addEntityNamesToRoles,
  getSearchableFields,
} from '../../Users/UserEntities/utils';
import { ENTITIES_TABLE_PREFERENCE_KEY } from '../constants';
import { RemoveAssignmentConfirmationDialog } from '../RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog';
import {
  getFilteredRoles,
  getFormattedEntityType,
  groupAccountEntitiesByType,
  mapEntityTypesForSelect,
} from '../utilities';
import { ChangeRoleForEntityDrawer } from './ChangeRoleForEntityDrawer';

import type { DrawerModes, EntitiesRole } from '../types';
import type { EntityType } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

const ALL_ENTITIES_OPTION: SelectOption = {
  label: 'All Entities',
  value: 'all',
};

type OrderByKeys = 'entity_name' | 'entity_type' | 'role_name';

interface Props {
  username?: string;
}

const DEFAULTS_ENTITIES_URL = '/iam/roles/defaults/entity-access';
const USER_ENTITIES_URL = '/iam/users/$username/entities';

export const AssignedEntitiesTable = ({ username }: Props) => {
  const theme = useTheme();
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
    'list_entities',
  ]);
  const navigate = useNavigate();

  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const {
    query: queryParam,
    entityType: entityTypeParam,
    order: orderParam,
    selectedRole: selectedRoleSearchParam,
    orderBy: orderByParam,
  } = useSearch({
    from: isDefaultDelegationRolesForChildAccount
      ? DEFAULTS_ENTITIES_URL
      : USER_ENTITIES_URL,
  });

  const order: 'asc' | 'desc' = orderParam === 'desc' ? 'desc' : 'asc';
  const ORDERABLE_KEYS = ['entity_name', 'entity_type', 'role_name'] as const;
  const isValidOrderBy = (v: unknown): v is OrderByKeys =>
    ORDERABLE_KEYS.includes(v as OrderByKeys);
  const orderBy: OrderByKeys = isValidOrderBy(orderByParam)
    ? orderByParam
    : 'entity_name';

  const handleOrderChange = (newOrderBy: OrderByKeys) => {
    const nextOrder: 'asc' | 'desc' =
      orderBy === newOrderBy ? (order === 'asc' ? 'desc' : 'asc') : 'asc';
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ENTITIES_URL
        : USER_ENTITIES_URL,
      params: isDefaultDelegationRolesForChildAccount
        ? undefined
        : { username: username || '' },
      search: (prev) => ({
        ...prev,
        order: nextOrder,
        orderBy: newOrderBy,
      }),
    });
  };

  // Use the router `query` param, falling back to `selectedRole` for initial value
  const appliedQuery = queryParam ?? selectedRoleSearchParam ?? '';

  const [drawerMode, setDrawerMode] =
    React.useState<DrawerModes>('assign-role');

  const [isChangeRoleForEntityDrawerOpen, setIsChangeRoleForEntityDrawerOpen] =
    React.useState<boolean>(false);
  const [selectedRole, setSelectedRole] = React.useState<EntitiesRole>();

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

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

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

  const handleChangeRole = (role: EntitiesRole, mode: DrawerModes) => {
    setIsChangeRoleForEntityDrawerOpen(true);
    setSelectedRole(role);
    setDrawerMode(mode);
  };
  const [isRemoveAssignmentDialogOpen, setIsRemoveAssignmentDialogOpen] =
    React.useState<boolean>(false);

  const handleRemoveAssignment = (role: EntitiesRole) => {
    setIsRemoveAssignmentDialogOpen(true);
    setSelectedRole(role);
  };

  /**
   * Closes the appropriate assignment-related dialog and adjusts pagination if needed.
   *
   * @param drawerMode Optional mode indicating which dialog should be closed.
   */
  const handleDialogClose = (drawerMode?: DrawerModes) => {
    if (drawerMode && drawerMode === 'change-role-for-entity') {
      setIsChangeRoleForEntityDrawerOpen(false);
    } else {
      setIsRemoveAssignmentDialogOpen(false);
    }
  };

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

  const pagination = usePaginationV2({
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

  const renderTableBody = () => {
    if (entitiesLoading || loading) {
      return <TableRowLoading columns={4} rows={1} />;
    }

    if (entitiesError || error) {
      return (
        <TableRowError
          colSpan={4}
          message="Unable to load the assigned entities. Please try again."
        />
      );
    }

    if (!entities || !assignedRoles || filteredRoles.length === 0) {
      return <TableRowEmpty colSpan={4} message={'No items to display.'} />;
    }

    if (assignedRoles && entities) {
      return (
        <>
          {pagination.paginatedData.map((el: EntitiesRole) => {
            const actions: Action[] = [
              {
                disabled: !permissionToCheck,
                onClick: () => {
                  handleChangeRole(el, 'change-role-for-entity');
                },
                title: 'Change Role',
                tooltip: !permissionToCheck
                  ? 'You do not have permission to change this role.'
                  : undefined,
              },
              {
                disabled: !permissionToCheck,
                onClick: () => {
                  handleRemoveAssignment(el);
                },
                title: isDefaultDelegationRolesForChildAccount
                  ? 'Remove'
                  : 'Remove Assignment',
                tooltip: !permissionToCheck
                  ? 'You do not have permission to remove this assignment.'
                  : undefined,
              },
            ];

            return (
              <TableRow key={el.id}>
                <TableCell>
                  <Typography>{el.entity_name}</Typography>
                </TableCell>
                <TableCell sx={{ display: { sm: 'table-cell', xs: 'none' } }}>
                  <Typography>
                    {getFormattedEntityType(el.entity_type)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { sm: 'table-cell', xs: 'none' } }}>
                  <Typography>{el.role_name}</Typography>
                </TableCell>
                <TableCell actionCell>
                  <ActionMenu
                    actionsList={actions}
                    ariaLabel={`Action menu for entity ${el.entity_name}`}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </>
      );
    }

    return null;
  };

  return (
    <Grid>
      <Grid
        container
        direction="row"
        rowSpacing={1}
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: theme.tokens.spacing.S12,
          minHeight: theme.spacingFunction(40),
        }}
      >
        <DebouncedSearchTextField
          clearable
          containerProps={{
            sx: {
              marginRight: { md: 2, xs: 0 },
              width: { md: '416px', xs: '100%' },
            },
          }}
          debounceTime={250}
          hideLabel
          label="Filter"
          onSearch={(value) => {
            navigate({
              to: isDefaultDelegationRolesForChildAccount
                ? DEFAULTS_ENTITIES_URL
                : USER_ENTITIES_URL,
              params: isDefaultDelegationRolesForChildAccount
                ? undefined
                : { username: username || '' },
              search: (prev) => ({
                ...prev,
                page: 1,
                query: value !== '' ? value : undefined,
              }),
            });
          }}
          placeholder="Search"
          sx={{ height: 34 }}
          value={appliedQuery}
        />
        <Select
          hideLabel
          label="Select type"
          onChange={(_, selected) => {
            const nextEntityType = (selected?.value ??
              ALL_ENTITIES_OPTION.value) as 'all' | EntityType;
            navigate({
              to: isDefaultDelegationRolesForChildAccount
                ? DEFAULTS_ENTITIES_URL
                : USER_ENTITIES_URL,
              params: isDefaultDelegationRolesForChildAccount
                ? undefined
                : { username: username || '' },
              search: (prev) => ({
                ...prev,
                page: 1,
                entityType: nextEntityType,
              }),
            });
          }}
          options={filterableOptions}
          placeholder="All Entities"
          sx={{ minWidth: 250 }}
          value={selectedEntityTypeOption}
        />
      </Grid>
      <Table aria-label="Assigned Entities">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'entity_name'}
              direction={order}
              handleClick={() => handleOrderChange('entity_name')}
              label="entity"
              style={{ width: '35%' }}
            >
              Entity
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'entity_type'}
              direction={order}
              handleClick={() => handleOrderChange('entity_type')}
              label="entityType"
              style={{ width: '35%' }}
              sx={{ display: { sm: 'table-cell', xs: 'none' } }}
            >
              Entity Type
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'role_name'}
              direction={order}
              handleClick={() => handleOrderChange('role_name')}
              label="role"
              sx={{ display: { sm: 'table-cell', xs: 'none' } }}
            >
              Assigned Role
            </TableSortCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
      <ChangeRoleForEntityDrawer
        mode={drawerMode}
        onClose={() => handleDialogClose(drawerMode)}
        open={isChangeRoleForEntityDrawerOpen}
        role={selectedRole}
        username={username}
      />
      <RemoveAssignmentConfirmationDialog
        onClose={() => handleDialogClose()}
        open={isRemoveAssignmentDialogOpen}
        role={selectedRole}
        username={username}
      />
      {filteredAndSortedRolesCount > PAGE_SIZES[0] && (
        <PaginationFooter
          count={filteredAndSortedRolesCount}
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      )}
    </Grid>
  );
};
