import {
  Autocomplete,
  CircleProgress,
  StyledLinkButton,
  Typography,
} from '@linode/ui';
import { capitalize, truncate } from '@linode/utilities';
import { Grid, useTheme } from '@mui/material';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { CollapsibleTable } from 'src/components/CollapsibleTable/CollapsibleTable';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import {
  useAccountPermissions,
  useAccountUserPermissions,
} from 'src/queries/iam/iam';
import { useAccountResources } from 'src/queries/resources/resources';

import { AssignedEntities } from '../../Users/UserRoles/AssignedEntities';
import { Permissions } from '../Permissions/Permissions';
import {
  addResourceNamesToRoles,
  combineRoles,
  getFilteredRoles,
  mapEntityTypes,
  mapRolesToPermissions,
} from '../utilities';
import { AssignedRolesActionMenu } from './AssignedRolesActionMenu';
import { ChangeRoleDrawer } from './ChangeRoleDrawer';
import { UnassignRoleConfirmationDialog } from './UnassignRoleConfirmationDialog';

import type { EntitiesType, ExtendedRoleMap, RoleMap } from '../utilities';
import type { AccountAccessType, RoleType } from '@linode/api-v4';
import type { TableItem } from 'src/components/CollapsibleTable/CollapsibleTable';

export const AssignedRolesTable = () => {
  const { username } = useParams<{ username: string }>();
  const history = useHistory();
  const { handleOrderChange, order, orderBy } = useOrder();
  const theme = useTheme();

  const [
    isChangeRoleDrawerOpen,
    setIsChangeRoleDrawerOpen,
  ] = React.useState<boolean>(false);
  const [selectedRole, setSelectedRole] = React.useState<ExtendedRoleMap>();
  const [
    isUnassignRoleDialogOpen,
    setIsUnassignRoleDialogOpen,
  ] = React.useState<boolean>(false);

  const handleChangeRole = (role: ExtendedRoleMap) => {
    setIsChangeRoleDrawerOpen(true);
    setSelectedRole(role);
  };

  const handleUnassignRole = (role: ExtendedRoleMap) => {
    setIsUnassignRoleDialogOpen(true);
    setSelectedRole(role);
  };

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

  const [showFullDescription, setShowFullDescription] = React.useState(false);

  const handleViewEntities = (roleName: AccountAccessType | RoleType) => {
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
                {role.resource_type === 'account'
                  ? 'All Entities'
                  : `All ${capitalize(role.resource_type)}s`}
              </Typography>
            </TableCell>
          ) : (
            <TableCell sx={{ display: { sm: 'table-cell', xs: 'none' } }}>
              <AssignedEntities
                entities={role.resource_names!}
                onButtonClick={handleViewEntities}
                roleName={role.name}
              />
            </TableCell>
          )}
          <TableCell actionCell>
            <AssignedRolesActionMenu
              handleChangeRole={handleChangeRole}
              handleUnassignRole={handleUnassignRole}
              handleViewEntities={handleViewEntities}
              role={role}
            />
          </TableCell>
        </>
      );

      const description =
        role.description.length < 150 || showFullDescription
          ? role.description
          : truncate(role.description, 150);

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
            sx={{ display: 'flex', flexDirection: 'column', marginBottom: 1 }}
          >
            {' '}
            {description}{' '}
            {description.length > 150 && (
              <StyledLinkButton
                sx={{
                  font: theme.tokens.alias.Typography.Label.Semibold.Xs,
                  width: 'max-content',
                }}
                onClick={() => setShowFullDescription((show) => !show)}
              >
                {showFullDescription ? 'Hide' : 'Expand'}
              </StyledLinkButton>
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
  }, [roles, query, entityType, showFullDescription]);

  if (accountPermissionsLoading || resourcesLoading || assignedRolesLoading) {
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
            containerProps: {
              sx: { minWidth: 250, width: { md: '250px', xs: '100%' } },
            },
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
      <ChangeRoleDrawer
        onClose={() => setIsChangeRoleDrawerOpen(false)}
        open={isChangeRoleDrawerOpen}
        role={selectedRole}
      />
      <UnassignRoleConfirmationDialog
        onClose={() => setIsUnassignRoleDialogOpen(false)}
        open={isUnassignRoleDialogOpen}
        role={selectedRole}
      />
    </Grid>
  );
};

const getResourceTypes = (data: RoleMap[]): EntitiesType[] =>
  mapEntityTypes(data, ' Roles');

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
