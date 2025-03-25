import { Autocomplete, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { Grid } from '@mui/material';
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

import {
  getFilteredRoles,
  mapEntityTypes,
  transformedAccountEntities,
} from '../../Shared/utilities';

import type {
  EntitiesRole,
  EntitiesType,
  IamAccountEntity,
} from '../../Shared/utilities';
import type {
  AccountEntity,
  EntityAccess,
  IamUserPermissions,
  RoleType,
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
    const transformedEntities = transformedAccountEntities(entities);

    const roles = addEntityNamesToRoles(assignedRoles, transformedEntities);

    const entityTypes = getEntityTypes(roles);

    return { entityTypes, roles };
  }, [assignedRoles, entities]);

  const actions: Action[] = [
    {
      onClick: () => {
        // mock
      },
      title: 'Change Role ',
    },
    {
      onClick: () => {
        // mock
      },
      title: 'Remove Assignment',
    },
  ];

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
          {filteredRoles.map((el: EntitiesRole) => (
            <TableRow key={el.id}>
              <TableCell>
                <Typography>{el.resource_name}</Typography>
              </TableCell>
              <TableCell sx={{ display: { sm: 'table-cell', xs: 'none' } }}>
                <Typography>{capitalize(el.entity_type)}</Typography>
              </TableCell>
              <TableCell sx={{ display: { sm: 'table-cell', xs: 'none' } }}>
                <Typography>{el.role_name}</Typography>
              </TableCell>
              <TableCell actionCell>
                <ActionMenu actionsList={actions} ariaLabel="action menu" />
              </TableCell>
            </TableRow>
          ))}
        </>
      );
    }

    return null;
  };

  return (
    <Grid>
      <Grid
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: 3,
        }}
        container
        direction="row"
      >
        <DebouncedSearchTextField
          containerProps={{
            sx: {
              marginBottom: { md: 0, xs: 2 },
              marginRight: { md: 2, xs: 0 },
              width: { md: '410px', xs: '100%' },
            },
          }}
          clearable
          hideLabel
          label="Filter"
          onSearch={setQuery}
          placeholder="Search"
          sx={{ height: 34 }}
          value={query}
        />
        <Autocomplete
          textFieldProps={{
            containerProps: { sx: { minWidth: 250 } },
            hideLabel: true,
          }}
          label="Select type"
          onChange={(_, selected) => setEntityType(selected ?? null)}
          options={entityTypes}
          placeholder="All Assigned Entities"
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
    </Grid>
  );
};

const getEntityTypes = (data: EntitiesRole[]): EntitiesType[] =>
  mapEntityTypes(data, 's');

const addEntityNamesToRoles = (
  assignedRoles: IamUserPermissions,
  entities: IamAccountEntity[]
): EntitiesRole[] => {
  const entitiesRoles = assignedRoles.entity_access;

  return entitiesRoles.flatMap((entityRole: EntityAccess) => {
    const entityByType = entities.find((r) => r.type === entityRole.type);

    if (entityByType) {
      const entity = entityByType.entities.find(
        (res: AccountEntity) => res.id === entityRole.id
      );

      if (entity) {
        return entityRole.roles.map((r: RoleType) => ({
          entity_type: entityRole.type,
          id: `${r}-${entityRole.id}`,
          resource_id: entityRole.id,
          resource_name: entity.label,
          role_name: r,
        }));
      }
    }

    return [];
  });
};

const getSearchableFields = (role: EntitiesRole): string[] => [
  String(role.resource_id),
  role.resource_name,
  role.entity_type,
  role.role_name,
];
