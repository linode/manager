import {
  Box,
  Checkbox,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import * as React from 'react';
import type { Control } from 'react-hook-form';
import { Controller, useFieldArray } from 'react-hook-form';

import { ImageSelectTable } from 'src/components/ImageSelect/ImageSelectTable';

import type {
  CreateSharegroupPayload,
  Image,
  SharegroupImagePayload,
} from '@linode/api-v4';
import type { LinkProps } from '@tanstack/react-router';
import type {
  IMAGE_SELECT_TABLE_SHARE_GROUP_ADD_IMAGES_PENDO_IDS,
  IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS,
} from 'src/components/ImageSelect/constants';

export interface ShareGroupFormImage extends SharegroupImagePayload {
  imageId: string;
  useOriginalImageFields: boolean;
}

export interface ShareGroupFormPayload
  extends Omit<CreateSharegroupPayload, 'images'> {
  images?: ShareGroupFormImage[];
}

interface ImageMultiSelectProps {
  currentRoute: LinkProps['to'];
  formControl: Control<ShareGroupFormPayload>;
  pendoIDs:
    | typeof IMAGE_SELECT_TABLE_SHARE_GROUP_ADD_IMAGES_PENDO_IDS
    | typeof IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS;
  selectedImages: ShareGroupFormImage[];
  setSelectedImages: React.Dispatch<
    React.SetStateAction<ShareGroupFormImage[]>
  >;
  shareGroupImageIds?: string[];
  title: string;
}

export const AddImagesPanel = (props: ImageMultiSelectProps) => {
  const {
    currentRoute,
    formControl,
    selectedImages,
    setSelectedImages,
    shareGroupImageIds,
    title,
    pendoIDs,
  } = props;

  const { append, fields, remove, update } = useFieldArray({
    control: formControl,
    name: 'images',
  });

  const existingImageIds = React.useMemo(
    () => new Set(shareGroupImageIds),
    [shareGroupImageIds]
  );

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
      image.created_by !== null &&
      !existingImageIds.has(image.id)
    );
  };

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="h2">{title}</Typography>
        <ImageSelectTable
          currentRoute={currentRoute}
          filter={shareGroupImagesFilter}
          onSelect={handleImagesTableSelect}
          pendoIDs={pendoIDs}
          selectedImageIds={selectedImages.map((img) => img.id) ?? []}
          selectionMode="multi"
          showSubtitle
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
              control={formControl}
              name={`images.${index}`}
              render={() => (
                <Box>
                  <Checkbox
                    checked={image.useOriginalImageFields}
                    data-pendo-id={pendoIDs.useOriginalImageFieldsCheckbox}
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
                  control={formControl}
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
                  control={formControl}
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
    </>
  );
};
