import { Button, Notice, Typography } from '@linode/ui';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';

import { LabelTable } from './LabelTable';
import { TaintTable } from './TaintTable';

import type { KubeNodePoolResponse, Label, Taint } from '@linode/api-v4';

export interface Props {
  clusterId: number;
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

interface LabelsAndTaintsFormFields {
  labels: Label;
  taints: Taint[];
}

export const LabelAndTaintDrawer = (props: Props) => {
  const { clusterId, nodePool, onClose, open } = props;

  const typesQuery = useSpecificTypes(nodePool?.type ? [nodePool.type] : []);

  const { isPending, mutateAsync: updateNodePool } = useUpdateNodePoolMutation(
    clusterId,
    nodePool?.id ?? -1
  );

  const {
    control,
    formState,
    setValue,
    ...form
  } = useForm<LabelsAndTaintsFormFields>({
    defaultValues: {
      labels: undefined,
      taints: undefined,
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

  const onSubmit = async (values: LabelsAndTaintsFormFields) => {
    try {
      await updateNodePool({
        labels: values.labels,
        taints: values.taints,
      });
      onClose();
    } catch (errResponse) {
      for (const error of errResponse) {
        if (error.field) {
          form.setError(error.field, { message: error.reason });
        } else {
          form.setError('root', { message: error.reason });
        }
      }
    }
  };

  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Labels and Taints: ${planType?.formattedLabel ?? 'Unknown'} Plan`}
    >
      {formState.errors.root?.message ? (
        <Notice text={formState.errors.root.message} variant="error" />
      ) : null}
      <FormProvider
        control={control}
        formState={formState}
        setValue={setValue}
        {...form}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Typography
            marginBottom={(theme) => theme.spacing(4)}
            marginTop={(theme) => theme.spacing()}
          >
            Labels and Taints will be applied to Nodes in this Node Pool. They
            can be further defined using the Kubernetes API, although edits will
            be overwritten when Nodes or Pools are recycled.
          </Typography>

          <Typography variant="h3"> Labels </Typography>
          <LabelTable />
          <Button
            onClick={() => {
              {
                /* TODO: Part 2 */
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
                /* TODO: Part 2 */
              }
            }}
            buttonType="secondary"
          >
            Add Taint
          </Button>

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: !formState.isDirty || isPending,
              label: 'Save Changes',
              loading: isPending,
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onClose,
            }}
          />
        </form>
      </FormProvider>
    </Drawer>
  );
};
