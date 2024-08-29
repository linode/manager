import { useTheme } from '@mui/material';
import React, { useState } from 'react';

import type { CSSProperties } from 'react';

interface Props {
  defaultColor?: string;
  handleColorChange: (color: string) => void;
  hideLabel?: boolean; // TODO: visually hidden
  inputStyles?: CSSProperties;
  label: string;
  labelStyles?: CSSProperties;
}

export const ColorPicker = (props: Props) => {
  const {
    defaultColor,
    handleColorChange,
    inputStyles,
    label,
    labelStyles,
  } = props;

  const theme = useTheme();
  const [color, setColor] = useState<string>(
    defaultColor ?? theme.palette.primary.dark
  );

  return (
    <>
      <label
        className="visually-hidden"
        htmlFor="color-picker"
        style={labelStyles}
      >
        {label}
      </label>
      <input
        onChange={(e) => {
          setColor(e.target.value);
          handleColorChange(e.target.value);
        }}
        color={color}
        id="color-picker"
        style={inputStyles}
        type="color"
        value={color}
      />
    </>
  );
};
