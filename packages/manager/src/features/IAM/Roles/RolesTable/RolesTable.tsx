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
import { useNavigate, useSearch } from '@tanstack/react-router';
import React, { useState } from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useDelegationRole } from '../../hooks/useDelegationRole';
import { useHasTableStripingEnabled } from '../../hooks/useHasTableStripingEnabled';
import { useOrder } from '../../hooks/useOrder';
import { usePagination } from '../../hooks/usePagination';
import { usePermissions } from '../../hooks/usePermissions';
import { Box } from '../../Shared/Box/Box';
import {
  IAM_ROLES_PENDO_IDS,
  ROLES_LEARN_MORE_LINK,
  ROLES_TABLE_PREFERENCE_KEY,
} from '../../Shared/constants';
import { DebouncedSearchField } from '../../Shared/DebouncedSearchField/DebouncedSearchField';
import globalStyles from '../../Shared/global.module.css';
import { Link } from '../../Shared/Link/Link';
import {
  getFacadeRoleDescription,
  mapEntityTypesForSelect,
} from '../../Shared/utilities';
import { AssignSelectedRolesDrawer } from './AssignSelectedRolesDrawer';
import { RolesTableActionMenu } from './RolesTableActionMenu';
import { RolesTableExpandedRow } from './RolesTableExpandedRow';

import type { RoleView, SelectOption } from '../../Shared/types';
import type { AccessType } from '@linode/api-v4';

const COLUMN_WIDTHS = {
  name: '26%',
  access: '14%',
  description: '38%',
  actions: '10%',
};

/** URL / useOrder keys → RoleView fields used by sortRows */
const SORT_COLUMN_TO_FIELD = {
  role: 'name',
  role_type: 'access',
} as const;

const TABLE_CELL_BASE_STYLE = {
  boxSizing: 'border-box' as const,
};

const ROLES_URL = '/iam/roles';
interface Props {
  roles?: RoleView[];
}
const DEFAULT_PAGE_SIZE = 10;

export const RolesTable = ({ roles = [] }: Props) => {
  const isSmUp = useBreakpoint('up', 'sm');
  const navigate = useNavigate();
  const { query, roleType: roleTypeParam } = useSearch({
    strict: false,
  });
  const hasTableStripingEnabled = useHasTableStripingEnabled();

  const order = useOrder({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'role',
      },
      from: ROLES_URL,
    },
    preferenceKey: `${ROLES_TABLE_PREFERENCE_KEY}-order`,
  });

  const [selectedRows, setSelectedRows] = useState<RoleView[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const { data: permissions } = usePermissions('account', ['is_account_admin']);
  const isAccountAdmin = permissions?.is_account_admin;
  const { isDelegateUserType, isChildUserType } = useDelegationRole();
  // Filtering
  const filteredRows = React.useMemo(() => {
    return roles.filter(
      (r) =>
        (!roleTypeParam || roleTypeParam === r.entity_type) &&
        (r.name.includes(query ?? '') ||
          r.description.includes(query ?? '') ||
          r.access.includes(query ?? ''))
    );
  }, [roles, query, roleTypeParam]);

  // Get just the list of entity types from this list of roles, to be used in the selection filter
  const filterableOptions = React.useMemo(() => {
    return [...mapEntityTypesForSelect(roles, ' Roles')];
  }, [roles]);

  const selectedRoleType = React.useMemo(() => {
    return filterableOptions.find((opt) => opt.value === roleTypeParam) ?? null;
  }, [filterableOptions, roleTypeParam]);

  const sortedRows = React.useMemo(() => {
    const sortField =
      SORT_COLUMN_TO_FIELD[
        order.orderBy as keyof typeof SORT_COLUMN_TO_FIELD
      ] ?? order.orderBy;
    return sortRows(filteredRows, order.order, sortField);
  }, [filteredRows, order.order, order.orderBy]);

  const pagination = usePagination({
    currentRoute: ROLES_URL,
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
        to: ROLES_URL,
        search: (prev) => ({
          ...prev,
          page: 1,
          query: fs !== '' ? fs : undefined,
        }),
      });
    },
    [navigate]
  );

  const handleChangeEntityTypeFilter = (event: CustomEvent) => {
    const entityType = event.detail as null | SelectOption;

    navigate({
      to: ROLES_URL,
      search: (prev) => ({
        ...prev,
        page: 1,
        roleType: entityType ? (entityType.value as AccessType) : undefined,
      }),
    });
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
              autocomplete
              clearable
              items={filterableOptions}
              onChange={handleChangeEntityTypeFilter}
              placeholder="Filter by type"
              selected={selectedRoleType}
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
                onSort={() =>
                  order.handleOrderChange(
                    'role',
                    order.order === 'asc' && order.orderBy === 'role'
                      ? 'desc'
                      : 'asc'
                  )
                }
                sortable
                sorted={order.orderBy === 'role' ? order.order : undefined}
                style={{
                  minWidth: COLUMN_WIDTHS.name,
                  ...TABLE_CELL_BASE_STYLE,
                }}
              >
                Role
              </TableHeaderCell>
              {isSmUp && (
                <TableHeaderCell
                  onSort={() =>
                    order.handleOrderChange(
                      'role_type',
                      order.order === 'asc' && order.orderBy === 'role_type'
                        ? 'desc'
                        : 'asc'
                    )
                  }
                  sortable
                  sorted={
                    order.orderBy === 'role_type' ? order.order : undefined
                  }
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
                  zebra={hasTableStripingEnabled}
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
        <Pagination
          count={sortedRows.length}
          itemsLabel="Roles"
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
          style={{ border: 0 }}
        />
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
