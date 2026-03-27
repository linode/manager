import { Button, Hidden, Select, Typography } from '@linode/ui';
import { capitalizeAllWords } from '@linode/utilities';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { Pagination } from '@akamai/cds-components/react/Pagination';
import {
  sortRows,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableRowExpanded,
} from '@akamai/cds-components/react/Table';
import React, { useState } from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Link } from 'src/components/Link';
import { AssignSelectedRolesDrawer } from 'src/features/IAM/Roles/RolesTable/AssignSelectedRolesDrawer';
import { RolesTableActionMenu } from 'src/features/IAM/Roles/RolesTable/RolesTableActionMenu';
import { RolesTableExpandedRow } from 'src/features/IAM/Roles/RolesTable/RolesTableExpandedRow';
import {
  getFacadeRoleDescription,
  mapEntityTypesForSelect,
} from 'src/features/IAM/Shared/utilities';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { usePermissions } from '../../hooks/usePermissions';
import { IAM_ROLES_PENDO_IDS } from '../../Shared/constants';
import {
  ROLES_LEARN_MORE_LINK,
  ROLES_TABLE_PREFERENCE_KEY,
} from '../../Shared/constants';

import type { RoleView } from '../../Shared/types';
import type { SelectOption } from '@linode/ui';
import type { Order } from '@akamai/cds-components/react/Table';

const ALL_ROLES_OPTION: SelectOption = {
  label: 'All Roles',
  value: 'all',
};

const COLUMN_WIDTHS = {
  name: '26%',
  access: '14%',
  description: '38%',
  actions: '10%',
};

const TABLE_CELL_BASE_STYLE = {
  boxSizing: 'border-box' as const,
};
interface Props {
  roles?: RoleView[];
}
const DEFAULT_PAGE_SIZE = 10;

