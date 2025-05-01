import { yupResolver } from '@hookform/resolvers/yup';
import { ActionsPanel, Drawer, Notice, TextField } from '@linode/ui';
import { Stack, Typography } from '@linode/ui';
import { updateImageSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import Lock from 'src/assets/icons/lock.svg';
import { NotFound } from 'src/components/NotFound';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { useUpdateImageMutation } from 'src/queries/images';

import { useImageAndLinodeGrantCheck } from '../utils';

import type { APIError, Image, UpdateImagePayload } from '@linode/api-v4';

interface Props {
  image: Image | undefined;
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
}
export const EditImageDrawer = (props: Props) => {
  const { image, isFetching, onClose, open } = props;

  const { canCreateImage } = useImageAndLinodeGrantCheck();

  const defaultValues = {
    description: image?.description ?? undefined,
    label: image?.label,
    tags: image?.tags,
  };

  const { control, formState, handleSubmit, reset, setError } =
    useForm<UpdateImagePayload>({
      defaultValues,
      mode: 'onBlur',
      resolver: yupResolver(updateImageSchema),
      values: defaultValues,
    });

  const { mutateAsync: updateImage } = useUpdateImageMutation();

  const onSubmit = handleSubmit(async (values) => {
    if (!image) {
      return;
    }

    const safeDescription = values.description?.length
      ? values.description
      : ' ';

    await updateImage({
      imageId: image.id,
      ...values,
      description: safeDescription,
    })
      .then(handleClose)
      .catch((errors: APIError[]) => {
        for (const error of errors) {
          if (
            error.field === 'label' ||
            error.field === 'description' ||
            error.field === 'tags'
          ) {
            setError(error.field, { message: error.reason });
          } else {
            setError('root', { message: error.reason });
          }
        }
      });
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer
      isFetching={isFetching}
      NotFoundComponent={NotFound}
      onClose={handleClose}
      open={open}
      title="Edit Image"
    >
      {!canCreateImage && (
        <Notice
          text="You don't have permissions to edit images. Please contact an account administrator for details."
          variant="error"
        />
      )}

      {formState.errors.root?.message && (
        <Notice
          spacingBottom={8}
          text={formState.errors.root.message}
          variant="error"
        />
      )}

      {image?.capabilities?.includes('distributed-sites') && (
        <Stack alignItems="center" direction="row" spacing={1}>
          <Lock />
          <Typography
            sx={(theme) => ({ color: theme.textColors.textAccessTable })}
          >
            Encrypted
          </Typography>
        </Stack>
      )}

      <Controller
        control={control}
        name="label"
        render={({ field, fieldState }) => (
          <TextField
            disabled={!canCreateImage}
            error={Boolean(fieldState.error)}
            errorText={fieldState.error?.message}
            label="Label"
            onBlur={field.onBlur}
            onChange={(e) => field.onChange(e.target.value)}
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <TextField
            disabled={!canCreateImage}
            error={Boolean(fieldState.error)}
            errorText={fieldState.error?.message}
            label="Description"
            multiline
            onBlur={field.onBlur}
            onChange={(e) => field.onChange(e.target.value)}
            rows={1}
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="tags"
        render={({ field, fieldState }) => (
          <TagsInput
            disabled={!canCreateImage}
            label="Tags"
            onChange={(tags) => field.onChange(tags.map((tag) => tag.value))}
            tagError={fieldState.error?.message}
            value={
              field.value?.map((tag) => ({ label: tag, value: tag })) ?? []
            }
          />
        )}
      />

      <ActionsPanel
        primaryButtonProps={{
          disabled: !canCreateImage || !formState.isDirty,
          label: 'Save Changes',
          loading: formState.isSubmitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          disabled: !canCreateImage,
          label: 'Cancel',
          onClick: handleClose,
        }}
        style={{ marginTop: 16 }}
      />
    </Drawer>
  );
};
