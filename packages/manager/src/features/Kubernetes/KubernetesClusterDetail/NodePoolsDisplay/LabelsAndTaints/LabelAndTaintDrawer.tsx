import { Typography } from '@mui/material';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';

import { LabelTable } from './LabelTable';
import { TaintTable } from './TaintTable';

import type { KubeNodePoolResponse } from '@linode/api-v4';

export interface Props {
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

export const LabelAndTaintDrawer = (props: Props) => {
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
      <Typography
        marginBottom={(theme) => theme.spacing(4)}
        marginTop={(theme) => theme.spacing()}
      >
        Labels and Taints will be applied to Nodes in this Node Pool. They can
        be further defined using the Kubernetes API, although edits with be
        overwritten when Nodes or Pools are recycled.
      </Typography>
      <Typography variant="h3"> Labels </Typography>
      <LabelTable labels={nodePool?.labels} />
      <Typography variant="h3"> Taints </Typography>
      <TaintTable taints={nodePool?.taints} />
    </Drawer>
  );
};
