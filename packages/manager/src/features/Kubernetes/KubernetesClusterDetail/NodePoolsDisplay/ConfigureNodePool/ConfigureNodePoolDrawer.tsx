import { Drawer } from '@linode/ui';
import React from 'react';

import { useNodePoolDisplayLabel } from '../utils';
import { ConfigureNodePoolForm } from './ConfigureNodePoolForm';

import type { KubeNodePoolResponse, KubernetesCluster } from '@linode/api-v4';

interface Props {
  clusterId: KubernetesCluster['id'];
  clusterTier: KubernetesCluster['tier'];
  clusterVersion: KubernetesCluster['k8s_version'];
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

export const ConfigureNodePoolDrawer = (props: Props) => {
  const { nodePool, onClose, clusterId, open, clusterTier, clusterVersion } =
    props;
  const nodePoolLabel = useNodePoolDisplayLabel(nodePool, { suffix: 'Plan' });

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
          clusterVersion={clusterVersion}
          nodePool={nodePool}
          onDone={onClose}
        />
      )}
    </Drawer>
  );
};
