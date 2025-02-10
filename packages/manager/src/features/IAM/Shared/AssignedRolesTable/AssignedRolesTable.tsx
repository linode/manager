import { Autocomplete, Chip, CircleProgress, Typography } from '@linode/ui';
import { Grid, styled } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { CollapsibleTable } from 'src/components/CollapsibleTable/CollapsibleTable';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import {
  useAccountPermissions,
  useAccountUserPermissions,
} from 'src/queries/iam/iam';
import { useAccountResources } from 'src/queries/resources/resources';

import { getFilteredRoles, mapEntityTypes } from '../utilities';

import type { EntitiesType, ExtendedRoleMap, RoleMap } from '../utilities';
import type {
  AccountAccessType,
  IamAccess,
  IamAccountPermissions,
  IamAccountResource,
  IamUserPermissions,
  RoleType,
  Roles,
} from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';
import type { TableItem } from 'src/components/CollapsibleTable/CollapsibleTable';

interface AllResources {
  resource: IamAccess;
  type: 'account' | 'resource';
}

interface CombinedRoles {
  id: null | number[];
  name: AccountAccessType | RoleType;
}

export const AssignedRolesTable = () => {
  const { username } = useParams<{ username: string }>();

  const {
    data: accountPermissions,
    isLoading: accountPermissionsLoading,
  } = useAccountPermissions();
  const {
    data: resources,
    isLoading: resourcesLoading,
  } = useAccountResources();
  const {
    data: assignedRoles,
    isLoading: assignedRolesLoading,
  } = useAccountUserPermissions(username ?? '');

  const { resourceTypes, roles } = React.useMemo(() => {
    if (!assignedRoles || !accountPermissions) {
      return { resourceTypes: [], roles: [] };
    }

    const userRoles = combineRoles(assignedRoles);
    let roles = mapRolesToPermissions(accountPermissions, userRoles);
    const resourceTypes = getResourceTypes(roles);

    if (resources) {
      roles = addResourceNamesToRoles(roles, resources);
    }

    return { resourceTypes, roles };
  }, [assignedRoles, accountPermissions, resources]);

  const [query, setQuery] = React.useState('');

  const [entityType, setEntityType] = React.useState<EntitiesType | null>(null);

  const memoizedTableItems: TableItem[] = React.useMemo(() => {
    const filteredRoles = getFilteredRoles({
      entityType: entityType?.rawValue,
      getSearchableFields,
      query,
      roles,
    });

    return filteredRoles.map((role: ExtendedRoleMap) => {
      const resources = role.resource_names?.map((name: string) => (
        <Chip key={name} label={name} />
      ));

      const accountMenu: Action[] = [
        {
          onClick: () => {
            // mock
          },
          title: 'Change Role',
        },
        {
          onClick: () => {
            // mock
          },
          title: 'Unassign Role',
        },
      ];

      const entitiesMenu: Action[] = [
        {
          onClick: () => {
            // mock
          },
          title: 'View Entities',
        },
        {
          onClick: () => {
            // mock
          },
          title: 'Update List of Entities',
        },
        {
          onClick: () => {
            // mock
          },
          title: 'Change Role',
        },
        {
          onClick: () => {
            // mock
          },
          title: 'Unassign Role',
        },
      ];

      const actions = role.access === 'account' ? accountMenu : entitiesMenu;

      const OuterTableCells = (
        <>
          {role.access === 'account' ? (
            <TableCell>
              <Typography>
                {role.resource_type === 'account'
                  ? 'All entities'
                  : `All ${role.resource_type}s`}
              </Typography>
            </TableCell>
          ) : (
            <TableCell>{resources}</TableCell>
          )}
          <TableCell>
            <ActionMenu actionsList={actions} ariaLabel="action menu" />
          </TableCell>
        </>
      );

      const InnerTable = (
        <Grid
          sx={(theme) => ({
            background: theme.color.grey5,
            paddingBottom: 1.5,
            paddingLeft: 4.5,
            paddingRight: 4.5,
            paddingTop: 1.5,
          })}
        >
          <StyledTypography variant="body1">Description:</StyledTypography>
          <Typography>{role.description}</Typography>
        </Grid>
      );

      return {
        InnerTable,
        OuterTableCells,
        id: role.id,
        label: role.name,
      };
    });
  }, [roles, query, entityType]);

  if (accountPermissionsLoading || resourcesLoading || assignedRolesLoading) {
    return <CircleProgress />;
  }

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
          options={resourceTypes}
          placeholder="All Assigned Roles"
          value={entityType}
        />
      </Grid>
      <CollapsibleTable
        TableRowEmpty={
          <TableRowEmpty colSpan={5} message={'No Roles are assigned.'} />
        }
        TableItems={memoizedTableItems}
        TableRowHead={RoleTableRowHead}
      />
    </Grid>
  );
};

