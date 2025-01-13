import { Button, Typography } from '@linode/ui';
import * as React from 'react';
// import { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
// import { LinkButton } from 'src/components/LinkButton';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';

import { LabelTable } from './LabelTable';
// import { MultipleLabelInput } from './MultipleLabelInput';
import { TaintTable } from './TaintTable';

import type { KubeNodePoolResponse } from '@linode/api-v4';

export interface Props {
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

export const LabelAndTaintDrawer = (props: Props) => {
  const { nodePool, onClose, open } = props;

  // const [labels, setLabels] = useState<Label>({});

  const typesQuery = useSpecificTypes(nodePool?.type ? [nodePool.type] : []);

  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  // const handleAddLabelClick = () => {
  //   setLabels((labels) => ({
  //     ...labels,
  //     ['']: '',
  //   }));
  // };

  // const handleAddLabel = (newLabel: string) => {
  //   setLabels((labels) => ({
  //     ...labels,
  //     newLabel,
  //   }));
  // };

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
      {/* <MultipleLabelInput
        labels={labels}
        // onChange={handleAddLabel}
        onClick={handleAddLabelClick}
      /> */}
      <Typography marginTop={(theme) => theme.spacing(2)} variant="h3">
        Taints
      </Typography>
      <TaintTable taints={nodePool?.taints} />
      <Button buttonType="secondary">Add Taint</Button>

      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          // disabled: userCannotAddVPC,
          label: 'Save Changes',
          // loading: isLoadingCreateVPC,
          // onClick: handleSubmit(onCreateVPC),
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          label: 'Cancel',
          onClick: onClose,
        }}
      />
    </Drawer>
  );
};
