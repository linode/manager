import { Button, Notice, Stack } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { NodePoolConfigOptions } from 'src/features/Kubernetes/KubernetesPlansPanel/NodePoolConfigOptions';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';

import { getNodePoolVersionOptions } from './ConfigureNodePoolDrawer.utils';

import type {
  KubeNodePoolResponse,
  KubernetesCluster,
  UpdateNodePoolData,
} from '@linode/api-v4';

interface Props {
  /**
   * The ID of the LKE cluster
   */
  clusterId: KubernetesCluster['id'];
  /**
   * The tier of the LKE cluster
   */
  clusterTier: KubernetesCluster['tier'];
  /**
   * The version of the LKE cluster
   */
  clusterVersion: KubernetesCluster['k8s_version'];
  /**
   * The Node Pool to configure
   */
  nodePool: KubeNodePoolResponse;
  /**
   * A function that will be called when the user saves or cancels
   */
  onDone?: () => void;
}

export const ConfigureNodePoolForm = (props: Props) => {
  const { clusterId, onDone, nodePool, clusterVersion, clusterTier } = props;
  const { enqueueSnackbar } = useSnackbar();

  const form = useForm<UpdateNodePoolData>({
    defaultValues: {
      // @TODO allow users to edit Node Pool `label` and `tags` because the API supports it. (ECE-353)
      // label: nodePool.label,
      // tags: nodePool.tags,
      firewall_id: nodePool.firewall_id,
      update_strategy: nodePool.update_strategy,
      k8s_version: nodePool.k8s_version,
    },
  });

  const { mutateAsync: updateNodePool } = useUpdateNodePoolMutation(
    clusterId,
    nodePool.id
  );

  const versions = getNodePoolVersionOptions({
    clusterVersion,
    nodePoolVersion: nodePool.k8s_version,
  });

  const onSubmit = async (values: UpdateNodePoolData) => {
    try {
      await updateNodePool(values);
      enqueueSnackbar('Node Pool configuration successfully updated. ', {
        variant: 'success',
      });
      onDone?.();
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {form.formState.errors.root?.message && (
            <Notice text={form.formState.errors.root.message} variant="error" />
          )}
          <NodePoolConfigOptions
            clusterTier={clusterTier ?? 'standard'}
            firewallSelectOptions={{
              allowFirewallRemoval: clusterTier === 'standard',
              ...(nodePool.firewall_id !== 0 && {
                disableDefaultFirewallRadio: true,
                defaultFirewallRadioTooltip:
                  "You can't use this option once an existing Firewall has been selected.",
              }),
            }}
            versionFieldOptions={{
              show: true,
              versions,
            }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button buttonType="secondary" onClick={onDone}>
              Cancel
            </Button>
            <Button
              buttonType="primary"
              disabled={!form.formState.isDirty}
              loading={form.formState.isSubmitting}
              type="submit"
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </form>
    </FormProvider>
  );
};
