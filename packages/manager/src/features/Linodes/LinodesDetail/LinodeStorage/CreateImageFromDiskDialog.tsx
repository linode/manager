import React from 'react';
import { Disk } from '@linode/api-v4';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useCreateImageMutation } from 'src/queries/images';
import { useSnackbar } from 'notistack';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button/Button';
import { Typography } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  disk: Disk | undefined;
}

export const CreateImageFromDiskDialog = (props: Props) => {
  const { open, onClose, disk } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createImage, error } = useCreateImageMutation();

  const onCreate = async () => {
    await createImage({
      diskID: disk?.id ?? -1,
    });

    enqueueSnackbar('Image scheduled for creation.', {
      variant: 'info',
    });
  };

  return (
    <ConfirmationDialog
      title={`Create Image from ${disk?.label}?`}
      open={open}
      onClose={onClose}
      error={error?.[0].reason}
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button buttonType="primary" onClick={onCreate}>
            Create Image
          </Button>
        </ActionsPanel>
      }
    >
      <Typography>
        Linode Images are limited to 6144 MB of data per disk by default. Please
        ensure that your disk content does not exceed this size limit, or open a
        Support ticket to request a higher limit. Additionally, Linode Images
        cannot be created if you are using raw disks or disks that have been
        formatted using custom filesystems.
      </Typography>
    </ConfirmationDialog>
  );
};
