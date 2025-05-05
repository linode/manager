import React from 'react';

import { Box } from '../../Box/Box';

import type { BoxProps } from '../../Box/Box';

interface DayBoxProps extends BoxProps {
  isSelected: boolean | null;
  isStartOrEnd: boolean | null;
}

export const DayBox = ({
  isSelected,
  isStartOrEnd,
  sx,
  ...props
}: DayBoxProps) => {
  return (
    <Box
      sx={[
        (theme) => ({
          '&:hover': {
            backgroundColor: !isStartOrEnd
              ? theme.tokens.component.Calendar.HoverItem.Background
              : theme.tokens.alias.Action.Primary.Hover,
            border: `1px solid ${theme.tokens.component.Calendar.Border}`,
            color: isStartOrEnd
              ? theme.tokens.component.Calendar.SelectedItem.Text
              : theme.tokens.component.Calendar.HoverItem.Text,
          },
          alignItems: 'center',
          backgroundColor:
            isStartOrEnd || isSelected
              ? theme.tokens.component.Calendar.SelectedItem.Background.Default
              : 'transparent',
          borderRadius: '50%',
          color:
            isStartOrEnd || isSelected
              ? theme.tokens.component.Calendar.SelectedItem.Text
              : theme.tokens.component.Calendar.Text.Default,
          cursor: 'pointer',
          display: 'flex',
          height: 40,
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
          width: 40,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
};
