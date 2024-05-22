import { yupResolver } from '@hookform/resolvers/yup';
import { APIError, UpdateImagePayload } from '@linode/api-v4';
import { updateImageSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { useImageQuery, useUpdateImageMutation } from 'src/queries/images';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { useImageAndLinodeGrantCheck } from './utils';

interface Props {
  imageID?: string;
  onClose: () => void;
  open: boolean;
}
export const EditImageDrawer = (props: Props) => {
  const { imageID, onClose, open } = props;

  const { canCreateImage } = useImageAndLinodeGrantCheck();

  const { data: image } = useImageQuery(imageID ?? '', !!imageID && open);

  const {
    control,
    formState,
    handleSubmit,
    resetField,
    setError,
    watch,
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

  // const onSubmit = () => {
  //   if (!imageID) {
  //     return;
  //   }

  //   setErrors(undefined);
  //   setSubmitting(true);

  //   updateImage({ description: safeDescription, imageId: imageID, label, tags })
  //     .then(onClose)
  //     .catch((errorResponse: APIError[]) => {
  //       setErrors(getAPIErrorOrDefault(errorResponse, 'Unable to edit Image'));
  //     })
  //     .finally(() => {
  //       setSubmitting(false);
  //     });
  // };

  return (
    <Drawer onClose={onClose} open={open} title="Edit Image">
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

      {/* <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          disabled: !canCreateImage,
          label: 'Save Changes',
          loading: submitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          disabled: !canCreateImage,
          label: 'Cancel',
          onClick: onClose,
        }}
        style={{ marginTop: 16 }}
      /> */}
    </Drawer>
  );
};
