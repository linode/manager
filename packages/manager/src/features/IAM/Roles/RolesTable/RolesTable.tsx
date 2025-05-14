import { Button, Select, Typography } from '@linode/ui';
import { capitalizeAllWords } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
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
import { RolesTableActionMenu } from 'src/features/IAM/Roles/RolesTable/RolesTableActionMenu';
import { RolesTableExpandedRow } from 'src/features/IAM/Roles/RolesTable/RolesTableExpandedRow';
import {
  getFacadeRoleDescription,
  mapEntityTypesForSelect,
} from 'src/features/IAM/Shared/utilities';

import type { RoleView } from '../../Shared/types';
import type { SelectOption } from '@linode/ui';
import type { Order } from 'akamai-cds-react-components/Table';

const ALL_ROLES_OPTION: SelectOption = {
  label: 'All Roles',
  value: 'all',
};

interface Props {
  roles: RoleView[];
}

export const RolesTable = ({ roles }: Props) => {
  const [rows, setRows] = useState(roles);

  // Filter string for the search bar
  const [filterString, setFilterString] = React.useState('');

  // Get just the list of entity types from this list of roles, to be used in the selection filter
  const filterableOptions = React.useMemo(() => {
    return [ALL_ROLES_OPTION, ...mapEntityTypesForSelect(roles, ' Roles')];
  }, [roles]);

  const [filterableEntityType, setFilterableEntityType] =
    useState<null | SelectOption>(ALL_ROLES_OPTION);

  const [sort, setSort] = useState<
    undefined | { column: string; order: Order }
  >(undefined);

  const [selectedRows, setSelectedRows] = useState<RoleView[]>([]);

  const areAllSelected = React.useMemo(() => {
    return (
      !!rows?.length &&
      !!selectedRows?.length &&
      rows?.length === selectedRows?.length
    );
  }, [rows, selectedRows]);

  const handleSort = (event: CustomEvent, column: string) => {
    setSort({ column, order: event.detail as Order });
    const visibleRows = sortRows(rows, event.detail as Order, column);
    setRows(visibleRows);
  };

  const handleSelect = (event: CustomEvent, row: 'all' | RoleView) => {
    if (row === 'all') {
      setSelectedRows(areAllSelected ? [] : rows);
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
    <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
      <Grid
        container
        direction="row"
        spacing={2}
        sx={{ justifyContent: 'space-between' }}
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
            <TableHeaderCell
              sort={(event) => handleSort(event, 'description')}
              sortable
              sorted={sort?.column === 'description' ? sort.order : undefined}
              style={{ minWidth: '38%' }}
            >
              Description
            </TableHeaderCell>
            <TableHeaderCell style={{ minWidth: '10%' }} />
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
                <TableCell style={{ minWidth: '10%' }}>
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
