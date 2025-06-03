import { Select, Typography, useTheme } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useParams, useSearch } from '@tanstack/react-router';
import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
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
import { useAccountEntities } from 'src/queries/entities/entities';
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { ENTITIES_TABLE_PREFERENCE_KEY } from '../../Shared/constants';
import { RemoveAssignmentConfirmationDialog } from '../../Shared/RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog';
import {
  getFilteredRoles,
  getFormattedEntityType,
  groupAccountEntitiesByType,
  mapEntityTypesForSelect,
} from '../../Shared/utilities';
import { ChangeRoleForEntityDrawer } from './ChangeRoleForEntityDrawer';
import { addEntityNamesToRoles, getSearchableFields } from './utils';

import type { DrawerModes, EntitiesRole } from '../../Shared/types';
import type { EntityType } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

const ALL_ENTITIES_OPTION: SelectOption = {
  label: 'All Entities',
  value: 'all',
};

type OrderByKeys = 'entity_name' | 'entity_type' | 'role_name';

export const AssignedEntitiesTable = () => {
  const { username } = useParams({
    from: '/iam/users/$username',
  });
  const theme = useTheme();

  const { selectedRole: selectedRoleSearchParam } = useSearch({
    from: '/iam/users/$username/entities',
  });

  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<OrderByKeys>('entity_name');

  const pagination = usePaginationV2({
    currentRoute: '/iam/users/$username/entities',
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
    data: entities,
    error: entitiesError,
    isLoading: entitiesLoading,
  } = useAccountEntities();

  const {
    data: assignedRoles,
    error: assignedRolesError,
    isLoading: assignedRolesLoading,
  } = useAccountUserPermissions(username ?? '');

  const { filterableOptions, roles } = React.useMemo(() => {
    if (!assignedRoles || !entities) {
      return { filterableOptions: [], roles: [] };
    }
    const transformedEntities = groupAccountEntitiesByType(entities.data);

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
    if (entitiesLoading || assignedRolesLoading) {
      return <TableRowLoading columns={3} rows={1} />;
    }

    if (entitiesError || assignedRolesError) {
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
                  onClick: () => {
                    handleChangeRole(el, 'change-role-for-entity');
                  },
                  title: 'Change Role ',
                },
                {
                  onClick: () => {
                    handleRemoveAssignment(el);
                  },
                  title: 'Remove',
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
                    <ActionMenu actionsList={actions} ariaLabel="action menu" />
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
      />
      <RemoveAssignmentConfirmationDialog
        onClose={() => setIsRemoveAssignmentDialogOpen(false)}
        open={isRemoveAssignmentDialogOpen}
        role={selectedRole}
      />
      {filteredRoles.length > pagination.pageSize && (
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
