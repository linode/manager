import { Border } from '@linode/design-language-system';
import { Box } from '@linode/ui';
import React from 'react';

interface ColorSwatchProps {
  /**
   * The color to display
   */
  color: string;
}

export const ColorSwatch = ({ color }: ColorSwatchProps) => {
  return (
    <Box
      sx={{
        backgroundColor: color,
        border: `1px solid ${Border.Normal}`,
        borderRadius: '50%',
        flexShrink: 0,
        height: '30px',
        width: '30px',
      }}
    />
  );
};
