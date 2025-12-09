import { Box, Checkbox } from '@linode/ui';
import React from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';

import type { KubernetesCluster } from '@linode/api-v4';
import type { StreamAndDestinationFormType } from 'src/features/Delivery/Streams/StreamForm/types';

export type OrderByKeys = 'label' | 'region';

interface StreamFormClusterTableContentProps {
  clusters: KubernetesCluster[] | undefined;
  field: ControllerRenderProps<
    StreamAndDestinationFormType,
    'stream.details.cluster_ids'
  >;
  idsWithLogsEnabled?: number[];
  isAutoAddAllClustersEnabled: boolean | undefined;
  onOrderChange: (key: OrderByKeys) => void;
  order: 'asc' | 'desc';
  orderBy: OrderByKeys;
}

export const StreamFormClusterTableContent = ({
  field,
  clusters,
  order,
  orderBy,
  onOrderChange,
  idsWithLogsEnabled,
  isAutoAddAllClustersEnabled,
}: StreamFormClusterTableContentProps) => {
  const selectedIds = field.value || [];

  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === idsWithLogsEnabled?.length;
  const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

  const toggleAllClusters = () => {
    field.onChange(isAllSelected ? [] : idsWithLogsEnabled);
    field.onBlur();
  };

  const toggleCluster = (toggledId: number) => {
    const updatedClusterIds = selectedIds.includes(toggledId)
      ? selectedIds.filter((selectedId) => selectedId !== toggledId)
      : [...selectedIds, toggledId];

    field.onChange(updatedClusterIds);
    field.onBlur();
  };

  return (
    <>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '5%' }}>
            {!!clusters && (
              <Checkbox
                aria-label="Toggle all clusters"
                checked={isAllSelected}
                disabled={
                  isAutoAddAllClustersEnabled || !idsWithLogsEnabled?.length
                }
                indeterminate={isIndeterminate}
                onChange={toggleAllClusters}
                sx={{ m: 0 }}
              />
            )}
          </TableCell>
          <TableSortCell
            active={orderBy === 'label'}
            direction={order}
            handleClick={() => onOrderChange('label')}
            label="label"
            sx={{ width: '35%' }}
          >
            Cluster Name
          </TableSortCell>
          <TableSortCell
            active={orderBy === 'region'}
            direction={order}
            handleClick={() => onOrderChange('region')}
            label="region"
            sx={{ width: '35%' }}
          >
            Region
          </TableSortCell>
          <TableCell sx={{ width: '25%' }}>Log Generation</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {clusters?.length ? (
          clusters.map(
            ({
              label,
              region,
              id,
              control_plane: { audit_logs_enabled: logsEnabled },
            }) => (
              <TableRow key={id}>
                <TableCell>
                  <Checkbox
                    aria-label={`Toggle ${label} cluster`}
                    checked={selectedIds.includes(id)}
                    disabled={isAutoAddAllClustersEnabled || !logsEnabled}
                    onChange={() => toggleCluster(id)}
                  />
                </TableCell>
                <TableCell>{label}</TableCell>
                <TableCell>{region}</TableCell>
                <TableCell>
                  <Box alignItems="center" display="flex">
                    <StatusIcon status={logsEnabled ? 'active' : 'error'} />
                    {logsEnabled ? 'Enabled' : 'Disabled'}
                  </Box>
                </TableCell>
              </TableRow>
            )
          )
        ) : (
          <TableRowEmpty colSpan={4} message="No items to display." />
        )}
      </TableBody>
    </>
  );
};
