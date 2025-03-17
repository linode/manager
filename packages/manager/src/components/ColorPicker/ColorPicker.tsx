import { useTheme } from '@mui/material';
import React, { useState } from 'react';

import type { CSSProperties } from 'react';

export interface ColorPickerProps {
  /**
   * Optional color to specify as a default
   * */
  defaultColor?: string;
  /**
   * Optional styles for the input element
   * */
  inputStyles?: CSSProperties;
  /**
   * Visually hidden label to semantically describe the color picker for accessibility
   * */
  label: string;
  /**
   * Function to update the color based on user selection
   * */
  onChange: (color: string) => void;
}

/**
 * The ColorPicker component serves as a wrapper for the native HTML input color picker.
 */
export const ColorPicker = (props: ColorPickerProps) => {
  const { defaultColor, inputStyles, label, onChange } = props;

  const theme = useTheme();
  const [color, setColor] = useState<string>(
    defaultColor ?? theme.tokens.color.Neutrals[30]
  );

  return (
    <>
      <label className="visually-hidden" htmlFor="color-picker">
        {label}
      </label>
      <input
        onChange={(e) => {
          setColor(e.target.value);
          onChange(e.target.value);
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
