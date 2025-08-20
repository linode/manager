import { useDeleteImageMutation, useImageQuery } from '@linode/queries';
import { useSnackbar } from 'notistack';
import React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';

interface Props {
  imageId: string;
  onClose: () => void;
  open: boolean;
}

export const DeleteImageDialog = (props: Props) => {
  const { imageId, open, onClose } = props;
  const { data: image, isLoading, error } = useImageQuery(imageId);
  const { enqueueSnackbar } = useSnackbar();

  const { mutate: deleteImage, isPending } = useDeleteImageMutation({
    onSuccess() {
      enqueueSnackbar('Image has been scheduled for deletion.', {
        variant: 'info',
      });
      onClose();
    },
  });

  const isPendingUpload = image?.status === 'pending_upload';

  return (
    <TypeToConfirmDialog
      entity={{
        type: 'Image',
        primaryBtnText: isPendingUpload ? 'Cancel Upload' : 'Delete',
        action: isPendingUpload ? 'cancellation' : 'deletion',
        name: image?.label,
      }}
      errors={error}
      isFetching={isLoading}
      label="Image Label"
      loading={isPending}
      onClick={() => deleteImage({ imageId })}
      onClose={onClose}
      open={open}
      secondaryButtonProps={{
        label: isPendingUpload ? 'Keep Image' : 'Cancel',
      }}
      title={
        isPendingUpload
          ? 'Cancel Upload'
          : `Delete Image ${image?.label ?? imageId}`
      }
    />
  );
};
