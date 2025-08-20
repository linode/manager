import { Autocomplete, Stack } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { NodePoolFirewallSelect } from '../NodePoolFirewallSelect';
import { NodePoolUpdateStrategySelect } from '../NodePoolUpdateStrategySelect';

import type { CreateNodePoolData } from '@linode/api-v4';

interface KubernetesVersionFieldOptions {
  show: boolean;
  versions: string[];
}

interface Props {
  versionFieldOptions?: KubernetesVersionFieldOptions;
}

export const NodePoolConfigOptions = (props: Props) => {
  const { versionFieldOptions } = props;
  const { control } = useFormContext<CreateNodePoolData>();

  const versionOptions =
    versionFieldOptions?.versions.map((version) => ({
      label: version,
    })) ?? [];

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
      <Controller
        control={control}
        name="update_strategy"
        render={({ field }) => (
          <NodePoolUpdateStrategySelect
            onChange={field.onChange}
            value={field.value}
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
      <NodePoolFirewallSelect />
    </Stack>
  );
};
