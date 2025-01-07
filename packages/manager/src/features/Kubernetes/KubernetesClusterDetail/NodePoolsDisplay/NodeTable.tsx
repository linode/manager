import { Box, TooltipIcon, Typography } from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import Lock from 'src/assets/icons/lock.svg';
import Unlock from 'src/assets/icons/unlock.svg';
import { DISK_ENCRYPTION_NODE_POOL_GUIDANCE_COPY } from 'src/components/Encryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { TagCell } from 'src/components/TagCell/TagCell';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { NodeRow as _NodeRow } from './NodeRow';
import {
  StyledNotEncryptedBox,
  StyledPoolInfoBox,
  StyledTableFooter,
  StyledTypography,
  StyledVerticalDivider,
} from './NodeTable.styles';

import type { NodeRow } from './NodeRow';
import type { PoolNodeResponse } from '@linode/api-v4/lib/kubernetes';
import type { EncryptionStatus } from '@linode/api-v4/lib/linodes/types';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';

export interface Props {
  clusterId: number;
  encryptionStatus: EncryptionStatus | undefined;
  nodes: PoolNodeResponse[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  poolId: number;
  tags: string[];
  typeLabel: string;
}

export const encryptionStatusTestId = 'encryption-status-fragment';

export const NodeTable = React.memo((props: Props) => {
  const {
    clusterId,
    encryptionStatus,
    nodes,
    openRecycleNodeDialog,
    poolId,
    tags,
    typeLabel,
  } = props;

  const { data: linodes, error, isLoading } = useAllLinodesQuery();
  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const { mutateAsync: updateNodePool } = useUpdateNodePoolMutation(
    clusterId,
    poolId
  );

  const updateTags = React.useCallback(
    (tags: string[]) => {
      return updateNodePool({ tags }).catch((e) =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error updating tags')[0].reason,
          {
            variant: 'error',
          }
        )
      );
    },
    [updateNodePool]
  );

  const rowData = nodes.map((thisNode) => nodeToRow(thisNode, linodes ?? []));

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
              <Table aria-label="List of Your Cluster Nodes">
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
                        width: '25%',
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
                        width: '35%',
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
              </Table>
              <StyledTableFooter>
                <StyledPoolInfoBox>
                  {isDiskEncryptionFeatureEnabled &&
                  encryptionStatus !== undefined ? (
                    <Box
                      alignItems="center"
                      data-testid={encryptionStatusTestId}
                      display="flex"
                    >
                      <Typography sx={{ textWrap: 'nowrap' }}>
                        Pool ID {poolId}
                      </Typography>
                      <StyledVerticalDivider />
                      <EncryptedStatus
                        encryptionStatus={encryptionStatus}
                        tooltipText={DISK_ENCRYPTION_NODE_POOL_GUIDANCE_COPY}
                      />
                    </Box>
                  ) : (
                    <Typography>Pool ID {poolId}</Typography>
                  )}
                </StyledPoolInfoBox>
                <TagCell tags={tags} updateTags={updateTags} view="inline" />
              </StyledTableFooter>
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

export const EncryptedStatus = ({
  encryptionStatus,
  tooltipText,
}: {
  encryptionStatus: EncryptionStatus;
  tooltipText: string | undefined;
}) => {
  return encryptionStatus === 'enabled' ? (
    <>
      <Lock />
      <StyledTypography>Encrypted</StyledTypography>
    </>
  ) : encryptionStatus === 'disabled' ? (
    <>
      <Unlock />
      <StyledNotEncryptedBox>
        <Typography sx={{ whiteSpace: 'nowrap' }}>Not Encrypted</Typography>
        {tooltipText ? <TooltipIcon status="help" text={tooltipText} /> : null}
      </StyledNotEncryptedBox>
    </>
  ) : null;
};
