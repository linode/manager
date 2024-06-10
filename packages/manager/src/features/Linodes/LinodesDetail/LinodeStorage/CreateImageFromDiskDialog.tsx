import { Disk } from '@linode/api-v4';
import { Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DISK_ENCRYPTION_IMAGES_CAVEAT_COPY } from 'src/components/DiskEncryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/DiskEncryption/utils';
import { Notice } from 'src/components/Notice/Notice';
import { SupportLink } from 'src/components/SupportLink/SupportLink';
import { useCreateImageMutation } from 'src/queries/images';

interface Props {
  disk: Disk | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const CreateImageFromDiskDialog = (props: Props) => {
  const { disk, linodeId, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isLoading,
    mutateAsync: createImage,
    reset,
  } = useCreateImageMutation();

  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  const onCreate = async () => {
    await createImage({
      disk_id: disk?.id ?? -1,
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
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Create Image',
            loading: isLoading,
            onClick: onCreate,
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title={`Create Image from ${disk?.label}?`}
    >
      {isDiskEncryptionFeatureEnabled && (
        <Notice
          spacingTop={8}
          text={DISK_ENCRYPTION_IMAGES_CAVEAT_COPY}
          variant="warning"
        />
      )}
      <Typography>
        Linode Images are limited to 6144 MB of data per disk by default. Please
        ensure that your disk content does not exceed this size limit, or{' '}
        <SupportLink
          description={ticketDescription}
          entity={{ id: linodeId, type: 'linode_id' }}
          text="open a support ticket"
          title="Increase Image Size Request"
        />{' '}
        to request a higher limit. Additionally, Linode Images cannot be created
        if you are using raw disks or disks that have been formatted using
        custom filesystems.
      </Typography>
    </ConfirmationDialog>
  );
};
