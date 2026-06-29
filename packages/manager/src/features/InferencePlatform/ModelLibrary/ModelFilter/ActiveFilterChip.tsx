import { Chip } from '@linode/ui';
import React from 'react';

import type { ChipProps } from '@linode/ui';

export type ActiveFilterChipType =
  | 'inputModes'
  | 'language'
  | 'maxContext'
  | 'outputModes'
  | 'parameters'
  | 'provider'
  | 'search'
  | 'serverless'
  | 'useCaseTags';

interface ActiveFilterChipProps {
  icon?: ChipProps['icon'];
  label: string;
  onDelete: () => void;
  type: ActiveFilterChipType;
}

const getChipStyles = (type: string, theme: 'dark' | 'light'): object => {
  switch (type) {
    case 'inputModes':
      return {
        color: 'hsl(120, 50%, 95%)',
        backgroundColor:
          theme === 'light' ? 'hsl(120, 50%, 55%)' : 'hsl(120, 50%, 40%)',
      };
    case 'language':
      return {
        color: 'hsl(300, 50%, 95%)',
        backgroundColor:
          theme === 'light' ? 'hsl(330, 50%, 60%)' : 'hsl(330, 50%, 50%)',
      };
    case 'maxContext':
      return {
        color: 'hsl(200, 70%, 95%)',
        backgroundColor:
          theme === 'light' ? 'hsl(200, 70%, 55%)' : 'hsl(200, 70%, 40%)',
      };
    case 'outputModes':
      return {
        color: 'hsl(150, 60%, 95%)',
        backgroundColor:
          theme === 'light' ? 'hsl(150, 60%, 45%)' : 'hsl(150, 60%, 35%)',
      };
    case 'parameters':
      return {
        color: 'hsl(220, 70%, 95%)',
        backgroundColor:
          theme === 'light' ? 'hsl(220, 70%, 60%)' : 'hsl(220, 70%, 50%)',
      };
    case 'provider':
      return {
        color: 'hsl(50, 70%, 95%)',
        backgroundColor:
          theme === 'light' ? 'hsl(50, 70%, 55%)' : 'hsl(50, 70%, 40%)',
      };
    case 'search':
      return {
        color: 'hsl(50, 70%, 95%)',
        backgroundColor:
          theme === 'light' ? 'hsl(280, 60%, 55%)' : 'hsl(280, 60%, 45%)',
      };
    case 'serverless':
      return {
        color: 'hsl(1, 100%, 95%)',
        backgroundColor:
          theme === 'light' ? 'hsl(1, 100%, 45%)' : 'hsl(1, 100%, 35%)',
      };
    case 'useCaseTags':
      return {
        color: 'hsl(40, 100%, 95%)',
        backgroundColor:
          theme === 'light' ? 'hsl(30, 100%, 55%)' : 'hsl(30, 100%, 40%)',
      };
  }

  return {};
};

export const ActiveFilterChip = ({
  icon,
  label,
  onDelete,
  type,
}: ActiveFilterChipProps) => {
  return (
    <Chip
      label={label}
      onDelete={onDelete}
      size="small"
      sx={(theme) => ({
        ...getChipStyles(type, theme.palette.mode),
        font: theme.font.semibold,
        fontSize: 12,
        px: 0.7,
        paddingTop: 0.05,
        paddingBottom: 0,
        height: 22,
        '& .MuiChip-deleteIcon': {
          width: 12,
          height: 12,
          padding: 0,
          marginBottom: -0.1,
          py: 0,
          color: 'hsla(0,0%,100%,0.6)',
          '&:hover': {
            color: 'hsla(0,0%,100%,0.8)',
          },
          '&:active': {
            color: 'hsla(0,0%,100%,0.3)',
          },
        },
      })}
      variant="filled"
    />
  );
};
