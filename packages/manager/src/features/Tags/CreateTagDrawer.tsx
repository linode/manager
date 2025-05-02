import { useCreateTagMutation } from '@linode/queries';
import { Box, Button, Stack, TextField } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { TagRequest } from '@linode/api-v4';

interface Props {
  onClose: () => void;
}

export const CreateTagForm = (props: Props) => {
  const { onClose } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync } = useCreateTagMutation({
    onError(errors) {
      for (const error of errors) {
        // @ts-expect-error it's all good
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    },
    onSuccess(tag) {
      onClose();
      enqueueSnackbar(`Successfully created tag ${tag.label}`, {
        variant: 'success',
      });
    },
  });

  const form = useForm<TagRequest>({
    defaultValues: {
      label: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutateAsync(values))}>
      <Stack spacing={2}>
        <Controller
          control={form.control}
          name="label"
          render={({ field, fieldState }) => (
            <TextField
              errorText={fieldState.error?.message}
              label="Label"
              noMarginTop
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
        <Box display="flex" justifyContent="flex-end">
          <Button
            buttonType="primary"
            loading={form.formState.isSubmitting}
            type="submit"
          >
            Create
          </Button>
        </Box>
      </Stack>
    </form>
  );
};
