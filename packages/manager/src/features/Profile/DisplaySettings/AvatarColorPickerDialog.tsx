import { Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import { debounce } from 'throttle-debounce';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ColorPicker } from 'src/components/ColorPicker';
import { Dialog } from 'src/components/Dialog/Dialog';
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

  const [avatarColor, setAvatarColor] = useState();

  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const debouncedSetAvatarColor = React.useCallback(
    debounce(250, false, (color) => setAvatarColor(color)),
    [setAvatarColor]
  );

  return (
    <Dialog onClose={handleClose} open={open} title="Change Avatar Color">
      <Typography>Select a custom background color for your avatar.</Typography>
      <ColorPicker
        defaultColor={preferences?.avatarColor}
        handleColorChange={(color: string) => debouncedSetAvatarColor(color)}
        inputStyles={{ marginTop: '12px' }}
        label="Avatar background color picker"
        labelStyles={{ marginLeft: 0 }}
      />

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
