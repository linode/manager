import { Drawer, Stack, Typography } from '@linode/ui';
import React from 'react';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';

import type { Volume } from '@linode/api-v4';

interface Props {
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
  volume: undefined | Volume;
}

export const VolumeDetailsDrawer = (props: Props) => {
  const { isFetching, onClose, open, volume } = props;

  return (
    <Drawer
      isFetching={isFetching}
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title="Volume Configuration"
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography data-qa-config-help-msg variant="body1">
            To get started with a new volume, you&rsquo;ll want to create a
            filesystem on it:
          </Typography>
          <CopyableTextField
            data-qa-make-filesystem
            hideLabel
            label="Create a Filesystem"
            value={`mkfs.ext4 "${volume?.filesystem_path}"`}
          />
        </Stack>
        <Stack spacing={1}>
          <Typography data-qa-config-help-msg variant="body1">
            Once the volume has a filesystem, you can create a mountpoint for
            it:
          </Typography>
          <CopyableTextField
            data-qa-mountpoint
            hideLabel
            label="Create a Mountpoint"
            value={`mkdir "/mnt/${volume?.label}"`}
          />
        </Stack>
        <Stack spacing={1}>
          <Typography data-qa-config-help-msg variant="body1">
            Then you can mount the new volume:
          </Typography>
          <CopyableTextField
            data-qa-mount
            hideLabel
            label="Mount Volume"
            value={`mount "${volume?.filesystem_path}" "/mnt/${volume?.label}"`}
          />
        </Stack>
        <Stack spacing={1}>
          <Typography data-qa-config-help-msg variant="body1">
            If you want the volume to automatically mount every time your Linode
            boots, you&rsquo;ll want to add a line like the following to your
            /etc/fstab file:
          </Typography>
          <CopyableTextField
            data-qa-boot-mount
            hideLabel
            label="Mount every time your Linode boots"
            value={`${volume?.filesystem_path} /mnt/${volume?.label} ext4 defaults,noatime,nofail 0 2`}
          />
        </Stack>
      </Stack>
    </Drawer>
  );
};
