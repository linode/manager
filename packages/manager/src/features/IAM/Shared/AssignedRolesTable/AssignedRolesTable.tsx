import { Button, CircleProgress, Select, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { CollapsibleTable } from 'src/components/CollapsibleTable/CollapsibleTable';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { useAccountEntities } from 'src/queries/entities/entities';
import {
  useAccountPermissions,
  useAccountUserPermissions,
} from 'src/queries/iam/iam';

import { AssignedEntities } from '../../Users/UserRoles/AssignedEntities';
import { AssignNewRoleDrawer } from '../../Users/UserRoles/AssignNewRoleDrawer';
import { Permissions } from '../Permissions/Permissions';
import { RemoveAssignmentConfirmationDialog } from '../RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog';
import {
  getFacadeRoleDescription,
  getFilteredRoles,
  getFormattedEntityType,
  groupAccountEntitiesByType,
  mapEntityTypesForSelect,
} from '../utilities';
import { AssignedRolesActionMenu } from './AssignedRolesActionMenu';
import { ChangeRoleDrawer } from './ChangeRoleDrawer';
import { UnassignRoleConfirmationDialog } from './UnassignRoleConfirmationDialog';
import { UpdateEntitiesDrawer } from './UpdateEntitiesDrawer';
import {
  addEntitiesNamesToRoles,
  combineRoles,
  getSearchableFields,
  mapRolesToPermissions,
} from './utils';

import type {
  CombinedEntity,
  DrawerModes,
  EntitiesRole,
  ExtendedRoleView,
  RoleView,
} from '../types';
import type {
  AccountAccessRole,
  EntityAccessRole,
  EntityTypePermissions,
} from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { TableItem } from 'src/components/CollapsibleTable/CollapsibleTable';

type OrderByKeys = 'name';

const ALL_ROLES_OPTION: SelectOption = {
  label: 'All Assigned Roles',
  value: 'all',
};

export const AssignedRolesTable = () => {
  const { username } = useParams<{ username: string }>();
  const history = useHistory();
  const theme = useTheme();

  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<OrderByKeys>('name');
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  const handleOrderChange = (newOrderBy: OrderByKeys) => {
    if (orderBy === newOrderBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(newOrderBy);
      setOrder('asc');
    }
    setIsInitialLoad(false);
  };

  const [isChangeRoleDrawerOpen, setIsChangeRoleDrawerOpen] =
    React.useState<boolean>(false);
  const [selectedRole, setSelectedRole] = React.useState<ExtendedRoleView>();
  const [selectedEntity, setSelectedEntity] = React.useState<CombinedEntity>();
  const [isUnassignRoleDialogOpen, setIsUnassignRoleDialogOpen] =
    React.useState<boolean>(false);
  const [isUpdateEntitiesDrawerOpen, setIsUpdateEntitiesDrawerOpen] =
    React.useState<boolean>(false);

  const [drawerMode, setDrawerMode] =
    React.useState<DrawerModes>('assign-role');
  const [isRemoveAssignmentDialogOpen, setIsRemoveAssignmentDialogOpen] =
    React.useState<boolean>(false);
  const [isAssignNewRoleDrawerOpen, setIsAssignNewRoleDrawerOpen] =
    React.useState<boolean>(false);

  const handleChangeRole = (role: ExtendedRoleView) => {
    setIsChangeRoleDrawerOpen(true);
    setSelectedRole(role);
    setDrawerMode('change-role');
  };

  const handleUnassignRole = (role: ExtendedRoleView) => {
    setIsUnassignRoleDialogOpen(true);
    setSelectedRole(role);
  };

  const handleUpdateEntities = (role: ExtendedRoleView) => {
    setIsUpdateEntitiesDrawerOpen(true);
    setSelectedRole(role);
  };

  const handleRemoveAssignment = (
    entity: CombinedEntity,
    role: ExtendedRoleView
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

  const { filterableOptions, roles } = React.useMemo(() => {
    if (!assignedRoles || !accountPermissions) {
      return { filterableOptions: [], roles: [] };
    }

    const userRoles = combineRoles(assignedRoles);
    let roles = mapRolesToPermissions(accountPermissions, userRoles);

    const filterableOptions = [
      ALL_ROLES_OPTION,
      ...mapEntityTypesForSelect(roles, ' Roles'),
    ];

    if (entities) {
      const transformedEntities = groupAccountEntitiesByType(entities.data);

      roles = addEntitiesNamesToRoles(roles, transformedEntities);
    }

    return { filterableOptions, roles };
  }, [assignedRoles, accountPermissions, entities]);

  const [query, setQuery] = React.useState('');

  const [entityType, setEntityType] = React.useState<null | SelectOption>(
    ALL_ROLES_OPTION
  );

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
      entityType: entityType?.value as 'all' | EntityTypePermissions,
      getSearchableFields,
      query,
      roles,
    }) as RoleView[];

    // Sorting logic:
    // 1. During the initial load (isInitialLoad is true):
    //    - Account Access Roles are placed at the top.
    //    - Entity Access Roles are placed at the bottom.
    //    - Within each group, roles are sorted alphabetically by Role name.
    // 2. After the first user interaction with sorting (isInitialLoad is set to false):
    //    - Roles are sorted alphabetically by the selected column (orderBy) and direction (order).
    //    - The special prioritization of roles’ access is no longer applied.
    const filteredAndSortedRoles = [...filteredRoles].sort((a, b) => {
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

    return filteredAndSortedRoles.map((role: ExtendedRoleView) => {
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
  }, [roles, query, entityType, order, orderBy]);

  if (accountPermissionsLoading || entitiesLoading || assignedRolesLoading) {
    return <CircleProgress />;
  }

  const RoleTableRowHead = (
    <TableRow>
      <TableSortCell
        active={orderBy === 'name'}
        direction={order}
        handleClick={() => handleOrderChange('name')}
        label="role"
        style={{ width: '20%' }}
      >
        Role
      </TableSortCell>
      <TableCell
        style={{ width: '75%' }}
        sx={{ display: { sm: 'table-cell', xs: 'none' } }}
      >
        Entities
      </TableCell>
      <TableCell />
    </TableRow>
  );

  // used to pass the selected role and entity to the RemoveAssignmentConfirmationDialog
  let selectedRoleDetails: EntitiesRole | undefined = undefined;

  if (selectedRole && selectedEntity) {
    selectedRoleDetails = {
      entity_type: selectedRole.entity_type,
      id: selectedRole.id,
      entity_id: selectedEntity.id,
      entity_name: selectedEntity.name,
      role_name: selectedRole.name as EntityAccessRole,
      access: 'entity_access',
    };
  }

  return (
    <Grid>
      <Grid
        container
        direction="row"
        rowSpacing={1}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.tokens.spacing.S12,
        }}
      >
        <Grid container direction="row" rowSpacing={1}>
          <DebouncedSearchTextField
            clearable
            containerProps={{
              sx: {
                marginRight: { md: 2, xs: 0 },
                width: { md: '416px', xs: '100%' },
                height: 34,
              },
            }}
            hideLabel
            label="Filter"
            onSearch={setQuery}
            placeholder="Search"
            value={query}
          />
          <Select
            hideLabel
            label="Select type"
            onChange={(_, selected) => setEntityType(selected ?? null)}
            options={filterableOptions}
            placeholder="All Assigned Roles"
            sx={{ minWidth: 250 }}
            value={entityType}
          />
        </Grid>
        <Grid sx={{ alignSelf: 'flex-start' }}>
          <Button
            buttonType="primary"
            onClick={() => setIsAssignNewRoleDrawerOpen(true)}
          >
            Assign New Roles
          </Button>
        </Grid>
      </Grid>
      <CollapsibleTable
        TableItems={memoizedTableItems}
        TableRowEmpty={
          <TableRowEmpty colSpan={5} message={'No Roles are assigned.'} />
        }
        TableRowHead={RoleTableRowHead}
      />
      <AssignNewRoleDrawer
        onClose={() => setIsAssignNewRoleDrawerOpen(false)}
        open={isAssignNewRoleDrawerOpen}
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
        role={selectedRoleDetails}
      />
    </Grid>
  );
};
