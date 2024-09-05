import { Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Avatar } from 'src/components/Avatar/Avatar';
import { ColorPicker } from 'src/components/ColorPicker/ColorPicker';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Stack } from 'src/components/Stack';
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

interface Props {
  handleClose: () => void;
  open: boolean;
}

export const AvatarColorPickerDialog = (props: Props) => {
  const { handleClose, open } = props;

  const [avatarColor, setAvatarColor] = useState<string>();

  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  return (
    <Dialog onClose={handleClose} open={open} title="Change Avatar Color">
      <Stack alignItems="baseline" display="flex" flexDirection="row">
        <Typography sx={{ paddingRight: 1 }}>
          Select a background color for your avatar:
        </Typography>
        <ColorPicker
          defaultColor={preferences?.avatarColor}
          inputStyles={{ height: 30, width: 30 }}
          label="Avatar background color picker"
          onChange={(color: string) => setAvatarColor(color)}
        />
      </Stack>
      <Stack
        display="flex"
        flexDirection="row"
        justifyContent="center"
        sx={{ paddingY: 2 }}
      >
        <Avatar color={avatarColor} height={88} width={88} />
      </Stack>

      <ActionsPanel
        primaryButtonProps={{
          label: 'Save',
          onClick: () => {
            if (avatarColor) {
              updatePreferences({
                avatarColor,
              }).catch(() => {});
            }
            handleClose();
          },
        }}
        secondaryButtonProps={{
          'data-testid': 'close-button',
          label: 'Close',
          onClick: handleClose,
        }}
        sx={{
          display: 'flex',
        }}
      />
    </Dialog>
  );
};
