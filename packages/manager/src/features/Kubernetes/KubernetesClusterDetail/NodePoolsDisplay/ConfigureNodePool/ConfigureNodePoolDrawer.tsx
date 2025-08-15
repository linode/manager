import { Drawer } from '@linode/ui';
import React from 'react';

import { useNodePoolDisplayLabel } from 'src/features/Kubernetes/kubeUtils';

import { ConfigureNodePoolForm } from './ConfigureNodePoolForm';

import type { KubeNodePoolResponse, KubernetesCluster } from '@linode/api-v4';

interface Props {
  clusterId: KubernetesCluster['id'];
  clusterTier: KubernetesCluster['tier'];
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

export const ConfigureNodePoolDrawer = (props: Props) => {
  const { nodePool, onClose, clusterId, open, clusterTier } = props;
  const nodePoolLabel = useNodePoolDisplayLabel(nodePool);

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Configure Node Pool: ${nodePoolLabel}`}
    >
      {nodePool && (
        <ConfigureNodePoolForm
          clusterId={clusterId}
          clusterTier={clusterTier}
          nodePool={nodePool}
          onDone={onClose}
        />
      )}
    </Drawer>
  );
};
