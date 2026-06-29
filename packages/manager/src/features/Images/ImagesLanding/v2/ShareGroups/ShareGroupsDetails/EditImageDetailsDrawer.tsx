import { useUpdateShareGroupImageMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Stack, TextField, Typography } from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { EDIT_IMAGE_DETAILS_PENDO_IDS } from '../../constants';

import type { Image, UpdateSharegroupImagePayload } from '@linode/api-v4';

interface Props {
  image: Image | null;
  onClose: () => void;
  open: boolean;
  shareGroupId: string;
}

export const EditImageDetailsDrawer = (props: Props) => {
  const { onClose, open, image, shareGroupId } = props;

  const { label, id, description } = image ?? {};
  const initialValues = {
    label: label ?? '',
    description: description ?? '',
  };

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<UpdateSharegroupImagePayload>({
    values: initialValues,
    mode: 'onBlur',
  });

  const { mutateAsync: editShareGroupImage } =
    useUpdateShareGroupImageMutation();

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (!shareGroupId || !id) {
        return;
      }

      await editShareGroupImage({
        imageId: id,
        sharegroupId: shareGroupId,
        data: values,
      });

      enqueueSnackbar('Shared image details updated successfully', {
        variant: 'success',
      });
      onClose();
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

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer
      closeButtonPendoId={EDIT_IMAGE_DETAILS_PENDO_IDS.xButton}
      onClose={handleClose}
      open={open}
      title="Edit Shared Image Details"
    >
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <Typography>
            Note: details are visible to all group members.
          </Typography>
          <Controller
            control={control}
            name="label"
            render={({ field, fieldState }) => {
              return (
                <TextField
                  label="Shared image label"
                  noMarginTop
                  {...field}
                  data-pendo-id={EDIT_IMAGE_DETAILS_PENDO_IDS.label}
                  errorText={fieldState.error?.message}
                  required
                />
              );
            }}
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
                data-pendo-id={EDIT_IMAGE_DETAILS_PENDO_IDS.description}
                rows={1}
              />
            )}
          />
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            disabled: !isDirty,
            label: 'Save',
            loading: isSubmitting,
            onClick: onSubmit,
            'data-pendo-id': EDIT_IMAGE_DETAILS_PENDO_IDS.saveButton,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleClose,
            'data-pendo-id': EDIT_IMAGE_DETAILS_PENDO_IDS.cancelButton,
          }}
          style={{ marginTop: 16 }}
        />
      </form>
    </Drawer>
  );
};
