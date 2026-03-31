import { useCreateShareGroupMutation } from '@linode/queries';
import {
  Box,
  Button,
  Divider,
  Notice,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { CreateSharegroupPayload } from '@linode/api-v4';

export const ShareGroupsCreate = () => {
  const navigate = useNavigate();

  const { mutateAsync: createShareGroup } = useCreateShareGroupMutation();

  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit, setError } =
    useForm<CreateSharegroupPayload>();

  const selectedImages = [];

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createShareGroup(values);

      enqueueSnackbar('Sharegroup scheduled for creation', {
        variant: 'info',
      });

      navigate({
        search: () => ({}),
        to: '/images/share-groups',
      });
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
      }
    }
  });
  return (
    <form onSubmit={onSubmit}>
      <Paper>
        <Stack spacing={2}>
          <Typography variant="h2">Share group details</Typography>
          <Typography variant="body1">
            Add a name and description for your share group. These details are
            visible to all group members.
          </Typography>
          <Controller
            control={control}
            name="label"
            render={({ field, fieldState }) => (
              <TextField
                label="Label"
                noMarginTop
                required
                {...field}
                errorText={fieldState.error?.message}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? undefined : e.target.value
                  )
                }
                value={field.value ?? ''}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                label="Description"
                multiline
                noMarginTop
                {...field}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? undefined : e.target.value
                  )
                }
                rows={1}
                value={field.value ?? ''}
              />
            )}
          />
        </Stack>
        <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
        <Stack spacing={2}>
          <Typography variant="h2">Images</Typography>
          <Notice variant="info">Images table is coming soon...</Notice>
        </Stack>
        <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
        <Stack spacing={2}>
          <Typography variant="h2">
            Selected images ({selectedImages.length})
          </Typography>
          <Notice variant="info">Selected images is coming soon...</Notice>
        </Stack>
      </Paper>
      <Box display="flex" flexWrap="wrap" justifyContent="flex-end" mt={2}>
        <Button buttonType="primary" type="submit">
          Create Share Group
        </Button>
      </Box>
    </form>
  );
};
