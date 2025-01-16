import { InputAdornment, Stack, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';

import type { StackScriptPayload } from '@linode/api-v4';

interface Props {
  disabled: boolean;
  username: string;
}

export const StackScriptForm = (props: Props) => {
  const { disabled, username } = props;

  const { control } = useFormContext<StackScriptPayload>();

  return (
    <>
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">{username} /</InputAdornment>
              ),
            }}
            data-qa-stackscript-label
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="Label"
            noMarginTop
            onChange={field.onChange}
            placeholder="Enter a label"
            required
            tooltipText="StackScript labels must be between 3 and 128 characters."
            value={field.value}
          />
        )}
        control={control}
        name="label"
      />

      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-stackscript-description
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="Description"
            multiline
            noMarginTop
            onChange={field.onChange}
            placeholder="Enter a description"
            rows={1}
            value={field.value}
          />
        )}
        control={control}
        name="description"
      />

      <Controller
        render={({ field, fieldState }) => (
          <ImageSelect
            textFieldProps={{
              required: true,
              tooltipText:
                'Select which images are compatible with this StackScript. "Any/All" allows you to use private images.',
            }}
            anyAllOption
            data-qa-stackscript-target-select
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="Target Images"
            multiple
            noMarginTop
            onChange={(images) => field.onChange(images.map((i) => i.id))}
            placeholder="Select image(s)"
            value={field.value}
            variant="public"
          />
        )}
        control={control}
        name="images"
      />

      <Controller
        render={({ field, fieldState }) => (
          <TextField
            labelTooltipText={
              <Stack>
                <Typography>
                  There are four default environment variables provided to you:
                </Typography>
                <ul>
                  <li>LINODE_ID</li>
                  <li>LINODE_LISHUSERNAME</li>
                  <li>LINODE_RAM</li>
                  <li>LINODE_DATACENTERID</li>
                </ul>
              </Stack>
            }
            data-qa-stackscript-script
            disabled={disabled}
            errorText={fieldState.error?.message}
            expand
            label="Script"
            multiline
            noMarginTop
            onChange={field.onChange}
            placeholder={`#!/bin/bash \n\n# Your script goes here`}
            required
            rows={3}
            tooltipWidth={300}
            value={field.value}
          />
        )}
        control={control}
        name="script"
      />

      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-stackscript-revision
            disabled={disabled}
            errorText={fieldState.error?.message}
            expand
            label="Revision Note"
            noMarginTop
            onChange={field.onChange}
            placeholder="Enter a revision note"
            value={field.value}
          />
        )}
        control={control}
        name="rev_note"
      />
    </>
  );
};
