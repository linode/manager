import {
  Button,
  FormField,
  FormLabel,
  Icon,
  Pagination,
  Select,
  sortRows,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableRowExpanded,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { capitalizeAllWords } from '@akamai/compute-ui-core/formatting';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import React, { useState } from 'react';

import { AssignSelectedRolesDrawer } from 'src/features/IAM/Roles/RolesTable/AssignSelectedRolesDrawer';
import { RolesTableActionMenu } from 'src/features/IAM/Roles/RolesTable/RolesTableActionMenu';
import { RolesTableExpandedRow } from 'src/features/IAM/Roles/RolesTable/RolesTableExpandedRow';
import { DebouncedSearchField } from 'src/features/IAM/Shared/DebouncedSearchField/DebouncedSearchField';
import globalStyles from 'src/features/IAM/Shared/global.module.css';
import {
  getFacadeRoleDescription,
  mapEntityTypesForSelect,
} from 'src/features/IAM/Shared/utilities';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useDelegationRole } from '../../hooks/useDelegationRole';
import { usePagination } from '../../hooks/usePagination';
import { usePermissions } from '../../hooks/usePermissions';
import { Box } from '../../Shared/Box/Box';
import {
  IAM_ROLES_PENDO_IDS,
  ROLES_LEARN_MORE_LINK,
  ROLES_TABLE_PREFERENCE_KEY,
} from '../../Shared/constants';
import { Link } from '../../Shared/Link/Link';

import type { RoleView, SelectOption } from '../../Shared/types';
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
  const isSmUp = useBreakpoint('up', 'sm');
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

  const pagination = usePagination({
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

  const handleTextFilter = React.useCallback(
    (fs: string) => {
      navigate({
        to: location.pathname,
        search: { query: fs !== '' ? fs : undefined },
      });
    },
    [navigate, location.pathname]
  );

  const handleChangeEntityTypeFilter = (event: CustomEvent) => {
    const entityType = event.detail as null | SelectOption;

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

  const handlePageChange = (event: CustomEvent<unknown>) => {
    pagination.handlePageChange(Number(event.detail));
  };

  const handlePageSizeChange = (event: CustomEvent<unknown>) => {
    const newSize = (event.detail as { pageSize: number }).pageSize;
    pagination.handlePageSizeChange(newSize);
  };

  return (
    <>
      <Box
        style={{
          marginTop: Spacing.S16,
          padding: 0,
        }}
      >
        <Box
          direction="row"
          spacing={2}
          style={{
            justifyContent: 'space-between',
            marginBottom: Spacing.S12,
          }}
        >
          <Box
            direction="row"
            spacing={2}
            style={{
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <FormField labelPosition="top" style={{ padding: 0 }}>
              <FormLabel
                className={globalStyles.visuallyHidden}
                htmlFor="filter-roles"
                slot="label"
              >
                Search Roles
              </FormLabel>
              <DebouncedSearchField
                id="filter-roles"
                onSearch={handleTextFilter}
                placeholder="Search"
                style={{ padding: 0 }}
                value={query ?? ''}
              />
            </FormField>
            <Select
              items={filterableOptions}
              onChange={handleChangeEntityTypeFilter}
              placeholder="All Roles"
              selected={filterableEntityType}
              style={{ minWidth: 250, maxWidth: 360 }}
              valueFn={(item) => (item as SelectOption).label}
            />
          </Box>
          <Tooltip
            disabled={isAccountAdmin && selectedRows.length > 0}
            tooltipPlacement="bottom"
            tooltipText={
              !isAccountAdmin
                ? 'You do not have permission to assign roles.'
                : selectedRows.length === 0
                  ? 'You must select some roles to assign them.'
                  : undefined
            }
          >
            <Button
              data-pendo-id={
                isDelegateUserType
                  ? IAM_ROLES_PENDO_IDS.assignSelectedRolesAsDelegate
                  : isChildUserType
                    ? IAM_ROLES_PENDO_IDS.assignSelectedRolesAsChild
                    : IAM_ROLES_PENDO_IDS.assignSelectedRolesAsParent
              }
              disabled={selectedRows.length === 0 || !isAccountAdmin}
              onClick={() => handleAssignSelectedRoles()}
              style={{ height: 34 }}
              variant="primary"
            >
              Assign Selected Roles
              {!isAccountAdmin || selectedRows.length === 0 ? (
                <Icon icon="info-outline" size="m" />
              ) : null}
            </Button>
          </Tooltip>
        </Box>
        <Table data-testid="roles-table">
          <TableHead>
            <TableRow
              headerbackground="var(--token-component-table-header-nested-background)"
              headerborder
              select={(event) => handleSelect(event, 'all')}
              selected={areAllSelected}
            >
              <TableHeaderCell
                onSort={(event) => handleSort(event, 'name')}
                sortable
                sorted={sort?.column === 'name' ? sort.order : undefined}
                style={{
                  minWidth: COLUMN_WIDTHS.name,
                  ...TABLE_CELL_BASE_STYLE,
                }}
              >
                Role
              </TableHeaderCell>
              {isSmUp && (
                <TableHeaderCell
                  onSort={(event) => handleSort(event, 'access')}
                  sortable
                  sorted={sort?.column === 'access' ? sort.order : undefined}
                  style={{
                    minWidth: COLUMN_WIDTHS.access,
                    ...TABLE_CELL_BASE_STYLE,
                  }}
                >
                  Role Type
                </TableHeaderCell>
              )}
              {isSmUp && (
                <TableHeaderCell
                  style={{
                    minWidth: COLUMN_WIDTHS.description,
                    ...TABLE_CELL_BASE_STYLE,
                  }}
                >
                  Description
                </TableHeaderCell>
              )}
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
                  {isSmUp && (
                    <TableCell
                      style={{
                        minWidth: COLUMN_WIDTHS.access,
                        ...TABLE_CELL_BASE_STYLE,
                      }}
                    >
                      {capitalizeAllWords(roleRow.access, '_')}
                    </TableCell>
                  )}
                  {isSmUp && (
                    <TableCell
                      style={{
                        minWidth: COLUMN_WIDTHS.description,
                        ...TABLE_CELL_BASE_STYLE,
                      }}
                    >
                      {roleRow.permissions.length ? (
                        roleRow.description
                      ) : (
                        <p>
                          {getFacadeRoleDescription(roleRow)}{' '}
                          <Link to={ROLES_LEARN_MORE_LINK}>Learn more</Link>.
                        </p>
                      )}
                    </TableCell>
                  )}
                  <TableCell
                    className={globalStyles.actionsCell}
                    style={{
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
                      marginBottom: Spacing.S12,
                      marginLeft: Spacing.S40,
                      padding: `0 ${Spacing.S4}`,
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
      </Box>
      <AssignSelectedRolesDrawer
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={() => setSelectedRows([])}
        open={isDrawerOpen}
        selectedRoles={selectedRows}
      />
    </>
  );
};