export const RolesTable = ({ roles = [] }: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { query } = useSearch({
    strict: false,
  });

  const [filterableEntityType, setFilterableEntityType] =
    useState<null | SelectOption>(ALL_ROLES_OPTION);
  const [sort, setSort] = useState<
    undefined | { column: string; order: Order }
  >({ column: 'name', order: 'asc' });
  const [selectedRows, setSelectedRows] = useState<RoleView[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const { data: permissions } = usePermissions('account', ['is_account_admin']);
  const isAccountAdmin = permissions?.is_account_admin;
  const { isDelegateUserType, isChildUserType } = useDelegationRole();
  // Filtering
  const getFilteredRows = (
    text: string,
    entityTypeVal = ALL_ROLES_OPTION.value
  ) => {
    return roles.filter(
      (r) =>
        (entityTypeVal === ALL_ROLES_OPTION.value ||
          entityTypeVal === r.entity_type) &&
        (r.name.includes(text) ||
          r.description.includes(text) ||
          r.access.includes(text))
    );
  };

  const filteredRows = React.useMemo(() => {
    return getFilteredRows(query ?? '', filterableEntityType?.value);
  }, [roles, query, filterableEntityType]);

  // Get just the list of entity types from this list of roles, to be used in the selection filter
  const filterableOptions = React.useMemo(() => {
    return [ALL_ROLES_OPTION, ...mapEntityTypesForSelect(roles, ' Roles')];
  }, [roles]);

  const sortedRows = React.useMemo(() => {
    if (!sort) return filteredRows;
    return sortRows(filteredRows, sort.order, sort.column);
  }, [filteredRows, sort]);

  const pagination = usePaginationV2({
    currentRoute: '/iam/roles',
    defaultPageSize: DEFAULT_PAGE_SIZE,
    initialPage: 1,
    preferenceKey: ROLES_TABLE_PREFERENCE_KEY,
    clientSidePaginationData: sortedRows,
  });

  const areAllSelected = React.useMemo(() => {
    return (
      !!pagination.paginatedData?.length &&
      !!selectedRows?.length &&
      pagination.paginatedData?.length === selectedRows?.length
    );
  }, [pagination.paginatedData, selectedRows]);

  const handleSort = (event: CustomEvent, column: string) => {
    setSort({ column, order: event.detail as Order });
  };

  const handleSelect = (event: CustomEvent, row: 'all' | RoleView) => {
    if (row === 'all') {
      setSelectedRows(areAllSelected ? [] : pagination.paginatedData);
    } else if (selectedRows.includes(row)) {
      setSelectedRows(selectedRows.filter((r) => r !== row));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const handleTextFilter = (fs: string) => {
    navigate({
      to: location.pathname,
      search: { query: fs !== '' ? fs : undefined },
    });
  };

  const handleChangeEntityTypeFilter = (_: never, entityType: SelectOption) => {
    setFilterableEntityType(entityType ?? ALL_ROLES_OPTION);
  };

  const assignRoleRow = (row: RoleView) => {
    setSelectedRows([row]);
    handleAssignSelectedRoles();
  };

  const handleAssignSelectedRoles = () => {
    // Logic to assign selected roles
    setIsDrawerOpen(true);
  };

  const handlePageChange = (event: CustomEvent<{ page: number }>) => {
    pagination.handlePageChange(Number(event.detail));
  };

  const handlePageSizeChange = (event: CustomEvent<{ pageSize: number }>) => {
    const newSize = event.detail.pageSize;
    pagination.handlePageSizeChange(newSize);
  };

  return (
    <>
      <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
        <Grid
          container
          direction="row"
          spacing={2}
          sx={(theme) => ({
            justifyContent: 'space-between',
            marginBottom: theme.tokens.spacing.S12,
          })}
        >
          <Grid
            container
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <DebouncedSearchTextField
              clearable
              containerProps={{
                sx: {
                  width: { md: '416px', xs: '100%' },
                  height: 34,
                },
              }}
              debounceTime={250}
              hideLabel
              label="Search"
              onSearch={handleTextFilter}
              placeholder="Search"
              value={query ?? ''}
            />
            <Select
              hideLabel
              label="Select type"
              onChange={handleChangeEntityTypeFilter}
              options={filterableOptions}
              placeholder="All Roles"
              sx={{ minWidth: 250 }}
              value={filterableEntityType}
            />
          </Grid>
          <Button
            buttonType="primary"
            data-pendo-id={
              isDelegateUserType
                ? IAM_ROLES_PENDO_IDS.assignSelectedRolesAsDelegate
                : isChildUserType
                  ? IAM_ROLES_PENDO_IDS.assignSelectedRolesAsChild
                  : IAM_ROLES_PENDO_IDS.assignSelectedRolesAsParent
            }
            disabled={selectedRows.length === 0 || !isAccountAdmin}
            onClick={() => handleAssignSelectedRoles()}
            sx={{ height: 34 }}
            tooltipText={
              !isAccountAdmin
                ? 'You do not have permission to assign roles.'
                : selectedRows.length === 0
                  ? 'You must select some roles to assign them.'
                  : undefined
            }
          >
            Assign Selected Roles
          </Button>
        </Grid>
        <Table data-testid="roles-table">
          <TableHead>
            <TableRow
              headerbackground={
                theme.tokens.component.Table.HeaderNested.Background
              }
              headerborder
              select={(event) => handleSelect(event, 'all')}
              selected={areAllSelected}
            >
              <TableHeaderCell
                sort={(event) => handleSort(event, 'name')}
                sortable
                sorted={sort?.column === 'name' ? sort.order : undefined}
                style={{
                  minWidth: COLUMN_WIDTHS.name,
                  ...TABLE_CELL_BASE_STYLE,
                }}
              >
                Role
              </TableHeaderCell>
              <Hidden smDown>
                <TableHeaderCell
                  sort={(event) => handleSort(event, 'access')}
                  sortable
                  sorted={sort?.column === 'access' ? sort.order : undefined}
                  style={{
                    minWidth: COLUMN_WIDTHS.access,
                    ...TABLE_CELL_BASE_STYLE,
                  }}
                >
                  Role Type
                </TableHeaderCell>
              </Hidden>
              <Hidden smDown>
                <TableHeaderCell
                  style={{
                    minWidth: COLUMN_WIDTHS.description,
                    ...TABLE_CELL_BASE_STYLE,
                  }}
                >
                  Description
                </TableHeaderCell>
              </Hidden>
              <TableHeaderCell
                style={{
                  minWidth: COLUMN_WIDTHS.actions,
                  ...TABLE_CELL_BASE_STYLE,
                }}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {!pagination.paginatedData?.length ? (
              <TableRow>
                <TableCell style={{ justifyContent: 'center' }}>
                  No items to display.
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((roleRow) => (
                <TableRow
                  expandable
                  hoverable
                  key={roleRow.name}
                  rowborder
                  select={(event) => handleSelect(event, roleRow)}
                  selectable
                  selected={selectedRows.includes(roleRow)}
                >
                  <TableCell
                    {...(selectedRows.includes(roleRow)
                      ? {
                          'data-pendo-id': IAM_ROLES_PENDO_IDS.rolesChecked,
                        }
                      : {
                          'data-pendo-id': IAM_ROLES_PENDO_IDS.rolesUnchecked,
                        })}
                    disabled={!isAccountAdmin}
                    style={{
                      wordBreak: 'break-word',
                      minWidth: COLUMN_WIDTHS.name,
                      ...TABLE_CELL_BASE_STYLE,
                    }}
                  >
                    {roleRow.name}
                  </TableCell>
                  <Hidden smDown>
                    <TableCell
                      style={{
                        minWidth: COLUMN_WIDTHS.access,
                        ...TABLE_CELL_BASE_STYLE,
                      }}
                    >
                      {capitalizeAllWords(roleRow.access, '_')}
                    </TableCell>
                  </Hidden>
                  <Hidden smDown>
                    <TableCell
                      style={{
                        minWidth: COLUMN_WIDTHS.description,
                        ...TABLE_CELL_BASE_STYLE,
                      }}
                    >
                      {roleRow.permissions.length ? (
                        roleRow.description
                      ) : (
                        <Typography>
                          {getFacadeRoleDescription(roleRow)}{' '}
                          <Link to={ROLES_LEARN_MORE_LINK}>Learn more</Link>.
                        </Typography>
                      )}
                    </TableCell>
                  </Hidden>
                  <TableCell
                    style={{
                      justifyContent: 'flex-end',
                      minWidth: COLUMN_WIDTHS.actions,
                      ...TABLE_CELL_BASE_STYLE,
                    }}
                  >
                    <RolesTableActionMenu
                      canUpdateUserGrants={isAccountAdmin}
                      onClick={() => {
                        assignRoleRow(roleRow);
                      }}
                    />
                  </TableCell>
                  <TableRowExpanded
                    slot="expanded"
                    style={{
                      marginBottom: theme.spacingFunction(12),
                      marginLeft: theme.spacingFunction(44),
                      padding: `0 ${theme.spacingFunction(4)}`,
                      width: '100%',
                    }}
                  >
                    <RolesTableExpandedRow permissions={roleRow.permissions} />
                  </TableRowExpanded>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {sortedRows.length !== 0 && sortedRows.length > DEFAULT_PAGE_SIZE && (
          <Pagination
            count={sortedRows.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            page={pagination.page}
            pageSize={pagination.pageSize}
            style={{ border: 0 }}
          />
        )}
      </Paper>
      <AssignSelectedRolesDrawer
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={() => setSelectedRows([])}
        open={isDrawerOpen}
        selectedRoles={selectedRows}
      />
    </>
  );
};
