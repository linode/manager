import { Stack } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useForm } from 'react-hook-form';

import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';

import type { KubeNodePoolResponse, UpdateNodePoolData } from '@linode/api-v4';

interface Props {
  /**
   * The ID of the LKE cluster
   */
  clusterId: number;
  /**
   * The Node Pool to configure
   */
  nodePool: KubeNodePoolResponse;
  /**
   * A function that will be called when the Node Pool's configure is successfully saved
   */
  onSaved?: () => void;
}

export const ConfigureNodePoolForm = (props: Props) => {
  const { clusterId, onSaved, nodePool } = props;

  const form = useForm<UpdateNodePoolData>();

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateNodePool } = useUpdateNodePoolMutation(
    clusterId,
    nodePool.id
  );

  const onSubmit = async (values: UpdateNodePoolData) => {
    try {
      await updateNodePool(values);
      enqueueSnackbar('Node Pool configuration successfully updated. ', {
        variant: 'success',
      });
      onSaved?.();
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack></Stack>
    </form>
  );
};
