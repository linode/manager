import { List, ListItem, Notice, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteKubernetesClusterMutation } from 'src/queries/kubernetes';

import type { KubeNodePoolResponse } from '@linode/api-v4';

export interface Props {
  clusterId: number;
  clusterLabel: string;
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

export const DeleteKubernetesClusterDialog = (props: Props) => {
  const { clusterId, clusterLabel, onClose, open } = props;
  const {
    error,
    isPending: isDeleting,
    mutateAsync: deleteCluster,
  } = useDeleteKubernetesClusterMutation();
  const navigate = useNavigate();

  const onDelete = () => {
    deleteCluster({ id: clusterId }).then(() => {
      onClose();
      navigate({ to: '/kubernetes/clusters' });
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
