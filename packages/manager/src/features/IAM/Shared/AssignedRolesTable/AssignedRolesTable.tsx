import { Autocomplete, CircleProgress, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { CollapsibleTable } from 'src/components/CollapsibleTable/CollapsibleTable';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { useAccountEntities } from 'src/queries/entities/entities';
import {
  useAccountPermissions,
  useAccountUserPermissions,
} from 'src/queries/iam/iam';

import { AssignedEntities } from '../../Users/UserRoles/AssignedEntities';
import { Permissions } from '../Permissions/Permissions';
import { RemoveAssignmentConfirmationDialog } from '../RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog';
import {
  addEntitiesNamesToRoles,
  combineRoles,
  getFacadeRoleDescription,
  getFilteredRoles,
  getFormattedEntityType,
  mapEntityTypes,
  mapRolesToPermissions,
  groupAccountEntitiesByType,
} from '../utilities';
import { AssignedRolesActionMenu } from './AssignedRolesActionMenu';
import { ChangeRoleDrawer } from './ChangeRoleDrawer';
import { UnassignRoleConfirmationDialog } from './UnassignRoleConfirmationDialog';
import { UpdateEntitiesDrawer } from './UpdateEntitiesDrawer';

import type {
  CombinedEntity,
  DrawerModes,
  EntitiesType,
  ExtendedRoleMap,
  RoleMap,
} from '../utilities';
import type {
  AccountAccessRole,
  EntityAccessRole,
  EntityTypePermissions,
} from '@linode/api-v4';
import type { TableItem } from 'src/components/CollapsibleTable/CollapsibleTable';

export const AssignedRolesTable = () => {
  const { username } = useParams<{ username: string }>();
  const history = useHistory();
  const { handleOrderChange, order, orderBy } = useOrder();
  const theme = useTheme();

  const [isChangeRoleDrawerOpen, setIsChangeRoleDrawerOpen] =
    React.useState<boolean>(false);
  const [selectedRole, setSelectedRole] = React.useState<ExtendedRoleMap>();
  const [selectedEntity, setSelectedEntity] = React.useState<CombinedEntity>();
  const [isUnassignRoleDialogOpen, setIsUnassignRoleDialogOpen] =
    React.useState<boolean>(false);
  const [isUpdateEntitiesDrawerOpen, setIsUpdateEntitiesDrawerOpen] =
    React.useState<boolean>(false);

  const [drawerMode, setDrawerMode] =
    React.useState<DrawerModes>('assign-role');
  const [isRemoveAssignmentDialogOpen, setIsRemoveAssignmentDialogOpen] =
    React.useState<boolean>(false);

  const handleChangeRole = (role: ExtendedRoleMap) => {
    setIsChangeRoleDrawerOpen(true);
    setSelectedRole(role);
    setDrawerMode('change-role');
  };

  const handleUnassignRole = (role: ExtendedRoleMap) => {
    setIsUnassignRoleDialogOpen(true);
    setSelectedRole(role);
  };

  const handleUpdateEntities = (role: ExtendedRoleMap) => {
    setIsUpdateEntitiesDrawerOpen(true);
    setSelectedRole(role);
  };

  const handleRemoveAssignment = (
    entity: CombinedEntity,
    role: ExtendedRoleMap
  ) => {
    setIsRemoveAssignmentDialogOpen(true);
    setSelectedEntity(entity);
    setSelectedRole(role);
  };

  const { data: accountPermissions, isLoading: accountPermissionsLoading } =
    useAccountPermissions();
  const { data: entities, isLoading: entitiesLoading } = useAccountEntities();
  const { data: assignedRoles, isLoading: assignedRolesLoading } =
    useAccountUserPermissions(username ?? '');

  const { resourceTypes, roles } = React.useMemo(() => {
    if (!assignedRoles || !accountPermissions) {
      return { resourceTypes: [], roles: [] };
    }

    const userRoles = combineRoles(assignedRoles);
    let roles = mapRolesToPermissions(accountPermissions, userRoles);

    const resourceTypes = getResourceTypes(roles);

    if (entities) {
      const transformedEntities = groupAccountEntitiesByType(entities.data);

      roles = addEntitiesNamesToRoles(roles, transformedEntities);
    }

    return { resourceTypes, roles };
  }, [assignedRoles, accountPermissions, entities]);

  const [query, setQuery] = React.useState('');

  const [entityType, setEntityType] = React.useState<EntitiesType | null>(null);

  const handleViewEntities = (
    roleName: AccountAccessRole | EntityAccessRole
  ) => {
    const selectedRole = roleName;
    history.push({
      pathname: `/iam/users/${username}/entities`,
      state: { selectedRole },
    });
  };

  const memoizedTableItems: TableItem[] = React.useMemo(() => {
    const filteredRoles = getFilteredRoles({
      entityType: entityType?.rawValue,
      getSearchableFields,
      query,
      roles,
    });

    return filteredRoles.map((role: ExtendedRoleMap) => {
      const OuterTableCells = (
        <>
          {role.access === 'account_access' ? (
            <TableCell sx={{ display: { sm: 'table-cell', xs: 'none' } }}>
              <Typography>
                {role.entity_type === 'account'
                  ? 'All Entities'
                  : `All ${getFormattedEntityType(role.entity_type)}s`}
              </Typography>
            </TableCell>
          ) : (
            <TableCell sx={{ display: { sm: 'table-cell', xs: 'none' } }}>
              <AssignedEntities
                onButtonClick={handleViewEntities}
                onRemoveAssignment={handleRemoveAssignment}
                role={role}
              />
            </TableCell>
          )}
          <TableCell actionCell>
            <AssignedRolesActionMenu
              handleChangeRole={handleChangeRole}
              handleUnassignRole={handleUnassignRole}
              handleUpdateEntities={handleUpdateEntities}
              handleViewEntities={handleViewEntities}
              role={role}
            />
          </TableCell>
        </>
      );
      // TODO: update the link for 'Learn more' in the description when it's ready - UIE-8534
      const InnerTable = (
        <Grid
          sx={{
            padding: `${theme.tokens.spacing.S0} ${theme.tokens.spacing.S16}`,
          }}
        >
          <Typography
            sx={{
              font: theme.tokens.alias.Typography.Label.Bold.S,
            }}
          >
            Description
          </Typography>
          <Typography
            sx={{
              marginBottom: theme.tokens.spacing.S8,
            }}
          >
            {role.permissions.length ? (
              role.description
            ) : (
              <>
                {getFacadeRoleDescription(role)} <Link to="#">Learn more.</Link>
              </>
            )}
          </Typography>
          <Permissions permissions={role.permissions} />
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

  if (accountPermissionsLoading || entitiesLoading || assignedRolesLoading) {
    return <CircleProgress />;
  }

  const RoleTableRowHead = (
    <TableRow>
      <TableSortCell
        active={orderBy === 'role'}
        direction={order}
        handleClick={handleOrderChange}
        label="role"
        style={{ width: '20%' }}
      >
        Role
      </TableSortCell>
      <TableSortCell
        active={orderBy === 'entities'}
        direction={order}
        handleClick={handleOrderChange}
        label="entities"
        style={{ width: '65%' }}
        sx={{ display: { sm: 'table-cell', xs: 'none' } }}
      >
        Entities
      </TableSortCell>
      <TableCell />
    </TableRow>
  );

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
          options={resourceTypes}
          placeholder="All Assigned Roles"
          textFieldProps={{
            containerProps: {
              sx: { minWidth: 250, width: { md: '250px', xs: '100%' } },
            },
            hideLabel: true,
          }}
          value={entityType}
        />
      </Grid>
      <CollapsibleTable
        TableItems={memoizedTableItems}
        TableRowEmpty={
          <TableRowEmpty colSpan={5} message={'No Roles are assigned.'} />
        }
        TableRowHead={RoleTableRowHead}
      />
      <ChangeRoleDrawer
        mode={drawerMode}
        onClose={() => setIsChangeRoleDrawerOpen(false)}
        open={isChangeRoleDrawerOpen}
        role={selectedRole}
      />
      <UnassignRoleConfirmationDialog
        onClose={() => setIsUnassignRoleDialogOpen(false)}
        open={isUnassignRoleDialogOpen}
        role={selectedRole}
      />
      <UpdateEntitiesDrawer
        onClose={() => setIsUpdateEntitiesDrawerOpen(false)}
        open={isUpdateEntitiesDrawerOpen}
        role={selectedRole}
      />
      <RemoveAssignmentConfirmationDialog
        onClose={() => setIsRemoveAssignmentDialogOpen(false)}
        open={isRemoveAssignmentDialogOpen}
        role={{
          entity_type: selectedRole?.entity_type as EntityTypePermissions,
          id: selectedRole?.id as EntityAccessRole,
          entity_id: selectedEntity?.id as number,
          entity_name: selectedEntity?.name as string,
          role_name: selectedRole?.name as EntityAccessRole,
          access: 'entity_access',
        }}
      />
    </Grid>
  );
};

const getResourceTypes = (data: RoleMap[]): EntitiesType[] =>
  mapEntityTypes(data, ' Roles');

const getSearchableFields = (role: ExtendedRoleMap): string[] => {
  const entityNames = role.entity_names || [];
  return [
    String(role.id),
    role.entity_type,
    role.name,
    role.description,
    ...entityNames,
    ...role.permissions,
  ];
};
