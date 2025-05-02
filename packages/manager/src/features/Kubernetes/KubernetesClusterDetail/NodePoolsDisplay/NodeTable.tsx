import { useAllLinodesQuery, useProfile } from '@linode/queries';
import { Box, ErrorState, TooltipIcon, Typography } from '@linode/ui';
import { DateTime, Interval } from 'luxon';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import EmptyStateCloud from 'src/assets/icons/empty-state-cloud.svg';
import Lock from 'src/assets/icons/lock.svg';
import Unlock from 'src/assets/icons/unlock.svg';
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
import { parseAPIDate } from 'src/utilities/date';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { NodeRow as _NodeRow } from './NodeRow';
import {
  StyledNotEncryptedBox,
  StyledPoolInfoBox,
  StyledTableFooter,
  StyledTypography,
  StyledVerticalDivider,
} from './NodeTable.styles';

import type { StatusFilter } from './NodePoolsDisplay';
import type { NodeRow } from './NodeRow';
import type {
  KubernetesTier,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import type { EncryptionStatus } from '@linode/api-v4/lib/linodes/types';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';

export interface Props {
  clusterCreated: string;
  clusterId: number;
  clusterTier: KubernetesTier;
  encryptionStatus: EncryptionStatus | undefined;
  nodes: PoolNodeResponse[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  poolId: number;
  regionSupportsDiskEncryption: boolean;
  statusFilter: StatusFilter;
  tags: string[];
  typeLabel: string;
}

export const encryptionStatusTestId = 'encryption-status-fragment';

export const NodeTable = React.memo((props: Props) => {
  const {
    clusterCreated,
    clusterId,
    clusterTier,
    encryptionStatus,
    nodes,
    openRecycleNodeDialog,
    poolId,
    regionSupportsDiskEncryption,
    statusFilter,
    tags,
    typeLabel,
  } = props;

  const { data: profile } = useProfile();

  const { data: linodes, error, isLoading } = useAllLinodesQuery();
  const { isDiskEncryptionFeatureEnabled } =
    useIsDiskEncryptionFeatureEnabled();

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

  const filteredRowData = ['offline', 'provisioning', 'running'].includes(
    statusFilter
  )
    ? rowData.filter((row) => {
        if (statusFilter === 'provisioning') {
          return ['provisioning', undefined].includes(row.instanceStatus);
        }
        return row.instanceStatus === statusFilter;
      })
    : null;

  // It takes ~5 minutes for LKE-E cluster nodes to be provisioned and we want to explain this to the user
  // since nodes are not returned right away unlike standard LKE
  const isEnterpriseClusterWithin10MinsOfCreation = () => {
    if (clusterTier !== 'enterprise') {
      return false;
    }

    const createdTime = parseAPIDate(clusterCreated).setZone(profile?.timezone);

    const interval = Interval.fromDateTimes(
      createdTime,
      createdTime.plus({ minutes: 10 })
    );

    const currentTime = DateTime.fromISO(DateTime.now().toISO(), {
      zone: profile?.timezone,
    });

    return interval.contains(currentTime);
  };

  return (
    <OrderBy data={filteredRowData || rowData} order="asc" orderBy="label">
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
                      active={orderBy === 'label'}
                      direction={order}
                      handleClick={handleOrderChange}
                      label={'label'}
                      sx={(theme) => ({
                        ...theme.applyTableHeaderStyles,
                        width: '35%',
                      })}
                    >
                      Linode
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'instanceStatus'}
                      direction={order}
                      handleClick={handleOrderChange}
                      label={'instanceStatus'}
                      sx={(theme) => ({
                        ...theme.applyTableHeaderStyles,
                        width: '25%',
                      })}
                    >
                      Status
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'ip'}
                      direction={order}
                      handleClick={handleOrderChange}
                      label={'ip'}
                      sx={(theme) => ({
                        ...theme.applyTableHeaderStyles,
                        width: '35%',
                      })}
                    >
                      IP Address
                    </TableSortCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowData.length === 0 &&
                    isEnterpriseClusterWithin10MinsOfCreation() && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <ErrorState
                            compact
                            CustomIcon={EmptyStateCloud}
                            errorText={
                              <Box>
                                <Typography
                                  data-qa-error-msg
                                  style={{ textAlign: 'center' }}
                                  variant="h3"
                                >
                                  Worker nodes will appear once cluster
                                  provisioning is complete.
                                </Typography>
                                <Typography>
                                  Provisioning can take up to 10 minutes.
                                </Typography>
                              </Box>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  {(rowData.length > 0 ||
                    !isEnterpriseClusterWithin10MinsOfCreation()) && (
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
                  )}
                </TableBody>
              </Table>
              <PaginationFooter
                count={count}
                eventCategory="Node Table"
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
                /**
                 * M3-9360: Since this table is in an accordion, the position needs to be relative
                 * to prevent an overflow-y issue with the absolutely positioned visually-hidden footer label
                 **/
                sx={{ position: 'relative' }}
              />
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
                        regionSupportsDiskEncryption={
                          regionSupportsDiskEncryption
                        }
                        tooltipText={undefined}
                      />
                    </Box>
                  ) : (
                    <Typography>Pool ID {poolId}</Typography>
                  )}
                </StyledPoolInfoBox>
                <TagCell tags={tags} updateTags={updateTags} view="inline" />
              </StyledTableFooter>
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
  regionSupportsDiskEncryption,
  tooltipText,
}: {
  encryptionStatus: EncryptionStatus;
  regionSupportsDiskEncryption: boolean;
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
        {regionSupportsDiskEncryption && tooltipText ? (
          <TooltipIcon status="help" text={tooltipText} />
        ) : null}
      </StyledNotEncryptedBox>
    </>
  ) : null;
};
