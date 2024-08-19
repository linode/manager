import { Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import { debounce } from 'throttle-debounce';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ColorPicker } from 'src/components/ColorPicker';
import { Dialog } from 'src/components/Dialog/Dialog';
import { useMutatePreferences } from 'src/queries/profile/preferences';

interface Props {
  handleClose: () => void;
  open: boolean;
}

export const AvatarColorPickerDialog = (props: Props) => {
  const { handleClose, open } = props;

  const [avatarColor, setAvatarColor] = useState();

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const debouncedSetAvatarColor = React.useCallback(
    debounce(250, false, (color) => setAvatarColor(color)),
    [setAvatarColor]
  );

  return (
    <Dialog onClose={handleClose} open={open} title="Change Avatar Color">
      <Typography>Select a custom color for your avatar.</Typography>
      <ColorPicker
        handleColorChange={(color: string) => debouncedSetAvatarColor(color)}
        // sxProps={{ marginTop: '12px' }} //TODO: get working
        label="" // TODO: visually hidden
      />

      <ActionsPanel
        primaryButtonProps={{
          label: 'Save',
          onClick: () => {
            if (avatarColor) {
              updatePreferences({
                avatarColor,
              }).catch(
                () =>
                  /** swallow the error */
                  null
              );
            }
            handleClose();
          },
        }}
        secondaryButtonProps={{
          compactX: true,
          'data-testid': 'close-button',
          label: 'Close',
          onClick: handleClose,
        }}
        sx={{
          display: 'flex',
          marginTop: '18px !important',
          paddingBottom: 0,
          paddingTop: 0,
        }}
      />
    </Dialog>
  );
};
