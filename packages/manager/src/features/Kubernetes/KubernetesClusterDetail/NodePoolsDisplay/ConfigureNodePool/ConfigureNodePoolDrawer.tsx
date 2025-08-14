import { useTypeQuery } from '@linode/queries';
import { Drawer } from '@linode/ui';
import React from 'react';

import { ConfigureNodePoolForm } from './ConfigureNodePoolForm';

import type { KubeNodePoolResponse } from '@linode/api-v4';

interface Props {
  clusterId: number;
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

export const ConfigureNodePoolDrawer = (props: Props) => {
  const { nodePool, onClose, clusterId } = props;

  const { data: type } = useTypeQuery(
    nodePool?.type ?? '',
    Boolean(nodePool?.type)
  );

  const nodePoolLabel = nodePool?.label ?? type?.label ?? nodePool?.type;

  return (
    <Drawer title={`Configure Node Pool: ${nodePoolLabel}`}>
      {nodePool && (
        <ConfigureNodePoolForm
          clusterId={clusterId}
          nodePool={nodePool}
          onSaved={onClose}
        />
      )}
    </Drawer>
  );
};
