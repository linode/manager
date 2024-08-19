import { useTheme } from '@mui/material';
import React, { useState } from 'react';

import { usePreferences } from 'src/queries/profile/preferences';

import type { SxProps } from '@mui/material';

interface Props {
  handleColorChange: (color: string) => void;
  hideLabel?: boolean; // TODO: visually hidden
  label: string;
  sx?: SxProps;
}

export const ColorPicker = (props: Props) => {
  const { handleColorChange, label } = props;

  const { data: preferences } = usePreferences();
  const theme = useTheme();

  // TODO: figure out why default isn't working
  const [color, setColor] = useState(
    preferences?.avatarColor ?? theme.color.blue
  );

  return (
    <>
      <label htmlFor="color-picker" style={{ marginRight: '10px' }}>
        {label}
      </label>
      <input
        onChange={(e) => {
          setColor(e.target.value);
          handleColorChange(e.target.value);
        }}
        color={color}
        id="color-picker"
        type="color"
      />
    </>
  );
};
