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
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS } from 'src/components/ImageSelect/constants';
import { ImageSelectTable } from 'src/components/ImageSelect/ImageSelectTable';

import { CREATE_SHARE_GROUP_PENDO_IDS } from '../../constants';

import type {
  CreateSharegroupPayload,
  Image,
  SharegroupImagePayload,
} from '@linode/api-v4';

interface ShareGroupFormImage extends SharegroupImagePayload {
  imageId: string;
  useOriginalImageFields: boolean;
}

interface ShareGroupFormPayload
  extends Omit<CreateSharegroupPayload, 'images'> {
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
  } = useForm<ShareGroupFormPayload>();

  const { append, fields, remove, update } = useFieldArray({
    control,
    name: 'images',
  });

  const [selectedImages, setSelectedImages] = React.useState<
    ShareGroupFormImage[]
  >([]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: CreateSharegroupPayload = {
        ...values,
        images: values.images?.map(
          ({ imageId, label, description, useOriginalImageFields }, index) => {
            return useOriginalImageFields
              ? {
                  id: selectedImages[index].imageId,
                  label: selectedImages[index].label,
                  description: selectedImages[index].description,
                }
              : {
                  id: imageId,
                  label,
                  description,
                };
          }
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
      imageId: id,
      useOriginalImageFields: true,
    };

    const index = selectedImages.findIndex((img) => img.imageId === id);
    if (index !== -1) {
      setSelectedImages(selectedImages.filter((img) => img.imageId !== id));
      remove(index);
    } else {
      setSelectedImages([...selectedImages, imagePayload]);
      append({
        ...imagePayload,
      });
    }
  };

  const toggleSelectedImageCheckbox = (index: number = 0) => {
    update(index, {
      ...fields[index],
      useOriginalImageFields: !fields[index].useOriginalImageFields,
    });
  };

  const shareGroupImagesFilter = (image: Image) => {
    return (
      image.status === 'available' &&
      image.is_public === false &&
      image.created_by !== null
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
                rows={1}
              />
            )}
          />
        </Stack>
        <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
        <Stack spacing={2}>
          <Typography variant="h2">Images</Typography>
          <ImageSelectTable
            currentRoute="/images/share-groups/create"
            filter={shareGroupImagesFilter}
            onSelect={handleImagesTableSelect}
            pendoIDs={IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS}
            selectedImageIds={selectedImages.map((img) => img.id) ?? []}
            selectionMode="multi"
          />
        </Stack>
        <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
        <Stack spacing={2}>
          <Typography variant="h2">
            Selected images ({selectedImages.length ?? 0})
          </Typography>
          {fields.map((image, index) => (
            <Stack key={image.id} mb={4}>
              <Stack alignItems="baseline" direction="row" spacing={2}>
                <Typography variant="body1">
                  <b>{index + 1}. Original image: </b>
                </Typography>
                <Typography variant="body1">
                  {selectedImages[index].label}
                </Typography>
              </Stack>
              <Controller
                control={control}
                name={`images.${index}`}
                render={() => (
                  <Box>
                    <Checkbox
                      checked={image.useOriginalImageFields}
                      onChange={() => toggleSelectedImageCheckbox(index)}
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
                    name={`images.${index}.label`}
                    render={({ field, fieldState }) => (
                      <TextField
                        data-testid={`selected-image-${index}-label`}
                        errorText={fieldState.error?.message}
                        label="Label"
                        noMarginTop
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`images.${index}.description`}
                    render={({ field, fieldState }) => (
                      <TextField
                        data-testid={`selected-image-${index}-description`}
                        errorText={fieldState.error?.message}
                        label="Description"
                        multiline
                        noMarginTop
                        {...field}
                        rows={1}
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
