import { Autocomplete, Stack } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useIsLkeEnterpriseEnabled } from '../kubeUtils';
import { NodePoolFirewallSelect } from '../NodePoolFirewallSelect';
import { NodePoolUpdateStrategySelect } from '../NodePoolUpdateStrategySelect';

import type { NodePoolFirewallSelectProps } from '../NodePoolFirewallSelect';
import type { CreateNodePoolData, KubernetesTier } from '@linode/api-v4';

interface KubernetesVersionFieldOptions {
  show: boolean;
  versions: string[];
}

interface Props {
  clusterTier: KubernetesTier;
  firewallSelectOptions?: NodePoolFirewallSelectProps;
  versionFieldOptions?: KubernetesVersionFieldOptions;
}

export const NodePoolConfigOptions = (props: Props) => {
  const { versionFieldOptions, clusterTier, firewallSelectOptions } = props;
  const { isLkeEnterprisePostLAFeatureEnabled } = useIsLkeEnterpriseEnabled();
  const { control } = useFormContext<CreateNodePoolData>();

  const versionOptions =
    versionFieldOptions?.versions.map((version) => ({
      label: version,
    })) ?? [];

  // @TODO uncomment and wire this up when we begin surfacing the Text Field for a Node Pool's `label` (ECE-353)
  // const labelPlaceholder = useNodePoolDisplayLabel(nodePool, {
  //   ignoreNodePoolsLabel: true,
  // });

  return (
    <Stack spacing={3}>
      {/*
      // @TODO allow users to edit Node Pool `label` and `tags` because the API supports it. (ECE-353)
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
      */}
      {/* LKE Enterprise cluster node pools have more configurability */}
      {clusterTier === 'enterprise' && isLkeEnterprisePostLAFeatureEnabled && (
        <>
          <Controller
            control={control}
            name="update_strategy"
            render={({ field }) => (
              <NodePoolUpdateStrategySelect
                onChange={field.onChange}
                value={field.value ?? undefined}
              />
            )}
          />
          {versionFieldOptions?.show && (
            <Controller
              control={control}
              name="k8s_version"
              render={({ field, fieldState }) => (
                <Autocomplete
                  disableClearable
                  errorText={fieldState.error?.message}
                  label="Kubernetes Version"
                  noMarginTop
                  onChange={(e, version) => field.onChange(version.label)}
                  options={versionOptions}
                  value={versionOptions.find(
                    (option) => option.label === field.value
                  )}
                />
              )}
            />
          )}
          <NodePoolFirewallSelect {...firewallSelectOptions} />
        </>
      )}
    </Stack>
  );
};
