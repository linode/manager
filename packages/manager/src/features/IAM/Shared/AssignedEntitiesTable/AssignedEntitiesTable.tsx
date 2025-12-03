import {
  iamQueries,
  useGetDefaultDelegationAccessQuery,
  useQueries,
  useUserRoles,
} from '@linode/queries';
import { Select, Typography, useTheme } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useSearch } from '@tanstack/react-router';
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

export const AssignedEntitiesTable = ({ username }: Props) => {
  const theme = useTheme();
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
  ]);

  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const { selectedRole: selectedRoleSearchParam } = useSearch({
    strict: false,
  });

  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<OrderByKeys>('entity_name');

  const pagination = usePaginationV2({
    currentRoute: isDefaultDelegationRolesForChildAccount
      ? '/iam/roles/defaults/entity-access'
      : `/iam/users/$username/entities`,
    initialPage: 1,
    preferenceKey: ENTITIES_TABLE_PREFERENCE_KEY,
  });

  const handleOrderChange = (newOrderBy: OrderByKeys) => {
    if (orderBy === newOrderBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(newOrderBy);
      setOrder('asc');
    }
  };

  const [query, setQuery] = React.useState(selectedRoleSearchParam ?? '');

  const [entityType, setEntityType] = React.useState<null | SelectOption>(
    ALL_ENTITIES_OPTION
  );

  const [drawerMode, setDrawerMode] =
    React.useState<DrawerModes>('assign-role');

  const [isChangeRoleForEntityDrawerOpen, setIsChangeRoleForEntityDrawerOpen] =
    React.useState<boolean>(false);
  const [selectedRole, setSelectedRole] = React.useState<EntitiesRole>();

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

  const entityTypes = React.useMemo(() => {
    return assignedUserRoles?.entity_access.map((entity) => entity.type) ?? [];
  }, [assignedUserRoles]);
  const entityQueries = useQueries({
    queries: entityTypes.map((type) => ({
      ...iamQueries.user(username ?? '')._ctx.allUserEntities(type),
      enabled: !!username,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const {
    entities,
    isLoading: entitiesLoading,
    error: entitiesError,
  } = React.useMemo(() => {
    const isLoading = entityQueries.some((q) => q.isLoading);
    const error = entityQueries.some((q) => q.error);

    if (isLoading) {
      return { entities: undefined, isLoading: true };
    }

    const entities = entityQueries.map((q) => q.data || []).flat();

    return { entities, error, isLoading: false };
  }, [entityQueries]);

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

  const handleRemoveAssignmentDialogClose = () => {
    setIsRemoveAssignmentDialogOpen(false);
    // If we just deleted the last one on a page, reset to the first page.
    const removedLastOnPage =
      filteredAndSortedRoles.length % pagination.pageSize === 1;
    if (removedLastOnPage) {
      pagination.handlePageChange(1);
    }
  };

  const filteredRoles = getFilteredRoles({
    entityType: entityType?.value as 'all' | EntityType,
    getSearchableFields,
    query,
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

  const renderTableBody = () => {
    if (entitiesLoading || loading) {
      return <TableRowLoading columns={3} rows={1} />;
    }

    if (entitiesError || error) {
      return (
        <TableRowError
          colSpan={3}
          message="Unable to load the assigned entities. Please try again."
        />
      );
    }

    if (!entities || !assignedRoles || filteredRoles.length === 0) {
      return <TableRowEmpty colSpan={3} message={'No items to display.'} />;
    }

    if (assignedRoles && entities) {
      return (
        <>
          {filteredAndSortedRoles
            .slice(
              (pagination.page - 1) * pagination.pageSize,
              pagination.page * pagination.pageSize
            )
            .map((el: EntitiesRole) => {
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
                  title: 'Remove Assignment',
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
            pagination.handlePageChange(1);
            setQuery(value);
          }}
          placeholder="Search"
          sx={{ height: 34 }}
          value={query}
        />
        <Select
          hideLabel
          label="Select type"
          onChange={(_, selected) => {
            pagination.handlePageChange(1);
            setEntityType(selected ?? null);
          }}
          options={filterableOptions}
          placeholder="All Entities"
          sx={{ minWidth: 250 }}
          value={entityType}
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
        onClose={() => setIsChangeRoleForEntityDrawerOpen(false)}
        open={isChangeRoleForEntityDrawerOpen}
        role={selectedRole}
        username={username}
      />
      <RemoveAssignmentConfirmationDialog
        onClose={() => handleRemoveAssignmentDialogClose()}
        open={isRemoveAssignmentDialogOpen}
        role={selectedRole}
        username={username}
      />
      {filteredRoles.length > PAGE_SIZES[0] && (
        <PaginationFooter
          count={filteredRoles.length}
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      )}
    </Grid>
  );
};
