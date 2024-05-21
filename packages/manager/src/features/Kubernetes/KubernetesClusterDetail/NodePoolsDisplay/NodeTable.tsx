import { styled } from '@mui/material/styles';
import * as React from 'react';

import VerticalDivider from 'src/assets/icons/divider-vertical.svg';
import Lock from 'src/assets/icons/lock.svg';
import Unlock from 'src/assets/icons/unlock.svg';
import { Box } from 'src/components/Box';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/DiskEncryption/utils';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableFooter } from 'src/components/TableFooter';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { LinodeWithMaintenance } from 'src/utilities/linodes';

import { NodeRow as _NodeRow } from './NodeRow';
import { StyledTable } from './NodeTable.styles';

import type { NodeRow } from './NodeRow';
import type { PoolNodeResponse } from '@linode/api-v4/lib/kubernetes';
import type { EncryptionStatus } from '@linode/api-v4/lib/linodes/types';

export interface Props {
  encryptionStatus: EncryptionStatus | undefined;
  nodes: PoolNodeResponse[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  poolId: number;
  typeLabel: string;
}

export const NodeTable = React.memo((props: Props) => {
  const {
    encryptionStatus,
    nodes,
    openRecycleNodeDialog,
    poolId,
    typeLabel,
  } = props;

  const { data: linodes, error, isLoading } = useAllLinodesQuery();
  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const rowData = nodes.map((thisNode) => nodeToRow(thisNode, linodes ?? []));

  const encryptedStatusJSX =
    encryptionStatus === 'enabled' ? (
      <>
        <StyledVerticalDivider />
        <Lock />
        <StyledTypography>Encrypted</StyledTypography>
      </>
    ) : encryptionStatus === 'disabled' ? (
      <>
        <StyledVerticalDivider />
        <Unlock />
        <StyledTypography>Not Encrypted</StyledTypography>
        <TooltipIcon
          status="help"
          text="To enable disk encryption, delete the node pool and create a new node pool. New node pools are always encrypted."
        />
      </>
    ) : null;

  return (
    <OrderBy data={rowData} order={'asc'} orderBy={'label'}>
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData}>
          {({
            count,
            data: paginatedAndOrderedData,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
          }) => (
            <>
              <StyledTable aria-label="List of Your Cluster Nodes">
                <TableHead>
                  <TableRow>
                    <TableSortCell
                      sx={(theme) => ({
                        ...theme.applyTableHeaderStyles,
                        width: '35%',
                      })}
                      active={orderBy === 'label'}
                      direction={order}
                      handleClick={handleOrderChange}
                      label={'label'}
                    >
                      Linode
                    </TableSortCell>
                    <TableSortCell
                      sx={(theme) => ({
                        ...theme.applyTableHeaderStyles,
                        width: '35%',
                      })}
                      active={orderBy === 'instanceStatus'}
                      direction={order}
                      handleClick={handleOrderChange}
                      label={'instanceStatus'}
                    >
                      Status
                    </TableSortCell>
                    <TableSortCell
                      sx={(theme) => ({
                        ...theme.applyTableHeaderStyles,
                        width: '15%',
                      })}
                      active={orderBy === 'ip'}
                      direction={order}
                      handleClick={handleOrderChange}
                      label={'ip'}
                    >
                      IP Address
                    </TableSortCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableContentWrapper
                    length={paginatedAndOrderedData.length}
                    loading={isLoading}
                    loadingProps={{ columns: 4 }}
                  >
                    {paginatedAndOrderedData.map((eachRow) => {
                      return (
                        <_NodeRow
                          instanceId={eachRow.instanceId}
                          instanceStatus={eachRow.instanceStatus}
                          ip={eachRow.ip}
                          key={`node-row-${eachRow.nodeId}`}
                          label={eachRow.label}
                          linodeError={error ?? undefined}
                          nodeId={eachRow.nodeId}
                          nodeStatus={eachRow.nodeStatus}
                          openRecycleNodeDialog={openRecycleNodeDialog}
                          typeLabel={typeLabel}
                        />
                      );
                    })}
                  </TableContentWrapper>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
                      {isDiskEncryptionFeatureEnabled &&
                      encryptionStatus !== undefined ? (
                        <Box
                          alignItems="center"
                          display="flex"
                          flexDirection="row"
                        >
                          <Typography>Pool ID {poolId}</Typography>
                          {encryptedStatusJSX}
                        </Box>
                      ) : (
                        <Typography>Pool ID {poolId}</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </StyledTable>
              <PaginationFooter
                count={count}
                eventCategory="Node Table"
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
              />
            </>
          )}
        </Paginate>
      )}
    </OrderBy>
  );
});

/**
 * Transforms an LKE Pool Node to a NodeRow.
 */
export const nodeToRow = (
  node: PoolNodeResponse,
  linodes: LinodeWithMaintenance[]
): NodeRow => {
  const foundLinode = linodes.find(
    (thisLinode) => thisLinode.id === node.instance_id
  );

  return {
    instanceId: node.instance_id || undefined,
    instanceStatus: foundLinode?.status,
    ip: foundLinode?.ipv4[0],
    label: foundLinode?.label,
    nodeId: node.id,
    nodeStatus: node.status,
  };
};

export const StyledVerticalDivider = styled(VerticalDivider, {
  label: 'StyledVerticalDivider',
})(({ theme }) => ({
  margin: `0 ${theme.spacing(2)}`,
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  margin: `0 0 0 ${theme.spacing()}`,
}));
