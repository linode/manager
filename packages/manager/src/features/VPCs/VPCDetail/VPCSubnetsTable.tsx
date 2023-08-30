import { Subnet } from '@linode/api-v4/lib/vpcs/types';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import {
  CollapsibleTable,
  TableItem,
} from 'src/components/CollapsibleTable/CollapsibleTable';
import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { SubnetsActionMenu } from 'src/features/VPCs/VPCDetail/SubnetActionMenu';

import { SubnetLinodeRow, SubnetLinodeTableRowHead } from './SubnetLinodeRow';

interface Props {
  subnets: Subnet[];
}

export const VPCSubnetsTable = (props: Props) => {
  const { subnets } = props;

  const getTableItems = (): TableItem[] => {
    return subnets.map((subnet) => {
      const OuterTableCells = (
        <>
          <Hidden smDown>
            <TableCell>{subnet.id}</TableCell>
          </Hidden>
          <TableCell>{subnet.ipv4}</TableCell>
          <Hidden smDown>
            <TableCell>{subnet.linodes.length}</TableCell>
          </Hidden>
          <TableCell align="right">
            <SubnetsActionMenu></SubnetsActionMenu>
          </TableCell>
        </>
      );

      const InnerTable = (
        <Table aria-label="Linode" size="small">
          <TableHead style={{ fontSize: '.875rem' }}>
            {SubnetLinodeTableRowHead}
          </TableHead>
          <TableBody>
            {subnet.linodes.length > 0 ? (
              subnet.linodes.map((linodeId) => (
                <SubnetLinodeRow key={linodeId} linodeId={linodeId} />
              ))
            ) : (
              <TableRowEmpty colSpan={5} message={'No Linodes'} />
            )}
          </TableBody>
        </Table>
      );

      return {
        InnerTable,
        OuterTableCells,
        id: subnet.id,
        label: subnet.label,
      };
    });
  };

  return (
    <CollapsibleTable
      TableItems={getTableItems()}
      TableRowHead={SubnetTableRowHead}
    />
  );
};

const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
}));

const SubnetTableRowHead = (
  <TableRow>
    <StyledTableCell
      sx={(theme) => ({
        [theme.breakpoints.down('sm')]: {
          width: '50%',
        },
        width: '24%',
      })}
    >
      Subnet Label
    </StyledTableCell>
    <Hidden smDown>
      <StyledTableCell sx={{ width: '10%' }}>Subnet ID</StyledTableCell>
    </Hidden>
    <StyledTableCell sx={{ width: '18%' }}>Subnet IP Range</StyledTableCell>
    <Hidden smDown>
      <StyledTableCell sx={{ width: '10%' }}>Linodes</StyledTableCell>
    </Hidden>
    <StyledTableCell></StyledTableCell>
  </TableRow>
);
