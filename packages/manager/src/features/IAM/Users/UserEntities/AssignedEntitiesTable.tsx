import { Autocomplete, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { useAccountEntities } from 'src/queries/entities/entities';
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { RemoveAssignmentConfirmationDialog } from '../../Shared/RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog';
import {
  getFilteredRoles,
  getFormattedEntityType,
  groupAccountEntitiesByType,
} from '../../Shared/utilities';
import { ChangeRoleForEntityDrawer } from './ChangeRoleForEntityDrawer';
import {
  addEntityNamesToRoles,
  getEntityTypes,
  getSearchableFields,
} from './utils';

import type {
  DrawerModes,
  EntitiesRole,
  EntitiesType,
} from '../../Shared/types';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface LocationState {
  selectedRole?: string;
}

type OrderByKeys = 'entity_name' | 'entity_type' | 'role_name';

export const AssignedEntitiesTable = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();

  const locationState = location.state as LocationState;

  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<OrderByKeys>('entity_name');

  const handleOrderChange = (newOrderBy: OrderByKeys) => {
    if (orderBy === newOrderBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(newOrderBy);
      setOrder('asc');
    }
  };

  const [query, setQuery] = React.useState(locationState?.selectedRole ?? '');

  const [entityType, setEntityType] = React.useState<EntitiesType | null>(null);

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

  const { entityTypes, roles } = React.useMemo(() => {
    if (!assignedRoles || !entities) {
      return { entityTypes: [], roles: [] };
    }
    const transformedEntities = groupAccountEntitiesByType(entities.data);

    const roles = addEntityNamesToRoles(assignedRoles, transformedEntities);

    const entityTypes = getEntityTypes(roles);

    return { entityTypes, roles };
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

    const filteredRoles = getFilteredRoles({
      entityType: entityType?.rawValue,
      getSearchableFields,
      query,
      roles,
    }) as EntitiesRole[];

    const sortedRoles = [...filteredRoles].sort((a, b) => {
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

    if (!entities || !assignedRoles || filteredRoles.length === 0) {
      return (
        <TableRowEmpty colSpan={3} message={'No Entities are assigned.'} />
      );
    }

    if (assignedRoles && entities) {
      return (
        <>
          {sortedRoles.map((el: EntitiesRole) => {
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
                title: 'Remove Assignment',
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
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: 3,
        }}
      >
        <DebouncedSearchTextField
          clearable
          containerProps={{
            sx: {
              marginBottom: { md: 0, xs: 2 },
              marginRight: { md: 2, xs: 0 },
              width: { md: '410px', xs: '100%' },
            },
          }}
          hideLabel
          label="Filter"
          onSearch={setQuery}
          placeholder="Search"
          sx={{ height: 34 }}
          value={query}
        />
        <Autocomplete
          label="Select type"
          onChange={(_, selected) => setEntityType(selected ?? null)}
          options={entityTypes}
          placeholder="All Assigned Entities"
          textFieldProps={{
            containerProps: { sx: { minWidth: 250 } },
            hideLabel: true,
          }}
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
            >
              Entity
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'entity_type'}
              direction={order}
              handleClick={() => handleOrderChange('entity_type')}
              label="entityType"
              sx={{ display: { sm: 'table-cell', xs: 'none' } }}
            >
              Entity type
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
    </Grid>
  );
};
