import { Chip } from '@linode/ui';
import LockIcon from '@mui/icons-material/Lock';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import type { ApiKeyType } from '@linode/api-v4';

export interface KeyTypeBadgeProps {
  keyType: ApiKeyType;
}

export const KeyTypeBadge = ({ keyType }: KeyTypeBadgeProps) => {
  const theme = useTheme();
  const isDarkMode = theme.name === 'dark';

  const typeStyles: Record<
    ApiKeyType,
    { backgroundColor: string; color: string }
  > = {
    playground: {
      backgroundColor: isDarkMode
        ? theme.tokens.color.Violet[40]
        : theme.tokens.color.Violet[30],
      color: theme.tokens.color.Violet[90],
    },
    user: {
      backgroundColor: isDarkMode
        ? theme.tokens.color.Ultramarine[40]
        : theme.tokens.color.Ultramarine[30],
      color: theme.tokens.color.Ultramarine[90],
    },
  };

  const label = keyType === 'playground' ? 'Playground Key' : 'User Key';

  return (
    <Chip
      icon={<LockIcon sx={{ fontSize: 14 }} />}
      label={label}
      size="small"
      sx={{
        ...typeStyles[keyType],
        '& .MuiChip-icon': {
          color: 'inherit',
          marginRight: 0.125,
        },
        fontSize: '0.95rem',
        height: 24,
      }}
    />
  );
};
