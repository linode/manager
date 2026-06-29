import { useCreateShareGroupMutation } from '@linode/queries';
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import { useNavigate } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS } from 'src/components/ImageSelect/constants';

import { CREATE_SHARE_GROUP_PENDO_IDS } from '../../constants';
import { AddImagesPanel } from '../AddImagesPanel';

import type {
  ShareGroupFormImage,
  ShareGroupFormPayload,
} from '../AddImagesPanel';
import type { CreateSharegroupPayload } from '@linode/api-v4';

export const ShareGroupsCreate = () => {
  const navigate = useNavigate();
  const formContainerRef = React.useRef<HTMLFormElement>(null);

  const { mutateAsync: createShareGroup } = useCreateShareGroupMutation();

  const form = useForm<ShareGroupFormPayload>({});
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = form;

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

      const result = await createShareGroup(payload);

      navigate({
        search: () => ({}),
        to: `/images/share-groups/owned-groups/${result.id}`,
      });

      enqueueSnackbar('Share group created successfully', {
        variant: 'success',
      });
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
        scrollErrorIntoViewV2(formContainerRef);
      }
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} ref={formContainerRef}>
        <Paper>
          <Stack spacing={2}>
            <Typography variant="h2">Share Group Details</Typography>
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
          <AddImagesPanel
            currentRoute="/images/share-groups/create"
            formControl={control}
            pendoIDs={IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            title="Images"
          />
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
    </FormProvider>
  );
};
