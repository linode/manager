import { Button, Select, Typography } from '@linode/ui';
import { capitalizeAllWords } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Pagination } from 'akamai-cds-react-components/Pagination';
import {
  sortRows,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableRowExpanded,
} from 'akamai-cds-react-components/Table';
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
import { usePagination } from 'src/hooks/usePagination';

import { ROLES_TABLE_PREFERENCE_KEY } from '../../Shared/constants';

import type { RoleView } from '../../Shared/types';
import type { SelectOption } from '@linode/ui';
import type { Order } from 'akamai-cds-react-components/Table';
const ALL_ROLES_OPTION: SelectOption = {
  label: 'All Roles',
  value: 'all',
};

interface Props {
  roles?: RoleView[];
}

export const RolesTable = ({ roles = [] }: Props) => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  // Filter string for the search bar
  const [filterString, setFilterString] = React.useState('');
  const [filterableEntityType, setFilterableEntityType] =
    useState<null | SelectOption>(ALL_ROLES_OPTION);
  const [sort, setSort] = useState<
    undefined | { column: string; order: Order }
  >(undefined);
  const [selectedRows, setSelectedRows] = useState<RoleView[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const pagination = usePagination(1, ROLES_TABLE_PREFERENCE_KEY);

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

  const filteredRows = React.useMemo(
    () => getFilteredRows(filterString, filterableEntityType?.value),
    [roles, filterString, filterableEntityType]
  );

  // Get just the list of entity types from this list of roles, to be used in the selection filter
  const filterableOptions = React.useMemo(() => {
    return [ALL_ROLES_OPTION, ...mapEntityTypesForSelect(roles, ' Roles')];
  }, [roles]);

  const sortedRows = React.useMemo(() => {
    if (!sort) return filteredRows;
    return sortRows(filteredRows, sort.order, sort.column);
  }, [filteredRows, sort]);

  const paginatedRows = React.useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return sortedRows.slice(start, start + pagination.pageSize);
  }, [sortedRows, pagination.page, pagination.pageSize]);

  const areAllSelected = React.useMemo(() => {
    return (
      !!paginatedRows?.length &&
      !!selectedRows?.length &&
      paginatedRows?.length === selectedRows?.length
    );
  }, [paginatedRows, selectedRows]);

  const handleSort = (event: CustomEvent, column: string) => {
    setSort({ column, order: event.detail as Order });
  };

  const handleSelect = (event: CustomEvent, row: 'all' | RoleView) => {
    if (row === 'all') {
      setSelectedRows(areAllSelected ? [] : paginatedRows);
    } else if (selectedRows.includes(row)) {
      setSelectedRows(selectedRows.filter((r) => r !== row));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const handleTextFilter = (fs: string) => {
    setFilterString(fs);
    pagination.handlePageChange(1);
  };

  const handleChangeEntityTypeFilter = (_: never, entityType: SelectOption) => {
    setFilterableEntityType(entityType ?? ALL_ROLES_OPTION);
    pagination.handlePageChange(1);
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
    pagination.handlePageChange(1);
  };
  const handleExpandToggle = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setExpandedRows((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
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
              value={filterString}
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
            disabled={selectedRows.length === 0}
            onClick={() => handleAssignSelectedRoles()}
            tooltipText={
              selectedRows.length === 0
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
              headerborder
              select={(event) => handleSelect(event, 'all')}
              selectable
              selected={areAllSelected}
            >
              <TableHeaderCell
                sort={(event) => handleSort(event, 'name')}
                sortable
                sorted={sort?.column === 'name' ? sort.order : undefined}
                style={{ minWidth: '26%' }}
              >
                Role
              </TableHeaderCell>
              <TableHeaderCell
                sort={(event) => handleSort(event, 'access')}
                sortable
                sorted={sort?.column === 'access' ? sort.order : undefined}
                style={{ minWidth: '14%' }}
              >
                Role Type
              </TableHeaderCell>
              <TableHeaderCell style={{ minWidth: '38%' }}>
                Description
              </TableHeaderCell>
              <TableHeaderCell style={{ minWidth: '10%' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {!paginatedRows?.length ? (
              <TableRow>
                <TableCell style={{ justifyContent: 'center' }}>
                  No items to display.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((roleRow) => (
                <TableRow
                  expandable
                  expanded={expandedRows.includes(roleRow.name)}
                  hoverable
                  key={roleRow.name}
                  rowborder
                  select={(event) => handleSelect(event, roleRow)}
                  selectable
                  selected={selectedRows.includes(roleRow)}
                >
                  <TableCell

                    onClick={(e) => handleExpandToggle(e, roleRow.name)}
                    style={{ minWidth: '26%', wordBreak: 'break-word' }}

                  >
                    {roleRow.name}
                  </TableCell>
                  <TableCell style={{ minWidth: '14%' }}>
                    {capitalizeAllWords(roleRow.access, '_')}
                  </TableCell>
                  <TableCell style={{ minWidth: '38%' }}>
                    {roleRow.permissions.length ? (
                      roleRow.description
                    ) : (
                      // TODO: update the link for the description when it's ready - UIE-8534
                      <Typography>
                        {getFacadeRoleDescription(roleRow)}{' '}
                        <Link to="#">Learn more.</Link>
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell
                    style={{
                      minWidth: '10%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <RolesTableActionMenu
                      onClick={() => {
                        assignRoleRow(roleRow);
                      }}
                    />
                  </TableCell>
                  <TableRowExpanded
                    slot="expanded"
                    style={{ marginBottom: 12, padding: 0, width: '100%' }}
                  >
                    {expandedRows.includes(roleRow.name) && (
                      <RolesTableExpandedRow
                        permissions={roleRow.permissions}
                      />
                    )}
                  </TableRowExpanded>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Pagination
          count={filteredRows.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
          style={{ borderTop: 0 }}
        />
      </Paper>
      <AssignSelectedRolesDrawer
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        selectedRoles={selectedRows}
      />
    </>
  );
};
