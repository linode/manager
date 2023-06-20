import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Notice } from 'src/components/Notice/Notice';
import { useDeleteKubernetesClusterMutation } from 'src/queries/kubernetes';
import { KubeNodePoolResponse } from '@linode/api-v4';
import { useHistory } from 'react-router-dom';

export interface Props {
  open: boolean;
  clusterLabel: string;
  clusterId: number;
  onClose: () => void;
}

export const getTotalLinodes = (pools: KubeNodePoolResponse[]) => {
  return pools.reduce((accum, thisPool) => {
    return accum + thisPool.count;
  }, 0);
};

export const DeleteKubernetesClusterDialog = (props: Props) => {
  const { clusterLabel, clusterId, open, onClose } = props;
  const {
    mutateAsync: deleteCluster,
    isLoading: isDeleting,
    error,
  } = useDeleteKubernetesClusterMutation();
  const history = useHistory();

  const onDelete = () => {
    deleteCluster({ id: clusterId }).then(() => {
      onClose();
      history.replace('/kubernetes/clusters');
    });
  };

  return (
    <TypeToConfirmDialog
      title={`Delete Cluster ${clusterLabel}`}
      label={'Cluster Name'}
      entity={{
        type: 'Kubernetes',
        subType: 'Cluster',
        action: 'deletion',
        name: clusterLabel,
        primaryBtnText: 'Delete Cluster',
      }}
      open={open}
      onClose={onClose}
      onClick={onDelete}
      loading={isDeleting}
    >
      {error ? <Notice error text={error?.[0].reason} /> : null}
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong>
          <ul style={{ paddingLeft: '15px', margin: '5px 0px 0px' }}>
            <li>Deleting a cluster is permanent and can&apos;t be undone.</li>
            <li>
              Attached Block Storage Volumes or NodeBalancers must be deleted
              separately.
            </li>
          </ul>
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};
