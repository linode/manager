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
import { useOrder } from 'src/hooks/useOrder';
import { useAccountEntities } from 'src/queries/entities/entities';
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { RemoveAssignmentConfirmationDialog } from '../../Shared/RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog';
import {
  getFilteredRoles,
  getFormattedEntityType,
  mapEntityTypes,
  transformedAccountEntities,
} from '../../Shared/utilities';
import { ChangeRoleForEntityDrawer } from './ChangeRoleForEntityDrawer';

import type {
  DrawerModes,
  EntitiesRole,
  EntitiesType,
} from '../../Shared/utilities';
import type {
  AccountEntity,
  EntityAccess,
  EntityAccessRole,
  EntityType,
  IamUserPermissions,
} from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface LocationState {
  selectedRole?: string;
}

export const AssignedEntitiesTable = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();

  const locationState = location.state as LocationState;

  const { handleOrderChange, order, orderBy } = useOrder();

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
    const transformedEntities = transformedAccountEntities(entities.data);

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
    });

    if (!entities || !assignedRoles || filteredRoles.length === 0) {
      return (
        <TableRowEmpty colSpan={3} message={'No Entities are assigned.'} />
      );
    }

    if (assignedRoles && entities) {
      return (
        <>
          {filteredRoles.map((el: EntitiesRole) => {
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
              active={orderBy === 'entity'}
              direction={order}
              handleClick={handleOrderChange}
              label="entity"
            >
              Entity
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'entityType'}
              direction={order}
              handleClick={handleOrderChange}
              label="entityType"
              sx={{ display: { sm: 'table-cell', xs: 'none' } }}
            >
              Entity type
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'role'}
              direction={order}
              handleClick={handleOrderChange}
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

const getEntityTypes = (data: EntitiesRole[]): EntitiesType[] =>
  mapEntityTypes(data, 's');

const addEntityNamesToRoles = (
  assignedRoles: IamUserPermissions,
  entities: Map<EntityType, Pick<AccountEntity, 'id' | 'label'>[]>
): EntitiesRole[] => {
  const entitiesRoles = assignedRoles.entity_access;

  return entitiesRoles.flatMap((entityRole: EntityAccess) => {
    const entityByType = entities.get(entityRole.type as EntityType);

    if (entityByType) {
      const entity = entityByType.find(
        (res: AccountEntity) => res.id === entityRole.id
      );

      if (entity) {
        return entityRole.roles.map((r: EntityAccessRole) => ({
          access: 'entity_access',
          entity_id: entityRole.id,
          entity_name: entity.label,
          entity_type: entityRole.type,
          id: `${r}-${entityRole.id}`,
          role_name: r,
        }));
      }
    }

    return [];
  });
};

const getSearchableFields = (role: EntitiesRole): string[] => [
  String(role.entity_id),
  role.entity_name,
  role.entity_type,
  role.role_name,
];
