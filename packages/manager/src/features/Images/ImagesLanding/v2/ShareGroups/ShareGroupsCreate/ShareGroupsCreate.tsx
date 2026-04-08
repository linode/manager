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
import * as React from 'react';
import { Controller, useController, useForm } from 'react-hook-form';

import { IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS } from 'src/components/ImageSelect/constants';
import { ImageSelectTable } from 'src/components/ImageSelect/ImageSelectTable';

import { CREATE_SHARE_GROUP_PENDO_IDS } from '../../constants';

import type { CreateSharegroupPayload, Image } from '@linode/api-v4';

export const ShareGroupsCreate = () => {
  const navigate = useNavigate();

  const { mutateAsync: createShareGroup } = useCreateShareGroupMutation();

  const { control, handleSubmit, setError } =
    useForm<CreateSharegroupPayload>();

  const { field: imagesField, fieldState } = useController({
    control,
    name: 'images',
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createShareGroup(values);

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

  const onChange = (image: Image) => {
    const selectedImages = imagesField.value ?? [];

    const { id, label, description } = image;
    const imagePayload = { id, label, description: description ?? undefined };

    if (!selectedImages.some((img) => img.id === id)) {
      imagesField.onChange([...selectedImages, imagePayload]);
    } else {
      imagesField.onChange(selectedImages.filter((img) => img.id !== id));
    }
  };

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
                data-pendo-id={CREATE_SHARE_GROUP_PENDO_IDS.label}
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
                data-pendo-id={CREATE_SHARE_GROUP_PENDO_IDS.description}
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
          <ImageSelectTable
            currentRoute="/images/share-groups/create"
            errorText={fieldState.error?.message}
            onSelect={onChange}
            pendoIDs={IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS}
            selectedImageIds={imagesField.value?.map((img) => img.id) ?? []}
            selectionMode="multi"
          />
        </Stack>
        <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
        <Stack spacing={2}>
          <Typography variant="h2">
            Selected images ({imagesField.value?.length ?? 0})
          </Typography>
          <Notice variant="info">Selected images is coming soon...</Notice>
        </Stack>
      </Paper>
      <Box display="flex" flexWrap="wrap" justifyContent="flex-end" mt={2}>
        <Button
          buttonType="primary"
          data-pendo-id={CREATE_SHARE_GROUP_PENDO_IDS.createButton}
          type="submit"
        >
          Create Share Group
        </Button>
      </Box>
    </form>
  );
};
