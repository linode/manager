import { Button, Select } from '@linode/ui';
import { capitalizeAllWords } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableRowExpanded,
  sortRows,
} from 'akamai-cds-react-components/Table';
import React, { useState } from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { RolesTableActionMenu } from 'src/features/IAM/Roles/RolesTable/RolesTableActionMenu';
import { RolesTableExpandedRow } from 'src/features/IAM/Roles/RolesTable/RolesTableExpandedRow';
import { mapEntityTypesForSelect } from 'src/features/IAM/Shared/utilities';

import type { SelectOption } from '@linode/ui';
import type { Order } from 'akamai-cds-react-components/Table';
import type { RoleMap } from 'src/features/IAM/Shared/utilities';

interface Props {
  roles: RoleMap[];
}

export const RolesTable = ({ roles }: Props) => {
  const [rows, setRows] = useState(roles);

  // Filter string for the search bar
  const [filterString, setFilterString] = React.useState('');

  // Get just the list of entity types from this list of roles, to be used in the selection filter
  const ALL_ROLES_OPTION: SelectOption = {
    label: 'All Roles',
    value: 'all',
  };
  const filterableOptions = [ALL_ROLES_OPTION];
  mapEntityTypesForSelect(roles, ' Roles').forEach((et) =>
    filterableOptions.push(et)
  );
  const [
    filterableEntityType,
    setFilterableEntityType,
  ] = useState<SelectOption | null>(ALL_ROLES_OPTION);

  const [sort, setSort] = useState<
    { column: string; order: Order } | undefined
  >(undefined);

  const [selectedRows, setSelectedRows] = useState<RoleMap[]>([]);

  const areAllSelected = () => {
    return (
      !!rows && rows.length === selectedRows.length && !!selectedRows.length
    );
  };

  const handleSort = (event: CustomEvent, column: string) => {
    setSort({ column, order: event.detail as Order });
    const visibleRows = sortRows(rows, event.detail as Order, column);
    setRows(visibleRows);
  };

  const handleSelect = (event: CustomEvent, row: 'all' | RoleMap) => {
    if (row === 'all') {
      setSelectedRows(areAllSelected() ? [] : rows);
    } else if (selectedRows.includes(row)) {
      setSelectedRows(selectedRows.filter((r) => r !== row));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

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

  const handleTextFilter = (fs: string) => {
    setFilterString(fs);
    const filteredRows = getFilteredRows(fs, filterableEntityType?.value);
    setRows(filteredRows);
  };

  const handleChangeEntityTypeFilter = (_: never, entityType: SelectOption) => {
    setFilterableEntityType(entityType ?? ALL_ROLES_OPTION);
    const filteredRows = getFilteredRows(filterString, entityType?.value);
    setRows(filteredRows);
  };

  const handleAssignSelectedRoles = () => {
    // Logic to assign selected roles
    // console.log('Assigning roles:', selectedRows);
  };

  return (
    <Paper sx={(theme) => ({ marginTop: theme.spacing(2) })}>
      <Grid
        sx={() => ({
          justifyContent: 'space-between',
        })}
        container
        direction="row"
        spacing={2}
      >
        <Grid
          sx={() => ({
            alignItems: 'center',
            justifyContent: 'flex-start',
          })}
          container
          direction="row"
        >
          <DebouncedSearchTextField
            clearable
            debounceTime={250}
            hideLabel
            label="Search"
            onSearch={handleTextFilter}
            placeholder="Search"
            sx={{ width: 320 }}
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
          tooltipText={
            selectedRows.length === 0
              ? 'You must select some roles to assign them.'
              : undefined
          }
          buttonType="primary"
          disabled={selectedRows.length === 0}
          onClick={() => handleAssignSelectedRoles()}
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
            selected={areAllSelected()}
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
              style={{ minWidth: '12%' }}
            >
              Role Type
            </TableHeaderCell>
            <TableHeaderCell
              sort={(event) => handleSort(event, 'description')}
              sortable
              sorted={sort?.column === 'description' ? sort.order : undefined}
              style={{ minWidth: '45%' }}
            >
              Description
            </TableHeaderCell>
            <TableHeaderCell style={{ minWidth: '5%' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!rows?.length ? (
            <TableRow>
              <TableCell>No items to display.</TableCell>
            </TableRow>
          ) : (
            rows.map((roleRow) => (
              <TableRow
                expandable
                hoverable
                key={roleRow.name}
                rowborder
                select={(event) => handleSelect(event, roleRow)}
                selectable
                selected={selectedRows.includes(roleRow)}
              >
                <TableCell style={{ minWidth: '26%' }}>
                  {roleRow.name}
                </TableCell>
                <TableCell style={{ minWidth: '12%' }}>
                  {capitalizeAllWords(roleRow.access, '_')}
                </TableCell>
                <TableCell style={{ minWidth: '45%' }}>
                  {roleRow.description}
                </TableCell>
                <TableCell style={{ minWidth: '5%' }}>
                  <RolesTableActionMenu />
                </TableCell>
                <TableRowExpanded
                  slot="expanded"
                  style={{ marginBottom: 12, padding: 0, width: '100%' }}
                >
                  <RolesTableExpandedRow permissions={roleRow.permissions} />
                </TableRowExpanded>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};
