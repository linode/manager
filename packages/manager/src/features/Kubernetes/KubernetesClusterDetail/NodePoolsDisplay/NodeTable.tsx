import { useAllLinodesQuery, useProfile } from '@linode/queries';
import {
  Box,
  Divider,
  ErrorState,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { DateTime, Interval } from 'luxon';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import EmptyStateCloud from 'src/assets/icons/empty-state-cloud.svg';
import Lock from 'src/assets/icons/lock.svg';
import Unlock from 'src/assets/icons/unlock.svg';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
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
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { parseAPIDate } from 'src/utilities/date';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { useIsLkeEnterpriseEnabled } from '../../kubeUtils';
import { NodeRow as _NodeRow } from './NodeRow';
import { NodePoolTableFooter } from './NodeTable.styles';
import { nodeToRow } from './utils';

import type { StatusFilter } from './NodePoolsDisplay';
import type {
  KubeNodePoolResponse,
  KubernetesTier,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import type { EncryptionStatus } from '@linode/api-v4/lib/linodes/types';

export interface Props {
  clusterCreated: string;
  clusterId: number;
  clusterTier: KubernetesTier;
  encryptionStatus: EncryptionStatus;
  isLkeClusterRestricted: boolean;
  nodes: PoolNodeResponse[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  poolId: number;
  poolVersion: KubeNodePoolResponse['k8s_version'];
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
    poolVersion,
    encryptionStatus,
    nodes,
    openRecycleNodeDialog,
    isLkeClusterRestricted,
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
  const { isLkeEnterprisePhase2FeatureEnabled } = useIsLkeEnterpriseEnabled();

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

  const shouldShowVpcIPAddressColumns =
    isLkeEnterprisePhase2FeatureEnabled && clusterTier === 'enterprise';
  const numColumns = shouldShowVpcIPAddressColumns ? 6 : 4;

  const rowData = nodes.map((thisNode) =>
    nodeToRow(thisNode, linodes ?? [], shouldShowVpcIPAddressColumns)
  );

  const filteredRowData = ['offline', 'provisioning', 'running'].includes(
    statusFilter
  )
    ? rowData.filter((row) => {
        if (statusFilter === 'provisioning') {
          return ['provisioning', undefined].includes(row.instanceStatus);
        }
        if (statusFilter === 'running') {
          // The linode instance status needs to be running AND the node status needs to be ready before we consider it "running"
          return row.instanceStatus === 'running' && row.nodeStatus === 'ready';
        }
        return row.instanceStatus === statusFilter;
      })
    : null;

  // It takes anywhere between 5-20+ minutes for LKE-E cluster nodes to be provisioned and we want to explain this to the user
  // since nodes are not returned right away unlike standard LKE
  const isEnterpriseClusterWithin20MinsOfCreation = () => {
    if (clusterTier !== 'enterprise') {
      return false;
    }

    const createdTime = parseAPIDate(clusterCreated).setZone(profile?.timezone);

    const interval = Interval.fromDateTimes(
      createdTime,
      createdTime.plus({ minutes: 20 })
    );

    const currentTime = DateTime.fromISO(DateTime.now().toISO(), {
      zone: profile?.timezone,
    });

    return interval.contains(currentTime);
  };

  const { handleOrderChange, order, orderBy, sortedData } = useOrderV2({
    data: filteredRowData || rowData,
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/kubernetes/clusters/$clusterId/summary',
    },
    preferenceKey: 'node-pool-order',
  });

  return (
    <Paginate data={sortedData ?? []}>
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
                  Public IPv4
                </TableSortCell>
                {shouldShowVpcIPAddressColumns && (
                  <TableCell>VPC IPv4</TableCell>
                )}
                {shouldShowVpcIPAddressColumns && (
                  <TableCell>VPC IPv6</TableCell>
                )}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rowData.length === 0 &&
                isEnterpriseClusterWithin20MinsOfCreation() && (
                  <TableRow>
                    <TableCell colSpan={numColumns}>
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
                              Worker nodes will appear once cluster provisioning
                              is complete.
                            </Typography>
                            <Typography>
                              Provisioning can take up to ~20 minutes.
                            </Typography>
                          </Box>
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              {(rowData.length > 0 ||
                !isEnterpriseClusterWithin20MinsOfCreation()) && (
                <TableContentWrapper
                  length={paginatedAndOrderedData.length}
                  loading={isLoading}
                  loadingProps={{ columns: numColumns }}
                >
                  {paginatedAndOrderedData.map((eachRow) => {
                    return (
                      <_NodeRow
                        instanceId={eachRow.instanceId}
                        instanceStatus={eachRow.instanceStatus}
                        ip={eachRow.ip}
                        isLkeClusterRestricted={isLkeClusterRestricted}
                        key={`node-row-${eachRow.nodeId}`}
                        label={eachRow.label}
                        linodeError={error ?? undefined}
                        nodeId={eachRow.nodeId}
                        nodeStatus={eachRow.nodeStatus}
                        openRecycleNodeDialog={openRecycleNodeDialog}
                        shouldShowVpcIPAddressColumns={
                          shouldShowVpcIPAddressColumns
                        }
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
          <NodePoolTableFooter>
            <Box>
              <Stack
                alignItems="center"
                columnGap={{ sm: 2, xs: 1.5 }}
                direction="row"
                divider={
                  <Divider
                    flexItem
                    orientation="vertical"
                    sx={{ borderWidth: 1, height: '20px' }}
                  />
                }
                flexWrap={{ sm: 'unset', xs: 'wrap' }}
                rowGap={1}
              >
                <Typography sx={{ textWrap: 'nowrap' }}>
                  <b>Pool ID</b> {poolId}
                </Typography>
                {clusterTier === 'enterprise' && poolVersion && (
                  <Typography sx={{ textWrap: 'nowrap' }}>
                    <b>Version</b> {poolVersion}
                  </Typography>
                )}
                {isDiskEncryptionFeatureEnabled && (
                  <EncryptedStatus
                    encryptionStatus={encryptionStatus}
                    regionSupportsDiskEncryption={regionSupportsDiskEncryption}
                    tooltipText={undefined}
                  />
                )}
              </Stack>
            </Box>
            <TagCell
              disabled={isLkeClusterRestricted}
              tags={tags}
              updateTags={updateTags}
              view="inline"
            />
          </NodePoolTableFooter>
        </>
      )}
    </Paginate>
  );
});

export const EncryptedStatus = ({
  encryptionStatus,
  regionSupportsDiskEncryption,
  tooltipText,
}: {
  encryptionStatus: EncryptionStatus;
  regionSupportsDiskEncryption: boolean;
  tooltipText: string | undefined;
}) => {
  if (encryptionStatus === 'enabled') {
    return (
      <Stack alignItems="center" direction="row" spacing={1}>
        <Lock />
        <Typography>Encrypted</Typography>
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      <Unlock />
      <Typography sx={{ whiteSpace: 'nowrap' }}>Not Encrypted</Typography>
      {regionSupportsDiskEncryption && tooltipText && (
        <TooltipIcon status="info" text={tooltipText} />
      )}
    </Stack>
  );
};
