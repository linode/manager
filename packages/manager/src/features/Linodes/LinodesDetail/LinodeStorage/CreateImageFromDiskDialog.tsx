import React from 'react';
import { Disk } from '@linode/api-v4';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useCreateImageMutation } from 'src/queries/images';
import { useSnackbar } from 'notistack';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { Typography } from '@mui/material';
import { SupportLink } from 'src/components/SupportLink/SupportLink';

interface Props {
  open: boolean;
  onClose: () => void;
  disk: Disk | undefined;
  linodeId: number;
}

export const CreateImageFromDiskDialog = (props: Props) => {
  const { open, onClose, disk, linodeId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    mutateAsync: createImage,
    isLoading,
    error,
    reset,
  } = useCreateImageMutation();

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  const onCreate = async () => {
    await createImage({
      diskID: disk?.id ?? -1,
    });
    enqueueSnackbar('Image scheduled for creation.', {
      variant: 'info',
    });
    onClose();
  };

  const ticketDescription = error
    ? `I see a notice saying "${error?.[0].reason}" when trying to create an Image from my disk ${disk?.label} (${disk?.id}).`
    : `I would like to create an Image from my disk ${disk?.label} (${disk?.id}).`;

  return (
    <ConfirmationDialog
      title={`Create Image from ${disk?.label}?`}
      open={open}
      onClose={onClose}
      error={error?.[0].reason}
      actions={
        <ActionsPanel
          primary
          primaryButtonHandler={onCreate}
          primaryButtonLoading={isLoading}
          primaryButtonText="Create Image"
          secondary
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      }
    >
      <Typography>
        Linode Images are limited to 6144 MB of data per disk by default. Please
        ensure that your disk content does not exceed this size limit, or{' '}
        <SupportLink
          text="open a support ticket"
          title="Increase Image Size Request"
          description={ticketDescription}
          entity={{ id: linodeId, type: 'linode_id' }}
        />{' '}
        to request a higher limit. Additionally, Linode Images cannot be created
        if you are using raw disks or disks that have been formatted using
        custom filesystems.
      </Typography>
    </ConfirmationDialog>
  );
};
