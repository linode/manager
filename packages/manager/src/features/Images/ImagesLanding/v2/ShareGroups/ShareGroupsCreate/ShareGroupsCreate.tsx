import { useCreateShareGroupMutation } from '@linode/queries';
import {
  Box,
  Button,
  Checkbox,
  Divider,
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

import type {
  CreateSharegroupPayload,
  Image,
  SharegroupImagePayload,
} from '@linode/api-v4';

interface ShareGroupFormImage extends SharegroupImagePayload {
  newDescription?: string;
  newLabel?: string;
  useOriginalImageFields: boolean;
}

interface ShareGroupPayload extends Omit<CreateSharegroupPayload, 'images'> {
  images?: ShareGroupFormImage[];
}

export const ShareGroupsCreate = () => {
  const navigate = useNavigate();

  const { mutateAsync: createShareGroup } = useCreateShareGroupMutation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<ShareGroupPayload>();

  const { field: imagesController, fieldState } = useController({
    control,
    name: 'images',
  });

  const selectedImages = imagesController.value ?? [];

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: CreateSharegroupPayload = {
        ...values,
        images: values.images?.map(
          ({ id, label, description, newLabel, newDescription }) => ({
            id,
            label: newLabel ?? label,
            description: newDescription ?? description,
          })
        ),
      };

      await createShareGroup(payload);

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

  const handleImagesTableSelect = (image: Image) => {
    const { id, label, description } = image;
    const imagePayload = {
      id,
      label,
      ...(description && { description }),
      useOriginalImageFields: true,
    };

    if (!selectedImages.some((img) => img.id === id)) {
      imagesController.onChange([...selectedImages, imagePayload]);
    } else {
      imagesController.onChange(selectedImages.filter((img) => img.id !== id));
    }
  };

  const toggleSelectedImageCheckbox = (id: string) => {
    imagesController.onChange(
      selectedImages.map((img) => {
        if (img.id === id) {
          return {
            ...img,
            newDescription: img.description,
            newLabel: img.label,
            useOriginalImageFields: !img.useOriginalImageFields,
          };
        }
        return img;
      })
    );
  };

  const onSelectedImageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: string,
    field: 'newDescription' | 'newLabel'
  ) => {
    const value = e.target.value === '' ? undefined : e.target.value;
    imagesController.onChange(
      selectedImages.map((img) =>
        img.id === id
          ? {
              ...img,
              [field]: value,
            }
          : img
      )
    );
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
                data-testid="share-group-label"
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
                data-testid="share-group-description"
                errorText={fieldState.error?.message}
                label="Description"
                multiline
                noMarginTop
                {...field}
                data-pendo-id={CREATE_SHARE_GROUP_PENDO_IDS.description}
                onChange={(e) => {
                  field.onChange(
                    e.target.value === '' ? undefined : e.target.value
                  );
                }}
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
            onSelect={handleImagesTableSelect}
            pendoIDs={IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS}
            selectedImageIds={
              imagesController.value?.map((img) => img.id) ?? []
            }
            selectionMode="multi"
          />
        </Stack>
        <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
        <Stack spacing={2}>
          <Typography variant="h2">
            Selected images ({selectedImages.length ?? 0})
          </Typography>
          {selectedImages.map((image, index) => (
            <Stack key={image.id} mb={4}>
              <Stack alignItems="baseline" direction="row" spacing={2}>
                <Typography variant="body1">
                  <b>{index + 1}. Original image: </b>
                </Typography>
                <Typography variant="body1">{image.label}</Typography>
              </Stack>
              <Controller
                control={control}
                name={`images.${index}`}
                render={() => (
                  <Box>
                    <Checkbox
                      checked={image.useOriginalImageFields}
                      onChange={() => toggleSelectedImageCheckbox(image.id)}
                      text="Use original label and description"
                      toolTipText="You can keep the original label and description or set new ones for the shared image. If the original image fields change later, the shared image won't update."
                    />
                  </Box>
                )}
              />

              {!image.useOriginalImageFields && (
                <Stack spacing={2}>
                  <Controller
                    control={control}
                    name={`images.${index}`}
                    render={() => (
                      <TextField
                        data-testid={`selected-image-${index}-label`}
                        label="Label"
                        noMarginTop
                        onChange={(e) =>
                          onSelectedImageChange(e, image.id, 'newLabel')
                        }
                        value={image.newLabel ?? ''}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`images.${index}`}
                    render={() => (
                      <TextField
                        data-testid={`selected-image-${index}-description`}
                        label="Description"
                        multiline
                        noMarginTop
                        onChange={(e) =>
                          onSelectedImageChange(e, image.id, 'newDescription')
                        }
                        rows={1}
                        value={image.newDescription ?? ''}
                      />
                    )}
                  />
                </Stack>
              )}
            </Stack>
          ))}
        </Stack>
      </Paper>
      <Box display="flex" flexWrap="wrap" justifyContent="flex-end" mt={2}>
        <Button
          buttonType="primary"
          data-pendo-id={CREATE_SHARE_GROUP_PENDO_IDS.createButton}
          loading={isSubmitting}
          type="submit"
        >
          Create Share Group
        </Button>
      </Box>
    </form>
  );
};
