import {
  InputAdornment,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Code } from 'src/components/Code/Code';
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
    <Stack spacing={2}>
      <Controller
        control={control}
        name="label"
        render={({ field, fieldState }) => (
          <TextField
            data-qa-stackscript-label
            disabled={disabled}
            errorText={fieldState.error?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">{username} /</InputAdornment>
              ),
            }}
            inputRef={field.ref}
            label="StackScript Label"
            noMarginTop
            onBlur={field.onBlur}
            onChange={field.onChange}
            placeholder="Enter a label"
            required
            tooltipText="StackScript labels must be between 3 and 128 characters."
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <TextField
            data-qa-stackscript-description
            disabled={disabled}
            errorText={fieldState.error?.message}
            inputRef={field.ref}
            label="Description"
            multiline
            noMarginTop
            onBlur={field.onBlur}
            onChange={field.onChange}
            placeholder="Enter a description"
            rows={1}
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="images"
        render={({ field, fieldState }) => (
          <ImageSelect
            anyAllOption
            data-qa-stackscript-target-select
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="Target Images"
            multiple
            noMarginTop
            onChange={(images) => {
              const imageIds = images.map((i) => i.id);
              if (imageIds.includes('any/all')) {
                field.onChange(['any/all']);
              } else {
                field.onChange(imageIds);
              }
            }}
            placeholder="Select image(s)"
            textFieldProps={{
              required: true,
              tooltipText:
                'Select which images are compatible with this StackScript. "Any/All" allows you to use private images.',
            }}
            value={field.value}
            variant="public"
          />
        )}
      />

      <Controller
        control={control}
        name="script"
        render={({ field, fieldState }) => (
          <TextField
            data-qa-stackscript-script
            disabled={disabled}
            errorText={fieldState.error?.message}
            expand
            inputRef={field.ref}
            label="Script"
            labelTooltipText={
              <Stack spacing={1}>
                <Typography>
                  There are four default environment variables provided to you.
                </Typography>
                <List dense>
                  {STACKSCRIPT_ENV_VARS.map((envVar) => (
                    <ListItem key={envVar} sx={{ px: 0, py: 0.25 }}>
                      <Code>{envVar}</Code>
                    </ListItem>
                  ))}
                </List>
              </Stack>
            }
            multiline
            noMarginTop
            onBlur={field.onBlur}
            onChange={field.onChange}
            placeholder={`#!/bin/bash \n\n# Your script goes here`}
            required
            rows={3}
            tooltipWidth={300}
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="rev_note"
        render={({ field, fieldState }) => (
          <TextField
            data-qa-stackscript-revision
            disabled={disabled}
            errorText={fieldState.error?.message}
            expand
            inputRef={field.ref}
            label="Revision Note"
            noMarginTop
            onBlur={field.onBlur}
            onChange={field.onChange}
            placeholder="Enter a revision note"
            value={field.value}
          />
        )}
      />
    </Stack>
  );
};

const STACKSCRIPT_ENV_VARS = [
  'LINODE_ID',
  'LINODE_LISHUSERNAME',
  'LINODE_RAM',
  'LINODE_DATACENTERID',
];
