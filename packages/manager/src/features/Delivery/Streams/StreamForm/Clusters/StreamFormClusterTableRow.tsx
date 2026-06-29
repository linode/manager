import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { Checkbox, FormControlLabel, Toggle } from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { DisableLoggingDialog } from 'src/features/Delivery/Streams/StreamForm/Clusters/DisableLoggingDialog';
import { useKubernetesClusterMutation } from 'src/queries/kubernetes';

import type { Stream } from '@linode/api-v4';
import type { ExtendedKubernetesCluster } from 'src/features/Delivery/Streams/StreamForm/types';

interface StreamFormClusterTableRowProps {
  cluster: ExtendedKubernetesCluster;
  isAutoAddAllClustersEnabled: boolean | undefined;
  isSelected: boolean;
  lkeStreamsUsingCluster: Stream[];
  onToggleCluster: (id: number) => void;
}

export const StreamFormClusterTableRow = (
  props: StreamFormClusterTableRowProps
) => {
  const {
    cluster: { id, label, regionLabel, control_plane },
    isAutoAddAllClustersEnabled,
    isSelected,
    lkeStreamsUsingCluster,
    onToggleCluster,
  } = props;
  const logsEnabled = control_plane.audit_logs_enabled;
  const [isDisableLoggingDialogOpen, setIsDisableLoggingDialogOpen] =
    useState(false);

  const { mutateAsync: updateCluster, isPending } =
    useKubernetesClusterMutation(id);

  const changeKubernetesLogsEnabled = (auditLogsEnabled: boolean) => {
    updateCluster({
      control_plane: {
        ...control_plane,
        audit_logs_enabled: auditLogsEnabled,
      },
    })
      .then(() =>
        enqueueSnackbar('Cluster logging status updated successfully.', {
          variant: 'success',
        })
      )
      .catch((e) =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error updating cluster logging status.')[0]
            .reason,
          { variant: 'error' }
        )
      );
  };

  const onToggleLogs = () => {
    if (logsEnabled && lkeStreamsUsingCluster.length > 0) {
      setIsDisableLoggingDialogOpen(true);
      return;
    }

    changeKubernetesLogsEnabled(!logsEnabled);
  };

  const onConfirm = () => {
    changeKubernetesLogsEnabled(false);
    setIsDisableLoggingDialogOpen(false);
  };

  const closeDisableLoggingInClusterDialog = () => {
    setIsDisableLoggingDialogOpen(false);
  };

  return (
    <>
      <TableRow key={id}>
        <TableCell>
          <Checkbox
            aria-label={`Toggle ${label} cluster`}
            checked={isSelected}
            disabled={isAutoAddAllClustersEnabled || !logsEnabled}
            onChange={() => onToggleCluster(id)}
          />
        </TableCell>
        <TableCell>{label}</TableCell>
        <TableCell>{regionLabel}</TableCell>
        <TableCell>
          <FormControlLabel
            control={
              <Toggle
                aria-label={`Toggle logging for ${label} cluster`}
                checked={logsEnabled}
                disabled={isPending}
                onChange={onToggleLogs}
              />
            }
            label={logsEnabled ? 'Enabled' : 'Disabled'}
          />
        </TableCell>
      </TableRow>
      <DisableLoggingDialog
        clusterName={label}
        isPending={isPending}
        onClose={closeDisableLoggingInClusterDialog}
        onConfirm={onConfirm}
        open={isDisableLoggingDialogOpen}
        streamsUsingCluster={lkeStreamsUsingCluster}
      />
    </>
  );
};
