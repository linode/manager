import { Box, Button, Paper, Typography } from '@linode/ui';
import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { LinodeInterfacesTable } from './LinodeInterfacesTable';

interface Props {
  linodeId: number;
}

export const LinodeInterfaces = (props: Props) => {
  return (
    <Box>
      <Paper
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          pl: 2,
          pr: 0.5,
          py: 0.5,
        }}
      >
        <Typography variant="h3">Network Interfaces</Typography>
        <Button buttonType="primary">Add Network Interface</Button>
      </Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>MAC Address</TableCell>
            <TableCell>Version</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <LinodeInterfacesTable linodeId={props.linodeId} />
        </TableBody>
      </Table>
    </Box>
  );
};