const RoleTableRowHead = (
  <TableRow>
    <TableCell sx={{ width: '19%' }}>Role</TableCell>
    <TableCell sx={{ width: '76%' }}>Entities</TableCell>
    <TableCell sx={{ width: '5%' }} />
  </TableRow>
);

/**
 * Group account_access and resource_access roles of the user
 *
 */
const combineRoles = (data: IamUserPermissions): CombinedRoles[] => {
  const combinedRoles: CombinedRoles[] = [];
  const roleMap: Map<AccountAccessType | RoleType, null | number[]> = new Map();

  // Add account access roles with resource_id set to null
  data.account_access.forEach((role: AccountAccessType) => {
    if (!roleMap.has(role)) {
      roleMap.set(role, null);
    }
  });

  // Add resource access roles with their respective resource_id
  data.resource_access.forEach(
    (resource: { resource_id: number; roles: RoleType[] }) => {
      resource.roles?.forEach((role: RoleType) => {
        if (roleMap.has(role)) {
          const existingResourceIds = roleMap.get(role);
          if (existingResourceIds && existingResourceIds !== null) {
            roleMap.set(role, [...existingResourceIds, resource.resource_id]);
          }
        } else {
          roleMap.set(role, [resource.resource_id]);
        }
      });
    }
  );

  // Convert the Map into the final combinedRoles array
  roleMap.forEach((id, name) => {
    combinedRoles.push({ id, name });
  });

  return combinedRoles;
};

/**
 * Add descriptions, permissions, type to roles
 */
const mapRolesToPermissions = (
  accountPermissions: IamAccountPermissions,
  userRoles: {
    id: null | number[];
    name: AccountAccessType | RoleType;
  }[]
): RoleMap[] => {
  const roleMap = new Map<string, RoleMap>();

  // Flatten resources and map roles for quick lookup
  const allResources11: AllResources[] = [
    ...accountPermissions.account_access.map((resource) => ({
      resource,
      type: 'account' as const,
    })),
    ...accountPermissions.resource_access.map((resource) => ({
      resource,
      type: 'resource' as const,
    })),
  ];

  const roleLookup = new Map<string, AllResources>();
  allResources11.forEach(({ resource, type }) => {
    resource.roles.forEach((role: Roles) => {
      roleLookup.set(role.name, { resource, type });
    });
  });

  // Map userRoles to permissions
  userRoles.forEach(({ id, name }) => {
    const match = roleLookup.get(name);
    if (match) {
      const { resource, type } = match;
      const role = resource.roles.find((role: Roles) => role.name === name)!;
      roleMap.set(name, {
        access: type,
        description: role.description,
        id: name,
        name,
        permissions: role.permissions,
        resource_ids: id,
        resource_type: resource.resource_type,
      });
    }
  });

  return Array.from(roleMap.values());
};

const addResourceNamesToRoles = (
  roles: ExtendedRoleMap[],
  resources: IamAccountResource
): ExtendedRoleMap[] => {
  const resourcesArray: IamAccountResource[] = Object.values(resources);

  return roles.map((role) => {
    // Find the resource group by resource_type
    const resourceGroup = resourcesArray.find(
      (res) => res.resource_type === role.resource_type
    );

    if (resourceGroup && role.resource_ids) {
      // Map resource_ids to their names
      const resourceNames = role.resource_ids
        .map(
          (id) =>
            resourceGroup.resources.find((resource) => resource.id === id)?.name
        )
        .filter((name): name is string => name !== undefined); // Remove undefined values

      return { ...role, resource_names: resourceNames };
    }

    // If no matching resource_type, return the role unchanged
    return { ...role, resource_names: [] };
  });
};

const getResourceTypes = (data: RoleMap[]): EntitiesType[] =>
  mapEntityTypes(data, ' Roles');

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
  marginBottom: 0,
}));

const getSearchableFields = (role: ExtendedRoleMap): string[] => {
  const resourceNames = role.resource_names || [];
  return [
    String(role.id),
    role.resource_type,
    role.name,
    role.access,
    role.description,
    ...resourceNames,
    ...role.permissions,
  ];
};
