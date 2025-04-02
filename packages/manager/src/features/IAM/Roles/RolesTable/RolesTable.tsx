import React, { useState } from 'react';
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

import type { Order } from 'akamai-cds-react-components/Table';
import { useAccountPermissions } from 'src/queries/iam/iam';
import {
  mapAccountPermissionsToRoles, RoleMap
} from 'src/features/IAM/Shared/utilities';
import { RolesTableActionMenu } from 'src/features/IAM/Roles/RolesTable/RolesTableActionMenu';
import { Permissions } from 'src/features/IAM/Shared/Permissions/Permissions';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useTheme } from '@mui/material';

export const RolesTable = () => {

  const {data: accountPermissions, isLoading, isSuccess} = useAccountPermissions();

  const theme = useTheme();

  const { roles } = React.useMemo(() => {
    if (!accountPermissions) {
      return { roles: [] };
    }
    const roles = mapAccountPermissionsToRoles(accountPermissions);

    return { roles };
  }, [accountPermissions]);

  const [rows, setRows] = useState(roles);

  const [sort, setSort] = useState<
    { column: string; order: Order } | undefined
  >(undefined);

  const [selectedRows, setSelectedRows] = useState<RoleMap[]>([]);

  const areAllSelected = () => {
    return rows.length === selectedRows.length;
  };

  const handleSort = (event: CustomEvent, column: string) => {
    setSort({ column, order: event.detail as Order });
    const visibileRows = sortRows(rows, event.detail as Order, column);
    setRows(visibileRows);
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

  const prettyPrintAccess = (access) => {
    return access.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return (
    <>
      <Paper sx={(theme) => ({ marginTop: theme.spacing(2) })}>

        <Box
          sx={(theme) => ({
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(2),
          })}
        >
          <DebouncedSearchTextField
            clearable
            debounceTime={250}
            hideLabel
            label="Search"
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
                style={{ width: '25%' }}
              >
                Role
              </TableHeaderCell>
              <TableHeaderCell
                sort={(event) => handleSort(event, 'access')}
                sortable
                sorted={sort?.column === 'access' ? sort.order : undefined}
                style={{ width: '15%' }}
              >
                Role Type
              </TableHeaderCell>
              <TableHeaderCell
                sort={(event) => handleSort(event, 'description')}
                sortable
                sorted={sort?.column === 'description' ? sort.order : undefined}
                style={{ width: '45%' }}
              >
                Description
              </TableHeaderCell>
              <TableHeaderCell style={{ width: '5%' }}></TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((roleRow) => (
              <TableRow
                expandable={!!roleRow.permissions.length}
                hoverable
                key={roleRow.name}
                rowborder
                select={(event) => handleSelect(event, roleRow)}
                selectable
                selected={selectedRows.includes(roleRow)}
              >
                <TableCell>{roleRow.name}</TableCell>
                <TableCell>{prettyPrintAccess(roleRow.access)}</TableCell>
                <TableCell>{roleRow.description}</TableCell>
                <TableCell>
                  <RolesTableActionMenu></RolesTableActionMenu>
                </TableCell>
                <TableRowExpanded slot="expanded" style={{ width: '100%' }}>

                  <Paper
                    sx={{
                      backgroundColor:
                        theme.name === 'light'
                          ? theme.tokens.color.Neutrals[5]
                          : theme.tokens.color.Neutrals[100],
                      marginTop: theme.spacing(1.25),
                      padding: `${theme.tokens.spacing.S12} ${theme.tokens.spacing.S8}`,
                      width: '90%',
                    }}
                  >
                    <Permissions permissions={roleRow.permissions}></Permissions>
                  </Paper>
                </TableRowExpanded>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};
