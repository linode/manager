import { Autocomplete, Button, Notice, Stack, TextField } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { TagsInput } from 'src/components/TagsInput/TagsInput';
import {
  useIsLkeEnterpriseEnabled,
  useNodePoolDisplayLabel,
} from 'src/features/Kubernetes/kubeUtils';
import { NodePoolUpdateStrategySelect } from 'src/features/Kubernetes/NodePoolUpdateStrategySelect';
import {
  useKubernetesTieredVersionsQuery,
  useUpdateNodePoolMutation,
} from 'src/queries/kubernetes';

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
   * The Node Pool to configure
   */
  nodePool: KubeNodePoolResponse;
  /**
   * A function that will be called when the user saves or cancels
   */
  onDone?: () => void;
}

export const ConfigureNodePoolForm = (props: Props) => {
  const { clusterId, onDone, nodePool, clusterTier } = props;
  const { isLkeEnterprisePostLAFeatureEnabled } = useIsLkeEnterpriseEnabled();
  const { enqueueSnackbar } = useSnackbar();
  const labelPlaceholder = useNodePoolDisplayLabel(nodePool, true);

  const form = useForm<UpdateNodePoolData>({
    defaultValues: {
      label: nodePool.label,
      tags: nodePool.tags,
      update_strategy: nodePool.update_strategy,
      k8s_version: nodePool.k8s_version,
    },
  });

  const { mutateAsync: updateNodePool } = useUpdateNodePoolMutation(
    clusterId,
    nodePool.id
  );

  const { data: versions } = useKubernetesTieredVersionsQuery(
    clusterTier ?? 'standard'
  );

  const versionOptions =
    versions?.map((version) => ({ ...version, label: version.id })) ?? [];

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
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {form.formState.errors.root?.message && (
          <Notice text={form.formState.errors.root.message} variant="error" />
        )}
        <Controller
          control={form.control}
          name="label"
          render={({ field, fieldState }) => (
            <TextField
              errorText={fieldState.error?.message}
              inputRef={field.ref}
              label="Label"
              noMarginTop
              onChange={field.onChange}
              placeholder={labelPlaceholder}
              value={field.value}
            />
          )}
        />
        <Controller
          control={form.control}
          name="tags"
          render={({ field, fieldState }) => (
            <TagsInput
              label="Tags"
              noMarginTop
              onChange={(tags) => field.onChange(tags.map((tag) => tag.value))}
              tagError={fieldState.error?.message}
              value={
                field.value?.map((tag) => ({ label: tag, value: tag })) ?? []
              }
            />
          )}
        />
        {isLkeEnterprisePostLAFeatureEnabled &&
          clusterTier === 'enterprise' && (
            <>
              <Controller
                control={form.control}
                name="update_strategy"
                render={({ field }) => (
                  <NodePoolUpdateStrategySelect
                    label="Update Strategy"
                    noMarginTop
                    onChange={field.onChange}
                    value={field.value!}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="k8s_version"
                render={({ field }) => (
                  <Autocomplete
                    disableClearable
                    label="Kubernetes Version"
                    noMarginTop
                    onChange={(e, version) => field.onChange(version.id)}
                    options={versionOptions}
                    value={versionOptions.find(
                      (option) => option.id === field.value
                    )}
                  />
                )}
              />
            </>
          )}
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
  );
};
