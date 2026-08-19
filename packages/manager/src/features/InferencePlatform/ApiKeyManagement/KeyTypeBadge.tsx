import { Lock } from '@akamai/cds-icons/react';
import { Color } from '@akamai/cds-tokens';
import { Chip } from '@linode/ui';
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
      backgroundColor: isDarkMode ? Color.Violet[90] : Color.Violet[70],
      color: Color.Neutrals.White,
    },
    user: {
      backgroundColor: isDarkMode
        ? Color.Ultramarine[40]
        : Color.Ultramarine[30],
      color: Color.Ultramarine[90],
    },
  };

  const label = keyType === 'playground' ? 'Playground' : 'User Key';

  return (
    <Chip
      icon={<Lock height={12} width={12} />}
      label={label}
      size="small"
      sx={{
        ...typeStyles[keyType],
        '& .MuiChip-icon': {
          color: 'inherit',
          marginRight: 0.125,
        },
        fontSize: '0.75rem',
        height: 24,
      }}
    />
  );
};
