import { Button, Typography } from '@linode/ui';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
// import { LinkButton } from 'src/components/LinkButton';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';

import { LabelTable } from './LabelTable';
import { TaintTable } from './TaintTable';

import type { KubeNodePoolResponse, Label, Taint } from '@linode/api-v4';

export interface Props {
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

interface LabelsAndTaintsFormFields {
  labels: Label;
  taints: Taint[];
}

export const LabelAndTaintDrawer = (props: Props) => {
  const { nodePool, onClose, open } = props;

  const typesQuery = useSpecificTypes(nodePool?.type ? [nodePool.type] : []);

  const { control, setValue, ...form } = useForm<LabelsAndTaintsFormFields>({
    defaultValues: {
      labels: {},
      taints: [],
    },
  });

  React.useEffect(() => {
    if (!nodePool) {
      return;
    }
    if (open) {
      setValue('labels', nodePool?.labels);
      setValue('taints', nodePool?.taints);
    }
  }, [nodePool, open]);

  const handleClose = () => {
    onClose();
    form.reset(); // TODO: remove if this isn't doing anything
  };

  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`Labels and Taints: ${planType?.formattedLabel ?? 'Unknown'} Plan`}
    >
      <FormProvider control={control} setValue={setValue} {...form}>
        <Typography
          marginBottom={(theme) => theme.spacing(4)}
          marginTop={(theme) => theme.spacing()}
        >
          Labels and Taints will be applied to Nodes in this Node Pool. They can
          be further defined using the Kubernetes API, although edits with be
          overwritten when Nodes or Pools are recycled.
        </Typography>

        <Typography variant="h3"> Labels </Typography>
        <LabelTable />
        <Button
          onClick={() => {
            {
              /* TODO */
            }
          }}
          buttonType="secondary"
        >
          Add Label
        </Button>

        <Typography marginTop={(theme) => theme.spacing(2)} variant="h3">
          Taints
        </Typography>
        <TaintTable />
        <Button
          onClick={() => {
            {
              /* TODO */
            }
          }}
          buttonType="secondary"
        >
          Add Taint
        </Button>

        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Save Changes',
            // onClick: handleSubmit,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      </FormProvider>
    </Drawer>
  );
};
