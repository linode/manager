import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress/CircleProgress';
import {
  CollapsibleTable,
  TableItem,
} from 'src/components/CollapsibleTable/CollapsibleTable';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { SubnetsActionMenu } from 'src/features/VPCs/VPCDetail/SubnetActionMenu';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useSubnetsQuery } from 'src/queries/vpcs';

import { SubnetLinodeRow, SubnetLinodeTableRowHead } from './SubnetLinodeRow';

interface Props {
  vpcId: number;
}

const preferenceKey = 'vpc-subnets';

export const VPCSubnetsTable = ({ vpcId }: Props) => {
  const pagination = usePagination(1, preferenceKey);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'asc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const { data: subnets, error, isLoading } = useSubnetsQuery(
    vpcId,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!subnets || error) {
    return (
      <ErrorState errorText="There was a problem retrieving your subnets. Please try again." />
    );
  }

  const SubnetTableRowHead = (
    <TableRow>
      <StyledTableSortCell
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            width: '50%',
          },
          width: '24%',
        })}
        active={orderBy === 'label'}
        direction={order}
        handleClick={handleOrderChange}
        label="label"
      >
        Subnet Label
      </StyledTableSortCell>
      <Hidden smDown>
        <StyledTableSortCell
          active={orderBy === 'id'}
          direction={order}
          handleClick={handleOrderChange}
          label="id"
          sx={{ width: '10%' }}
        >
          Subnet ID
        </StyledTableSortCell>
      </Hidden>
      <StyledTableCell sx={{ width: '18%' }}>Subnet IP Range</StyledTableCell>
      <Hidden smDown>
        <StyledTableCell sx={{ width: '10%' }}>Linodes</StyledTableCell>
      </Hidden>
      <StyledTableCell></StyledTableCell>
    </TableRow>
  );

  const getTableItems = (): TableItem[] => {
    return subnets.data.map((subnet) => {
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
    <>
      <CollapsibleTable
        TableItems={getTableItems()}
        TableRowEmpty={<TableRowEmpty colSpan={5} message={'No Subnets'} />}
        TableRowHead={SubnetTableRowHead}
      />
      <PaginationFooter
        count={subnets.data?.length || 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};

const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
  whiteSpace: 'nowrap',
}));

const StyledTableSortCell = styled(TableSortCell, {
  label: 'StyledTableSortCell',
})(({ theme }) => ({
  borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
  whiteSpace: 'nowrap',
}));
