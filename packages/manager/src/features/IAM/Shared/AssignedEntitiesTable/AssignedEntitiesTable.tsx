import { Autocomplete, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { Grid } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

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
import { useAccountUserPermissions } from 'src/queries/iam/iam';
import { useAccountResources } from 'src/queries/resources/resources';

import { getFilteredRoles, mapEntityTypes } from '../utilities';

import type { EntitiesRole, EntitiesType } from '../utilities';
import type {
  IamAccountResource,
  IamUserPermissions,
  Resource,
  ResourceAccess,
  RoleType,
} from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export const AssignedEntitiesTable = () => {
  const { username } = useParams<{ username: string }>();

  const { handleOrderChange, order, orderBy } = useOrder();

  const [query, setQuery] = React.useState('');

  const [entityType, setEntityType] = React.useState<EntitiesType | null>(null);

  const {
    data: resources,
    error: resourcesError,
    isLoading: resourcesLoading,
  } = useAccountResources();
  const {
    data: assignedRoles,
    error: assignedRolesError,
    isLoading: assignedRolesLoading,
  } = useAccountUserPermissions(username ?? '');

  const { entityTypes, roles } = React.useMemo(() => {
    if (!assignedRoles || !resources) {
      return { entityTypes: [], roles: [] };
    }

    const roles = addResourceNamesToRoles(assignedRoles, resources);
    const entityTypes = getEntityTypes(roles);

    return { entityTypes, roles };
  }, [assignedRoles, resources]);

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
    if (resourcesLoading || assignedRolesLoading) {
      return <TableRowLoading columns={3} rows={1} />;
    }

    if (resourcesError || assignedRolesError) {
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

    if (!resources || !assignedRoles || filteredRoles.length === 0) {
      return (
        <TableRowEmpty colSpan={3} message={'No Entities are assigned.'} />
      );
    }

    if (assignedRoles && resources) {
      return (
        <>
          {filteredRoles.map((el: EntitiesRole) => (
            <TableRow key={el.id}>
              <TableCell>
                <Typography>{el.resource_name}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{capitalize(el.resource_type)}</Typography>
              </TableCell>
              <TableCell>
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
          clearable
          hideLabel
          label="Filter"
          onSearch={setQuery}
          placeholder="Search"
          sx={{ marginRight: 2, width: 410 }}
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
              sx={{ width: '32%' }}
            >
              Entity
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'entityType'}
              direction={order}
              handleClick={handleOrderChange}
              label="entityType"
              sx={{ width: '32%' }}
            >
              Entity type
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'role'}
              direction={order}
              handleClick={handleOrderChange}
              label="role"
              sx={{ width: '25%' }}
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

const addResourceNamesToRoles = (
  assignedRoles: IamUserPermissions,
  resources: IamAccountResource
): EntitiesRole[] => {
  const resourcesRoles = assignedRoles.resource_access;

  const resourcesArray: IamAccountResource[] = Object.values(resources);

  return resourcesRoles.flatMap((resourceRole: ResourceAccess) => {
    const resourceByType = resourcesArray.find(
      (r: IamAccountResource) => r.resource_type === resourceRole.resource_type
    );

    if (resourceByType) {
      const resource = resourceByType.resources.find(
        (res: Resource) => res.id === resourceRole.resource_id
      );

      if (resource) {
        return resourceRole.roles.map((r: RoleType) => ({
          id: `${r}-${resourceRole.resource_id}`,
          resource_id: resourceRole.resource_id,
          resource_name: resource.name,
          resource_type: resourceRole.resource_type,
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
  role.resource_type,
  role.role_name,
];
