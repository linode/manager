import Box from '@mui/material/Box';
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

import type { Order } from 'akamai-cds-react-components/Table';
import type { RoleMap } from 'src/features/IAM/Shared/utilities';

interface Props {
  roles: RoleMap[];
}

export const RolesTable = ({ roles }: Props) => {
  const [rows, setRows] = useState(roles);

  const [sort, setSort] = useState<
    { column: string; order: Order } | undefined
  >(undefined);

  const [selectedRows, setSelectedRows] = useState<RoleMap[]>([]);

  const areAllSelected = () => {
    return rows.length === selectedRows.length && !!selectedRows.length;
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

  const handleFilter = (filterString: string) => {
    const filteredRows = roles.filter((r) =>
        r.name.includes(filterString) ||
        r.description.includes(filterString) ||
        r.access.includes(filterString)
    );
    setRows(filteredRows);
  };

  const prettyPrintAccess = (access: string) => {
    return access.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <Paper sx={(theme) => ({ marginTop: theme.spacing(2) })}>

      <Box
        sx={(theme) => ({
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: theme.spacing(2)
        })}
      >
        <DebouncedSearchTextField
          clearable
          debounceTime={250}
          hideLabel
          label="Search"
          onSearch={handleFilter}
          placeholder="Search"
          sx={{ width: 320 }}
          value=""
        />
      </Box>

      <Table>
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
            <TableHeaderCell style={{ minWidth: '5%' }}></TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!rows.length && (
            <TableRow>
              <TableCell>
                No items to display.
              </TableCell>
            </TableRow>
          )}
          {rows && rows.map((roleRow) => (
            <TableRow
              expandable
              hoverable
              key={roleRow.name}
              rowborder
              select={(event) => handleSelect(event, roleRow)}
              selectable
              selected={selectedRows.includes(roleRow)}
            >
              <TableCell style={{ minWidth: '26%' }}>{roleRow.name}</TableCell>
              <TableCell style={{ minWidth: '12%' }}>{prettyPrintAccess(roleRow.access)}</TableCell>
              <TableCell style={{ minWidth: '45%' }}>{roleRow.description}</TableCell>
              <TableCell style={{ minWidth: '5%' }}>
                <RolesTableActionMenu></RolesTableActionMenu>
              </TableCell>
              <TableRowExpanded slot="expanded" style={{ width: '100%', padding: 0, marginBottom: 12 }}>
                <RolesTableExpandedRow permissions={roleRow.permissions}></RolesTableExpandedRow>
              </TableRowExpanded>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};
