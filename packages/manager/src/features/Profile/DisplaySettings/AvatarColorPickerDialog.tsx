import { Dialog, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Avatar } from 'src/components/Avatar/Avatar';
import { ColorPicker } from 'src/components/ColorPicker/ColorPicker';
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

export interface AvatarColorPickerDialogProps {
  handleClose: () => void;
  open: boolean;
}

export const AvatarColorPickerDialog = (
  props: AvatarColorPickerDialogProps
) => {
  const { handleClose, open } = props;

  const [avatarColor, setAvatarColor] = useState<string>();

  const { data: avatarColorPreference } = usePreferences(
    (preferences) => preferences?.avatarColor
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  return (
    <Dialog onClose={handleClose} open={open} title="Change Avatar Color">
      <Stack alignItems="center" display="flex" flexDirection="row">
        <Typography sx={{ paddingRight: 1 }}>
          Select a background color for your avatar:
        </Typography>
        <ColorPicker
          defaultColor={avatarColorPreference}
          inputStyles={{ height: 30, width: 30 }}
          label="Avatar color picker"
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
          disabled: !avatarColor || avatarColorPreference === avatarColor,
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
