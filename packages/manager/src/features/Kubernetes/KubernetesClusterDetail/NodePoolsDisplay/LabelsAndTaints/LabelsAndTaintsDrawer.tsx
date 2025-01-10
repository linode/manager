import { Typography } from '@mui/material';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';

import type { KubeNodePoolResponse } from '@linode/api-v4';

export interface Props {
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

export const LabelsAndTaintsDrawer = (props: Props) => {
  const { nodePool, onClose, open } = props;

  const typesQuery = useSpecificTypes(nodePool?.type ? [nodePool.type] : []);

  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Labels and Taints: ${planType?.formattedLabel ?? 'Unknown'} Plan`}
    >
      <Typography>
        Labels and Taints will be applied to Nodes in this Node Pool. They can
        be further defined using the Kubernetes API, although edits with be
        overwritten when Nodes or Pools are recycled.
      </Typography>
    </Drawer>
  );
};
