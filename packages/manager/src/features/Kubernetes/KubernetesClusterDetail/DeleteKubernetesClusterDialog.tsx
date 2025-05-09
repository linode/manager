import { List, ListItem, Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteKubernetesClusterMutation } from 'src/queries/kubernetes';

import type { APIError, KubeNodePoolResponse } from '@linode/api-v4';

export interface DeleteKubernetesClusterDialogProps {
  clusterError: APIError[] | null;
  clusterId: number;
  clusterLabel: string;
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
}

const CLUSTER_DELETION_WARNINGS = [
  {
    text: "Deleting a cluster is permanent and can't be undone.",
  },
  {
    text: 'Attached Block Storage Volumes or NodeBalancers must be deleted separately.',
  },
];

export const getTotalLinodes = (pools: KubeNodePoolResponse[]) => {
  return pools.reduce((accum, thisPool) => {
    return accum + thisPool.count;
  }, 0);
};

export const DeleteKubernetesClusterDialog = (
  props: DeleteKubernetesClusterDialogProps
) => {
  const { clusterId, clusterLabel, isFetching, onClose, open } = props;
  const {
    error,
    isPending: isDeleting,
    mutateAsync: deleteCluster,
  } = useDeleteKubernetesClusterMutation();

  const onDelete = () => {
    deleteCluster({ id: clusterId }).then(() => {
      onClose();
    });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: clusterLabel,
        primaryBtnText: 'Delete Cluster',
        subType: 'Cluster',
        type: 'Kubernetes',
      }}
      errors={error}
      expand
      isFetching={isFetching}
      label={'Cluster Name'}
      loading={isDeleting}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete Cluster ${clusterLabel}`}
    >
      <Notice variant="warning">
        <Typography>
          <strong>Warning:</strong>
        </Typography>
        <List>
          {CLUSTER_DELETION_WARNINGS.map((notice, idx) => (
            <ListItem key={idx}>{notice.text}</ListItem>
          ))}
        </List>
      </Notice>
    </TypeToConfirmDialog>
  );
};
