import { yupResolver } from '@hookform/resolvers/yup';
import { APIError, Image, UpdateImagePayload } from '@linode/api-v4';
import { updateImageSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { useUpdateImageMutation } from 'src/queries/images';

import { useImageAndLinodeGrantCheck } from './utils';

interface Props {
  image?: Image;
  onClose: () => void;
  open: boolean;
}
export const EditImageDrawer = (props: Props) => {
  const { image, onClose, open } = props;

  const { canCreateImage } = useImageAndLinodeGrantCheck();

  const {
    control,
    formState,
    handleSubmit,
    reset,
    setError,
  } = useForm<UpdateImagePayload>({
    mode: 'onBlur',
    resolver: yupResolver(updateImageSchema),
    values: {
      description: image?.description ?? undefined,
      label: image?.label,
      tags: image?.tags,
    },
  });

  const { mutateAsync: updateImage } = useUpdateImageMutation();

  const onSubmit = handleSubmit((values) => {
    if (!image) {
      return;
    }

    updateImage({ imageId: image.id, ...values })
      .then(onClose)
      .catch((errors: APIError[]) => {
        for (const error of errors) {
          if (
            (error.field && error.field === 'label') ||
            error.field == 'description' ||
            error.field == 'tags'
          ) {
            setError(error.field, { message: error.reason });
          } else {
            setError('root', { message: error.reason });
          }
        }
      });
  });

  return (
    <Drawer
      onClose={onClose}
      onTransitionEnter={reset}
      open={open}
      title="Edit Image"
    >
      {!canCreateImage ? (
        <Notice
          text="You don't have permissions to create a new Image. Please contact an account administrator for details."
          variant="error"
        />
      ) : null}

      {formState.errors.root?.message && (
        <Notice
          spacingBottom={8}
          text={formState.errors.root.message}
          variant="error"
        />
      )}

      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-image-label
            disabled={!canCreateImage}
            error={Boolean(fieldState.error)}
            errorText={fieldState.error?.message}
            label="Label"
            onChange={(e) => field.onChange(e.target.value)}
            value={field.value}
          />
        )}
        control={control}
        name="label"
      />

      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-image-description
            disabled={!canCreateImage}
            error={Boolean(fieldState.error)}
            errorText={fieldState.error?.message}
            label="Description"
            multiline
            onChange={(e) => field.onChange(e.target.value)}
            rows={1}
            value={field.value}
          />
        )}
        control={control}
        name="description"
      />

      <Controller
        render={({ field, fieldState }) => (
          <TagsInput
            value={
              field.value?.map((tag) => ({ label: tag, value: tag })) ?? []
            }
            disabled={!canCreateImage}
            label="Tags"
            onChange={(tags) => field.onChange(tags.map((tag) => tag.value))}
            tagError={fieldState.error?.message}
          />
        )}
        control={control}
        name="tags"
      />

      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          disabled: !canCreateImage,
          label: 'Save Changes',
          loading: formState.isSubmitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          disabled: !canCreateImage,
          label: 'Cancel',
          onClick: onClose,
        }}
        style={{ marginTop: 16 }}
      />
    </Drawer>
  );
};
