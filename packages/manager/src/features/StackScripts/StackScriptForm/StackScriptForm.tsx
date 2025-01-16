import {
  Button,
  InputAdornment,
  Notice,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { useProfile } from 'src/queries/profile/profile';

import type { StackScriptPayload } from '@linode/api-v4';

export const StackScriptForm = () => {
  const {
    control,
    formState: { isSubmitting },
    reset,
  } = useForm<StackScriptPayload>();

  const { data: profile } = useProfile();
  const username = profile?.username ?? '';
  const disabled = false; // @todo impliment permissions

  return (
    <Stack spacing={2}>
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">{username} /</InputAdornment>
              ),
            }}
            noMarginTop
            data-qa-stackscript-label
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="StackScript Label"
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
          noMarginTop
            data-qa-stackscript-description
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="Description"
            multiline
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
            onChange={(images) => field.onChange(images.map((i) => i.id))}
            placeholder="Select image(s)"
            value={field.value}
            variant="public"
            noMarginTop
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
            noMarginTop
            InputProps={{ sx: { maxWidth: '100%' } }}
            data-qa-stackscript-script
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="Script"
            multiline
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
          noMarginTop
            InputProps={{ sx: { maxWidth: '100%' } }}
            data-qa-stackscript-revision
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="Revision Note"
            onChange={field.onChange}
            placeholder="Enter a revision note"
            value={field.value}
          />
        )}
        control={control}
        name="rev_note"
      />
      <Stack direction="row" justifyContent="flex-end">
        <Button
          data-testid="cancel"
          disabled={disabled}
          onClick={() => reset()}
        >
          Reset
        </Button>
        <Button
          buttonType="primary"
          data-testid="save"
          disabled={disabled}
          loading={isSubmitting}
          type="submit"
        >
          Create StackScript
        </Button>
      </Stack>
    </Stack>
  );
};
